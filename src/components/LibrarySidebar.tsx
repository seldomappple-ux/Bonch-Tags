import React, { useMemo, useState } from 'react'
import { Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import type { IconAsset, PartItem } from '../types/bonch'

interface LibrarySidebarProps {
  icons: IconAsset[]
  parts: PartItem[]
  iconsMap: Map<string, IconAsset>
  onAddToSheet: (iconId: string, text: string, partId?: string) => void
  onCreatePart: (part: PartItem) => void
  onDeletePart: (partId: string) => void
  onDeleteIcon: (iconId: string) => void
  onOpenIconImporter: () => void
}

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  icons,
  parts,
  iconsMap,
  onAddToSheet,
  onCreatePart,
  onDeletePart,
  onDeleteIcon,
  onOpenIconImporter,
}) => {
  const [tab, setTab] = useState<'parts' | 'icons'>('parts')
  const [search, setSearch] = useState('')
  const [addingPart, setAddingPart] = useState(false)
  const [newPartName, setNewPartName] = useState('')
  const [newPartText, setNewPartText] = useState('')
  const [newPartIconId, setNewPartIconId] = useState(icons[0]?.id || '')

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return parts
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.defaultText.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [parts, search])

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return icons
    return icons.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    )
  }, [icons, search])

  const handleSaveNewPart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartName.trim()) return
    const iconId = newPartIconId || icons[0]?.id
    if (!iconId) return
    onCreatePart({
      id: `part-${Date.now()}`,
      name: newPartName.trim(),
      category: '自定义',
      iconId,
      defaultText: newPartText.trim() || newPartName.trim(),
      createdAt: Date.now(),
    })
    setNewPartName('')
    setNewPartText('')
    setAddingPart(false)
  }

  return (
    <aside className="no-print flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-white">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 p-2">
        <div className="grid w-full grid-cols-2 rounded-lg bg-zinc-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('parts')}
            className={`rounded-md py-1.5 transition ${
              tab === 'parts' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            零件库 ({parts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('icons')}
            className={`rounded-md py-1.5 transition ${
              tab === 'icons' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            图标库 ({icons.length})
          </button>
        </div>
      </div>

      {/* Search & Primary Action */}
      <div className="space-y-2 border-b border-zinc-100 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'parts' ? '搜索零件或规格...' : '搜索矢量图标...'}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-2.5 pl-8 text-xs outline-none focus:border-zinc-900 focus:bg-white"
          />
        </div>

        {tab === 'parts' ? (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setNewPartIconId(icons[0]?.id || '')
                setAddingPart((v) => !v)
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              <Plus className="h-3.5 w-3.5" />
              新建零件
            </button>
            <button
              type="button"
              onClick={onOpenIconImporter}
              className="flex items-center justify-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
              title="导入或用 AI 生成 SVG 图标"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI 图标
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenIconImporter}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            导入 SVG / 复制 AI 规范
          </button>
        )}
      </div>

      {/* Inline New Part Form */}
      {tab === 'parts' && addingPart && (
        <form onSubmit={handleSaveNewPart} className="space-y-2 border-b border-zinc-200 bg-zinc-50 p-3">
          <div className="text-[11px] font-medium text-zinc-700">复用已有图标新建零件</div>
          <div className="grid max-h-24 grid-cols-6 gap-1 overflow-y-auto rounded border border-zinc-200 bg-white p-1.5">
            {icons.map((ic) => (
              <button
                key={ic.id}
                type="button"
                onClick={() => setNewPartIconId(ic.id)}
                title={ic.name}
                className={`flex h-8 w-8 items-center justify-center rounded border p-1 ${
                  newPartIconId === ic.id
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-transparent text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: ic.svgContent }} />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
            placeholder="零件名称（如：沉头螺丝）"
            className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
            required
          />
          <input
            type="text"
            value={newPartText}
            onChange={(e) => setNewPartText(e.target.value)}
            placeholder="标签默认文字（如：M3×8）"
            className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAddingPart(false)}
              className="rounded px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800"
            >
              保存
            </button>
          </div>
        </form>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {tab === 'parts' ? (
          <div className="space-y-1.5">
            <p className="px-1 text-[11px] text-zinc-400">点击或拖到右侧画布，可重复拖入并直接改字</p>
            {filteredParts.map((part) => {
              const icon = iconsMap.get(part.iconId)
              return (
                <div
                  key={part.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/bonch-part-id', part.id)
                  }}
                  onClick={() => onAddToSheet(part.iconId, part.defaultText, part.id)}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2 transition hover:border-zinc-400 hover:bg-zinc-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-900">
                    {icon && <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-zinc-900">{part.name}</div>
                    <div className="truncate text-[11px] text-zinc-500">
                      {part.defaultText.replace(/\n/g, ' · ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePart(part.id)
                      }}
                      className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      title="从零件库删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div>
            <p className="mb-2 px-1 text-[11px] text-zinc-400">点击任意图标直接加入当前画布</p>
            <div className="grid grid-cols-3 gap-2">
              {filteredIcons.map((icon) => (
                <div
                  key={icon.id}
                  onClick={() => onAddToSheet(icon.id, icon.name)}
                  className="group relative flex cursor-pointer flex-col items-center rounded-lg border border-zinc-200 bg-white p-2 text-center transition hover:border-zinc-900"
                >
                  <div className="h-9 w-9 text-zinc-900" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />
                  <span className="mt-1.5 w-full truncate text-[10px] font-medium text-zinc-700">
                    {icon.name}
                  </span>
                  {!icon.isBuiltIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteIcon(icon.id)
                      }}
                      className="absolute top-1 right-1 rounded bg-white/90 p-0.5 text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                      title="删除自定义图标"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
