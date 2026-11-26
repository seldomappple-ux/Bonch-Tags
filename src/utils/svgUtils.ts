export const AI_SVG_SPEC_PROMPT = `请帮我画一个用于 10×13mm 小标签黑白打印的极简矢量 SVG 图标，主题是：【在这里填入零件名称，例如：Type-C母座 / M3沉头螺丝 / 电容】。

必须严格遵守以下规范：
1. 画布尺寸：viewBox="0 0 64 64"，不要写死过大宽高，无任何背景矩形（透明底）。
2. 颜色风格：纯黑白线条风，使用 stroke="currentColor"、fill="none"（少量实心点可用 fill="currentColor"），不要使用灰色、渐变或阴影。
3. 线条粗细：统一 stroke-width="3"，stroke-linecap="round"，stroke-linejoin="round"。
4. 视觉比例：图形主体居中，四周留出约 8px 安全边距，结构简洁明快，缩小到 8mm 打印时依然清晰不糊。
5. 只输出纯 <svg>...</svg> 代码，不要附带文字说明。`

export function normalizeSvg(rawInput: string): { ok: true; svg: string } | { ok: false; error: string } {
  const trimmed = rawInput
    .replace(/^```(?:svg|xml|html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const match = trimmed.match(/<svg[\s\S]*?<\/svg>/i)
  if (!match) {
    return { ok: false, error: '未检测到有效的 <svg>...</svg> 代码，请确认粘贴内容完整。' }
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(match[0], 'image/svg+xml')
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      return { ok: false, error: 'SVG 语法解析失败，请检查标签是否闭合。' }
    }

    const svgEl = doc.querySelector('svg')
    if (!svgEl) {
      return { ok: false, error: '未找到 SVG 根节点。' }
    }

    // Security sanitization: remove scripts and inline event handlers
    svgEl.querySelectorAll('script, foreignObject').forEach((el) => el.remove())
    svgEl.querySelectorAll('*').forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name)
        }
      }
      // Remove full-canvas white background rectangles if AI generated one
      if (el.tagName.toLowerCase() === 'rect') {
        const fill = (el.getAttribute('fill') || '').toLowerCase()
        if (fill === '#fff' || fill === '#ffffff' || fill === 'white') {
          const w = el.getAttribute('width')
          const h = el.getAttribute('height')
          if (w === '100%' || w === '64' || h === '100%' || h === '64') {
            el.remove()
            return
          }
        }
      }
      // Normalize pure black strokes/fills to currentColor so inverted mode works cleanly
      const stroke = (el.getAttribute('stroke') || '').toLowerCase()
      if (stroke === '#000' || stroke === '#000000' || stroke === 'black') {
        el.setAttribute('stroke', 'currentColor')
      }
      const fill = (el.getAttribute('fill') || '').toLowerCase()
      if (fill === '#000' || fill === '#000000' || fill === 'black') {
        el.setAttribute('fill', 'currentColor')
      }
    })

    if (!svgEl.getAttribute('viewBox')) {
      const w = parseFloat(svgEl.getAttribute('width') || '64') || 64
      const h = parseFloat(svgEl.getAttribute('height') || '64') || 64
      svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`)
    }

    svgEl.setAttribute('width', '100%')
    svgEl.setAttribute('height', '100%')
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    const serializer = new XMLSerializer()
    return { ok: true, svg: serializer.serializeToString(svgEl) }
  } catch {
    return { ok: false, error: '解析 SVG 时发生未知错误。' }
  }
}
