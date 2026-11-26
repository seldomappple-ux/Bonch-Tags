import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
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
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})
  const [addingPart, setAddingPart] = useState(false)
  const [newPartName, setNewPartName] = useState('')
  const [newPartCategory, setNewPartCategory] = useState('紧固件')
  const [newPartText, setNewPartText] = useState('')
  const [newPartIconId, setNewPartIconId] = useState(icons[0]?.id || '')

  const partCategories = useMemo(() => {
    const cats = Array.from(new Set(parts.map((p) => p.category || '未分类')))
    return ['全部', ...cats]
  }, [parts])

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return parts.filter((p) => {
      if (activeCategory !== '全部' && (p.category || '未分类') !== activeCategory) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.defaultText.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
  }, [parts, search, activeCategory])

  const groupedParts = useMemo(() => {
    const map = new Map<string, PartItem[]>()
    for (const part of filteredParts) {
      const cat = part.category || '未分类'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(part)
    }
    return Array.from(map.entries())
  }, [filteredParts])

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return icons
    return icons.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    )
  }, [icons, search])

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const handleSaveNewPart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartName.trim()) return
    const iconId = newPartIconId || icons[0]?.id
    if (!iconId) return
    onCreatePart({
      id: `part-${Date.now()}`,
      name: newPartName.trim(),
      category: newPartCategory.trim() || '自定义',
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
            placeholder={tab === 'parts' ? '搜索零件、分类或规格...' : '搜索矢量图标...'}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-2.5 pl-8 text-xs outline-none focus:border-zinc-900 focus:bg-white"
          />
        </div>

        {tab === 'parts' ? (
          <>
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

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {partCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                    activeCategory === cat
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
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
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="零件名称"
              className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              required
            />
            <input
              type="text"
              value={newPartCategory}
              onChange={(e) => setNewPartCategory(e.target.value)}
              placeholder="分类（如：紧固件）"
              className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
            />
          </div>
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
          <div className="space-y-3">
            <p className="px-1 text-[11px] text-zinc-400">支持点击或直接拖入右侧画布</p>
            {groupedParts.map(([category, items]) => {
              const isCollapsed = !!collapsedCategories[category]
              return (
                <div key={category} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between rounded px-1 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100"
                  >
                    <span className="flex items-center gap-1">
                      {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {category}
                    </span>
                    <span className="font-mono text-[10px] font-normal text-zinc-400">{items.length}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1.5">
                      {items.map((part) => {
                        const icon = iconsMap.get(part.iconId)
                        return (
                          <div
                            key={part.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/bonch-part-id', part.id)
                            }}
                            onClick={() => onAddToSheet(part.iconId, part.defaultText, part.id)}
                            className="group flex cursor-grab items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2 transition hover:border-zinc-400 hover:bg-zinc-50 active:cursor-grabbing"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-1 text-zinc-900">
                              {icon && (
                                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-zinc-900">{part.name}</div>
                              <div className="truncate text-[11px] text-zinc-500">
                                {part.defaultText.replace(/\n/g, ' · ')}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeletePart(part.id)
                              }}
                              className="rounded p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                              title="从零件库删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div>
            <p className="mb-2 px-1 text-[11px] text-zinc-400">支持点击或直接拖入右侧画布</p>
            <div className="grid grid-cols-3 gap-2">
              {filteredIcons.map((icon) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/bonch-icon-id', icon.id)
                  }}
                  onClick={() => onAddToSheet(icon.id, icon.name)}
                  className="group relative flex cursor-grab flex-col items-center rounded-lg border border-zinc-200 bg-white p-2 text-center transition hover:border-zinc-900 active:cursor-grabbing"
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
