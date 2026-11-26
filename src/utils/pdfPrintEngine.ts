import type { IconAsset, LabelStyleConfig, PaperConfig, SheetLabelInstance } from '../types/bonch'
import { computeSheetGeometry, getFontFamilyCss } from './layoutEngine'

const MM_TO_PT = 72 / 25.4
const PRINT_DPI = 600
const PX_PER_MM = PRINT_DPI / 25.4

function loadSvgAsImage(svgString: string, color: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Replace currentColor with explicit hex color for standalone Image rendering
    const colored = svgString.replace(/currentColor/g, color)
    const blob = new Blob([colored], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const cleaned = text.replace(/\n+$/, '')
  const result: string[] = []
  const paragraphs = cleaned.split('\n')
  for (const para of paragraphs) {
    if (!para) {
      result.push('')
      continue
    }
    let current = ''
    for (const ch of Array.from(para)) {
      const test = current + ch
      if (ctx.measureText(test).width > maxWidth && current.length > 0) {
        result.push(current)
        current = ch
      } else {
        current = test
      }
    }
    if (current) result.push(current)
  }
  return result
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Wraps a JPEG byte array into a minimal, 100% standards-compliant single-page PDF 1.4
 * with exact physical millimeter MediaBox — completely eliminating browser headers/footers.
 */
function buildSinglePagePdfFromJpeg(
  jpegBytes: Uint8Array,
  imgWidthPx: number,
  imgHeightPx: number,
  pageWidthMm: number,
  pageHeightMm: number,
): Blob {
  const wPt = +(pageWidthMm * MM_TO_PT).toFixed(3)
  const hPt = +(pageHeightMm * MM_TO_PT).toFixed(3)
  const enc = new TextEncoder()

  const chunks: Uint8Array[] = []
  const offsets: number[] = [0]
  let cursor = 0

  const pushStr = (s: string) => {
    const b = enc.encode(s)
    chunks.push(b)
    cursor += b.length
  }
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b)
    cursor += b.length
  }

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')

  // 1: Catalog
  offsets.push(cursor)
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  // 2: Pages
  offsets.push(cursor)
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  // 3: Page
  offsets.push(cursor)
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  )

  // 4: Image XObject (JPEG)
  offsets.push(cursor)
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  )
  pushBytes(jpegBytes)
  pushStr('\nendstream\nendobj\n')

  // 5: Content stream placing image edge-to-edge on exact MediaBox
  const contentStream = `q\n${wPt} 0 0 ${hPt} 0 0 cm\n/Im0 Do\nQ\n`
  offsets.push(cursor)
  pushStr(`5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`)

  // XRef table
  const xrefOffset = cursor
  pushStr(`xref\n0 6\n0000000000 65535 f \n`)
  for (let i = 1; i <= 5; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`)
  }
  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  const totalLen = chunks.reduce((acc, c) => acc + c.length, 0)
  const merged = new Uint8Array(totalLen)
  let pos = 0
  for (const c of chunks) {
    merged.set(c, pos)
    pos += c.length
  }
  return new Blob([merged], { type: 'application/pdf' })
}

export async function generateExactSheetPdf(params: {
  paper: PaperConfig
  labelW: number
  labelH: number
  styleConfig: LabelStyleConfig
  items: SheetLabelInstance[]
  iconsMap: Map<string, IconAsset>
}): Promise<Blob> {
  const { paper, labelW, labelH, styleConfig, items, iconsMap } = params
  const geo = computeSheetGeometry(paper, labelW, labelH, styleConfig.borderWidthMm)

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(geo.paperW * PX_PER_MM)
  canvas.height = Math.round(geo.paperH * PX_PER_MM)
  const ctx = canvas.getContext('2d')!

  // Pure white sheet background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Apply optional printer calibration X/Y offset (0,0 by default for standard A4 printers)
  const oxPx = (paper.offsetXMm || 0) * PX_PER_MM
  const oyPx = (paper.offsetYMm || 0) * PX_PER_MM
  ctx.save()
  ctx.translate(oxPx, oyPx)

  // Draw Pre-heat bars
  const ph = paper.preheat
  if (ph.enabled) {
    ctx.fillStyle = '#000000'
    const drawBar = (xMm: number, yMm: number, wMm: number, hMm: number, horizontal: boolean) => {
      const x = xMm * PX_PER_MM
      const y = yMm * PX_PER_MM
      const w = wMm * PX_PER_MM
      const h = hMm * PX_PER_MM
      if (ph.pattern === 'solid') {
        ctx.fillRect(x, y, w, h)
      } else {
        const dash = 2.2 * PX_PER_MM
        const gap = 1.4 * PX_PER_MM
        if (horizontal) {
          for (let cx = x; cx < x + w; cx += dash + gap) {
            ctx.fillRect(cx, y, Math.min(dash, x + w - cx), h)
          }
        } else {
          for (let cy = y; cy < y + h; cy += dash + gap) {
            ctx.fillRect(x, cy, w, Math.min(dash, y + h - cy))
          }
        }
      }
    }

    const barW = Math.max(0, geo.paperW - paper.marginLeftMm - paper.marginRightMm)
    const barH = Math.max(0, geo.paperH - paper.marginTopMm - paper.marginBottomMm)

    if (ph.position === 'top' || ph.position === 'both') {
      drawBar(paper.marginLeftMm, paper.marginTopMm, barW, ph.thicknessMm, true)
    }
    if (ph.position === 'bottom' || ph.position === 'both') {
      drawBar(paper.marginLeftMm, geo.paperH - paper.marginBottomMm - ph.thicknessMm, barW, ph.thicknessMm, true)
    }
    if (ph.position === 'left' || ph.position === 'left-right') {
      drawBar(paper.marginLeftMm, paper.marginTopMm, ph.thicknessMm, barH, false)
    }
    if (ph.position === 'left-right') {
      drawBar(geo.paperW - paper.marginRightMm - ph.thicknessMm, paper.marginTopMm, ph.thicknessMm, barH, false)
    }
  }

  // Preload unique SVG icons needed for this sheet
  const iconColor = styleConfig.invertedTop ? '#ffffff' : '#000000'
  const uniqueIconIds = Array.from(new Set(items.map((it) => it.iconId)))
  const loadedImages = new Map<string, HTMLImageElement>()
  await Promise.all(
    uniqueIconIds.map(async (id) => {
      const asset = iconsMap.get(id)
      if (!asset) return
      try {
        const img = await loadSvgAsImage(asset.svgContent, iconColor)
        loadedImages.set(id, img)
      } catch {
        // Ignore broken icon
      }
    }),
  )

  const bwPx = styleConfig.borderWidthMm * PX_PER_MM
  const dwPx = styleConfig.dividerWidthMm * PX_PER_MM
  const radiusPx = paper.connectedGrid ? 0 : styleConfig.borderRadiusMm * PX_PER_MM

  const stepXMm = paper.connectedGrid ? labelW - styleConfig.borderWidthMm : labelW + paper.gapXMm
  const stepYMm = paper.connectedGrid ? labelH - styleConfig.borderWidthMm : labelH + paper.gapYMm

  const fontWeight =
    styleConfig.fontFamily === 'bold'
      ? 700
      : styleConfig.fontWeight === 'bold'
        ? 700
        : styleConfig.fontWeight === 'medium'
          ? 500
          : 400
  const fontFamily = getFontFamilyCss(styleConfig.fontFamily)

  // Draw each label at exact physical mm coordinates
  const visibleItems = items.slice(0, geo.perPage)
  visibleItems.forEach((item, index) => {
    const col = index % geo.cols
    const row = Math.floor(index / geo.cols)
    const xMm = geo.padLeft + col * stepXMm
    const yMm = geo.padTop + row * stepYMm

    const x = xMm * PX_PER_MM
    const y = yMm * PX_PER_MM
    const w = labelW * PX_PER_MM
    const h = labelH * PX_PER_MM

    const topH = h * styleConfig.splitRatio
    const bottomH = h - topH

    ctx.save()
    drawRoundedRectPath(ctx, x + bwPx / 2, y + bwPx / 2, w - bwPx, h - bwPx, radiusPx)
    ctx.clip()

    // Inverted top fill
    if (styleConfig.invertedTop) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, y, w, topH)
    }

    // Icon in top box
    const img = loadedImages.get(item.iconId)
    if (img) {
      const innerPad = 0.35 * PX_PER_MM + bwPx
      const availW = Math.max(1, (w - innerPad * 2) * styleConfig.iconScale)
      const availH = Math.max(1, (topH - innerPad * 2) * styleConfig.iconScale)
      const side = Math.min(availW, availH)
      const ix = x + (w - side) / 2
      const iy = y + (topH - side) / 2
      ctx.drawImage(img, ix, iy, side, side)
    }

    // Divider line
    if (styleConfig.dividerStyle !== 'none') {
      ctx.save()
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = dwPx
      if (styleConfig.dividerStyle === 'dashed') {
        ctx.setLineDash([dwPx * 3.5, dwPx * 2.5])
      } else if (styleConfig.dividerStyle === 'dotted') {
        ctx.setLineDash([dwPx * 1.2, dwPx * 2])
      }
      ctx.beginPath()
      ctx.moveTo(x, y + topH)
      ctx.lineTo(x + w, y + topH)
      ctx.stroke()
      ctx.restore()
    }

    // Bottom text (clipped cleanly to bottom cell)
    ctx.save()
    ctx.beginPath()
    ctx.rect(x + bwPx, y + topH + dwPx / 2, w - bwPx * 2, bottomH - bwPx - dwPx / 2)
    ctx.clip()

    const fontSizePt = item.fontSizeOverridePt ?? styleConfig.fontSizePt
    const fontSizePx = (fontSizePt / 72) * PRINT_DPI
    const lineHeightPx = fontSizePx * 1.15
    ctx.fillStyle = '#000000'
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const textPadX = 0.45 * PX_PER_MM + bwPx
    const lines = wrapTextLines(ctx, item.text || '', Math.max(4, w - textPadX * 2))
    const totalTextH = lines.length * lineHeightPx
    const startY = y + topH + (bottomH - totalTextH) / 2 + lineHeightPx / 2

    lines.forEach((line, li) => {
      ctx.fillText(line, x + w / 2, startY + li * lineHeightPx)
    })
    ctx.restore()

    ctx.restore()

    // Outer border stroke
    ctx.save()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = bwPx
    drawRoundedRectPath(ctx, x + bwPx / 2, y + bwPx / 2, w - bwPx, h - bwPx, radiusPx)
    ctx.stroke()
    ctx.restore()
  })

  ctx.restore() // end printer calibration offset

  // Optional 90-degree rotation for sideways-feeding printers
  let outputCanvas = canvas
  let outWMm = geo.paperW
  let outHMm = geo.paperH

  if (paper.printRotate90) {
    const rot = document.createElement('canvas')
    rot.width = canvas.height
    rot.height = canvas.width
    const rctx = rot.getContext('2d')!
    rctx.fillStyle = '#ffffff'
    rctx.fillRect(0, 0, rot.width, rot.height)
    rctx.translate(rot.width, 0)
    rctx.rotate(Math.PI / 2)
    rctx.drawImage(canvas, 0, 0)
    outputCanvas = rot
    outWMm = geo.paperH
    outHMm = geo.paperW
  }

  // Export crisp high-quality JPEG into exact-mm PDF
  const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.98)
  const base64 = dataUrl.split(',')[1]
  const binStr = atob(base64)
  const jpegBytes = new Uint8Array(binStr.length)
  for (let i = 0; i < binStr.length; i++) {
    jpegBytes[i] = binStr.charCodeAt(i)
  }

  return buildSinglePagePdfFromJpeg(jpegBytes, outputCanvas.width, outputCanvas.height, outWMm, outHMm)
}

export function printPdfBlob(pdfBlob: Blob): void {
  const url = URL.createObjectURL(pdfBlob)
  const existing = document.getElementById('bonch-pdf-print-frame')
  if (existing) existing.remove()

  const iframe = document.createElement('iframe')
  iframe.id = 'bonch-pdf-print-frame'
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  iframe.src = url

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        // Fallback: open PDF directly in new tab if browser restricts iframe print
        window.open(url, '_blank')
      }
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 60_000)
    }, 150)
  }

  document.body.appendChild(iframe)
}

export function downloadPdfBlob(pdfBlob: Blob, filename = 'bonch-tags-sheet.pdf'): void {
  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
