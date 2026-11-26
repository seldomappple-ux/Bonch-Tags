import React from 'react'
import { Clock, RotateCcw, Trash2, X } from 'lucide-react'
import type { SavedPrintSheet } from '../types/bonch'

interface HistoryDrawerProps {
  open: boolean
  history: SavedPrintSheet[]
  onClose: () => void
  onRestore: (sheet: SavedPrintSheet) => void
  onDelete: (id: string) => void
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  open,
  history,
  onClose,
  onRestore,
  onDelete,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-900" />
            <h2 className="text-sm font-semibold text-zinc-900">历史打印单 ({history.length})</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 text-center">
              <p className="text-xs font-medium text-zinc-500">暂无保存的打印单</p>
              <p className="mt-1 text-[11px] text-zinc-400">点击顶部「存单」或「打印」后会自动归档到这里</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((sheet) => (
                <div
                  key={sheet.id}
                  className="rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-900">{sheet.title}</h3>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {new Date(sheet.savedAt).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {sheet.items.length} 个标签 · 纸张 {sheet.paper.widthMm}×{sheet.paper.heightMm}mm
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onRestore(sheet)
                          onClose()
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100"
                      >
                        <RotateCcw className="h-3 w-3" />
                        载入
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(sheet.id)}
                        className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                        title="删除记录"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sheet.items.slice(0, 8).map((it) => (
                      <span
                        key={it.id}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-700"
                      >
                        {it.text.replace(/\n/g, ' / ') || '无字'}
                      </span>
                    ))}
                    {sheet.items.length > 8 && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                        +{sheet.items.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
