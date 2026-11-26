import React, { useState } from 'react'
import { Check, Copy, Sparkles, Upload, X } from 'lucide-react'
import type { IconAsset, PartItem } from '../types/bonch'
import { AI_SVG_SPEC_PROMPT, normalizeSvg } from '../utils/svgUtils'

interface IconImporterModalProps {
  open: boolean
  onClose: () => void
  onSave: (icon: IconAsset, alsoCreatePart?: PartItem) => void
}

export const IconImporterModal: React.FC<IconImporterModalProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('自定义')
  const [rawSvg, setRawSvg] = useState('')
  const [alsoPart, setAlsoPart] = useState(true)
  const [defaultText, setDefaultText] = useState('')
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const parsed = rawSvg.trim() ? normalizeSvg(rawSvg) : null

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_SVG_SPEC_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!name) {
      setName(file.name.replace(/\.svg$/i, ''))
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawSvg(reader.result)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsed || !parsed.ok) return
    const finalName = name.trim() || '未命名图标'
    const iconId = `icon-${Date.now()}`
    const icon: IconAsset = {
      id: iconId,
      name: finalName,
      category: category.trim() || '自定义',
      svgContent: parsed.svg,
      createdAt: Date.now(),
    }
    const part: PartItem | undefined = alsoPart
      ? {
          id: `part-${Date.now()}`,
          name: finalName,
          category: category.trim() || '自定义',
          iconId,
          defaultText: defaultText.trim() || finalName,
          createdAt: Date.now(),
        }
      : undefined

    onSave(icon, part)
    setName('')
    setRawSvg('')
    setDefaultText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-zinc-900" />
            <h2 className="text-sm font-semibold text-zinc-900">导入 SVG 图标 / AI 画图规范</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* AI Prompt Copy Banner */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
            <div className="text-xs text-zinc-600">
              <p className="font-medium text-zinc-900">用 AI 生成统一风格的黑白矢量图标</p>
              <p className="mt-0.5 text-zinc-500">复制标准规范发给任意 AI，拿到 SVG 代码后直接粘贴到下方。</p>
            </div>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs transition hover:bg-zinc-100"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? '已复制规范' : '复制 AI 规范'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700">图标名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：电感 / 沉头螺丝"
                className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-900"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700">分类</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="电子元件 / 紧固件"
                className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700">粘贴 SVG 代码 或 上传文件</label>
              <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900">
                <Upload className="h-3.5 w-3.5" />
                选择 .svg 文件
                <input type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={rawSvg}
              onChange={(e) => setRawSvg(e.target.value)}
              rows={5}
              placeholder='<svg viewBox="0 0 64 64" ...>...</svg>'
              className="w-full rounded-md border border-zinc-300 p-2.5 font-mono text-[11px] outline-none focus:border-zinc-900"
            />
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-zinc-900 bg-white p-2 text-black">
              {parsed && parsed.ok ? (
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: parsed.svg }} />
              ) : (
                <span className="text-[10px] text-zinc-400">预览</span>
              )}
            </div>
            <div className="flex-1 text-xs">
              {parsed && !parsed.ok ? (
                <p className="text-red-600">{parsed.error}</p>
              ) : parsed && parsed.ok ? (
                <p className="text-emerald-700">SVG 校验通过，已自动统一为纯黑白矢量格式。</p>
              ) : (
                <p className="text-zinc-500">粘贴 AI 输出的 SVG 代码后，这里会实时显示缩小打印效果。</p>
              )}

              <div className="mt-2 flex items-center gap-2">
                <input
                  id="also-create-part"
                  type="checkbox"
                  checked={alsoPart}
                  onChange={(e) => setAlsoPart(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 accent-zinc-900"
                />
                <label htmlFor="also-create-part" className="text-zinc-700">
                  同时加入左侧「零件库」
                </label>
                {alsoPart && (
                  <input
                    type="text"
                    value={defaultText}
                    onChange={(e) => setDefaultText(e.target.value)}
                    placeholder="默认文字（可选）"
                    className="ml-auto w-32 rounded border border-zinc-300 bg-white px-2 py-0.5 text-xs outline-none focus:border-zinc-900"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!parsed || !parsed.ok}
              className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              保存到图标库
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
