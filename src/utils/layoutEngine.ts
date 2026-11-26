import type { BonchAppState, FontFamilyKey, PaperConfig } from '../types/bonch'

export function getEffectivePaperSize(paper: PaperConfig): { widthMm: number; heightMm: number } {
  const maxDim = Math.max(paper.widthMm, paper.heightMm)
  const minDim = Math.min(paper.widthMm, paper.heightMm)
  if (paper.orientation === 'landscape') {
    return { widthMm: maxDim, heightMm: minDim }
  }
  return { widthMm: minDim, heightMm: maxDim }
}

export function getActiveLabelSize(state: BonchAppState): { widthMm: number; heightMm: number } {
  if (state.activeSizePresetId === 'custom') {
    return {
      widthMm: Math.max(5, state.customWidthMm || 10),
      heightMm: Math.max(5, state.customHeightMm || 13),
    }
  }
  const preset = state.sizePresets.find((p) => p.id === state.activeSizePresetId)
  if (preset) {
    return { widthMm: preset.widthMm, heightMm: preset.heightMm }
  }
  return { widthMm: 10, heightMm: 13 }
}

export interface SheetGeometry {
  paperW: number
  paperH: number
  padTop: number
  padRight: number
  padBottom: number
  padLeft: number
  usableW: number
  usableH: number
  cols: number
  rows: number
  perPage: number
}

export function computeSheetGeometry(
  paper: PaperConfig,
  labelW: number,
  labelH: number,
  borderWidthMm = 0.35,
): SheetGeometry {
  const { widthMm: paperW, heightMm: paperH } = getEffectivePaperSize(paper)
  const ph = paper.preheat
  const phExtra = ph.enabled ? ph.thicknessMm + ph.offsetGapMm : 0

  const padTop =
    paper.marginTopMm + (ph.enabled && (ph.position === 'top' || ph.position === 'both') ? phExtra : 0)
  const padBottom =
    paper.marginBottomMm + (ph.enabled && (ph.position === 'bottom' || ph.position === 'both') ? phExtra : 0)
  const padLeft =
    paper.marginLeftMm + (ph.enabled && (ph.position === 'left' || ph.position === 'left-right') ? phExtra : 0)
  const padRight =
    paper.marginRightMm + (ph.enabled && ph.position === 'left-right' ? phExtra : 0)

  const usableW = Math.max(0, paperW - padLeft - padRight)
  const usableH = Math.max(0, paperH - padTop - padBottom)

  let cols = 1
  let rows = 1

  if (paper.connectedGrid) {
    const stepX = Math.max(1, labelW - borderWidthMm)
    const stepY = Math.max(1, labelH - borderWidthMm)
    cols = Math.max(1, Math.floor((usableW - borderWidthMm + 0.05) / stepX))
    rows = Math.max(1, Math.floor((usableH - borderWidthMm + 0.05) / stepY))
  } else {
    cols = Math.max(1, Math.floor((usableW + paper.gapXMm + 0.05) / (labelW + paper.gapXMm)))
    rows = Math.max(1, Math.floor((usableH + paper.gapYMm + 0.05) / (labelH + paper.gapYMm)))
  }

  return {
    paperW,
    paperH,
    padTop,
    padRight,
    padBottom,
    padLeft,
    usableW,
    usableH,
    cols,
    rows,
    perPage: cols * rows,
  }
}

export function getFontFamilyCss(key: FontFamilyKey): string {
  switch (key) {
    case 'mono':
      return '"JetBrains Mono", "Cascadia Mono", "Consolas", monospace'
    case 'rounded':
      return '"PingFang SC", "Microsoft YaHei UI", "Hiragino Sans GB", sans-serif'
    case 'bold':
      return '"Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif'
    case 'sans':
    default:
      return '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
  }
}

export function applyDynamicPrintPageSize(widthMm: number, heightMm: number, rotate90 = false): void {
  const outW = rotate90 ? heightMm : widthMm
  const outH = rotate90 ? widthMm : heightMm
  const styleId = 'bonch-dynamic-print-page'
  let el = document.getElementById(styleId) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = styleId
    document.head.appendChild(el)
  }
  // Top-level @page without !important so Chromium honors margin: 0 and suppresses date/URL/page headers
  el.textContent = `@page { size: ${outW}mm ${outH}mm; margin: 0; }`
}
