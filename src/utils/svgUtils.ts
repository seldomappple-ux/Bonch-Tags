export const AI_SVG_SPEC_PROMPT = `请帮我画一个用于 10×13mm 小标签黑白打印的极简矢量 SVG 图标，主题是：【在这里填入零件名称，例如：Type-C母座 / 六角螺母 / 沉头螺丝】。

必须严格遵守以下规范：
1. 画布尺寸：viewBox="0 0 64 64"，透明底，不要画任何白色或黑色背景矩形。
2. 视觉风格：【实心黑白剪影 / 粗黑块风格】，以大块面 fill="currentColor" 为主，内部细节用镂空留白（evenodd）表现，不要用细线条或复杂细节。
3. 颜色限制：只使用纯黑（currentColor），严禁灰色、渐变、阴影。
4. 比例留白：图形主体饱满居中，四周留出约 6px 边距，缩小到 6~8mm 打印时依然一眼能认出。
5. 只输出纯 <svg>...</svg> 代码，不要附带任何解释文字。`

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

    svgEl.querySelectorAll('script, foreignObject').forEach((el) => el.remove())
    svgEl.querySelectorAll('*').forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name)
        }
      }
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
