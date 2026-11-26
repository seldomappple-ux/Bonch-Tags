import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Clock,
  Download,
  FileDown,
  Printer,
  Save,
  Tag,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { HistoryDrawer } from './components/HistoryDrawer'
import { IconImporterModal } from './components/IconImporterModal'
import { InspectorPanel } from './components/InspectorPanel'
import { LibrarySidebar } from './components/LibrarySidebar'
import { PrintSheet } from './components/PrintSheet'
import type { BonchAppState, IconAsset, PartItem, SavedPrintSheet, SheetLabelInstance } from './types/bonch'
import {
  applyDynamicPrintPageSize,
  computeSheetGeometry,
  getActiveLabelSize,
} from './utils/layoutEngine'
import { downloadPdfBlob, generateExactSheetPdf, printPdfBlob } from './utils/pdfPrintEngine'
import { exportBackup, loadState, parseBackupFile, saveState } from './utils/storage'

export function App() {
  const [state, setState] = useState<BonchAppState>(() => loadState())
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number>(3.2)
  const [iconModalOpen, setIconModalOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev))
    }, 2400)
  }

  useEffect(() => {
    saveState(state)
  }, [state])

  const iconsMap = useMemo(() => {
    const map = new Map<string, IconAsset>()
    for (const ic of state.icons) map.set(ic.id, ic)
    return map
  }, [state.icons])

  const activeLabelSize = useMemo(() => getActiveLabelSize(state), [state])
  const geo = useMemo(
    () =>
      computeSheetGeometry(
        state.paper,
        activeLabelSize.widthMm,
        activeLabelSize.heightMm,
        state.style.borderWidthMm,
      ),
    [state.paper, activeLabelSize, state.style.borderWidthMm],
  )

  useEffect(() => {
    applyDynamicPrintPageSize(geo.paperW, geo.paperH, state.paper.printRotate90)
  }, [geo.paperW, geo.paperH, state.paper.printRotate90])

  useEffect(() => {
    if (geo.paperW >= 180) {
      setZoom(0.95)
    } else if (geo.paperW >= 90) {
      setZoom(1.8)
    } else {
      setZoom(3.2)
    }
  }, [state.paper.presetId])

  const selectedItem = useMemo(
    () => state.sheetItems.find((it) => it.id === selectedItemId) ?? null,
    [state.sheetItems, selectedItemId],
  )

  const addLabelToSheet = (iconId: string, text: string, partId?: string) => {
    const newItem: SheetLabelInstance = {
      id: `lbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      partId,
      iconId,
      text,
    }
    setState((prev) => ({ ...prev, sheetItems: [...prev.sheetItems, newItem] }))
    setSelectedItemId(newItem.id)
  }

  const handleDropPart = (partId: string) => {
    const part = state.parts.find((p) => p.id === partId)
    if (!part) return
    addLabelToSheet(part.iconId, part.defaultText, part.id)
  }

  const handleDropIcon = (iconId: string) => {
    const icon = iconsMap.get(iconId)
    if (!icon) return
    addLabelToSheet(icon.id, icon.name)
  }

  const updateItem = (id: string, patch: Partial<SheetLabelInstance>) => {
    setState((prev) => ({
      ...prev,
      sheetItems: prev.sheetItems.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }

  const duplicateItem = (id: string) => {
    setState((prev) => {
      const idx = prev.sheetItems.findIndex((it) => it.id === id)
      if (idx === -1) return prev
      const src = prev.sheetItems[idx]
      const copy: SheetLabelInstance = {
        ...src,
        id: `lbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }
      const next = [...prev.sheetItems]
      next.splice(idx + 1, 0, copy)
      setSelectedItemId(copy.id)
      return { ...prev, sheetItems: next }
    })
  }

  const deleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      sheetItems: prev.sheetItems.filter((it) => it.id !== id),
    }))
    if (selectedItemId === id) setSelectedItemId(null)
  }

  const moveSelected = (dir: -1 | 1) => {
    if (!selectedItemId) return
    setState((prev) => {
      const idx = prev.sheetItems.findIndex((it) => it.id === selectedItemId)
      if (idx === -1) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.sheetItems.length) return prev
      const next = [...prev.sheetItems]
      const [moved] = next.splice(idx, 1)
      next.splice(target, 0, moved)
      return { ...prev, sheetItems: next }
    })
  }

  const saveCurrentToHistory = (customTitle?: string) => {
    if (state.sheetItems.length === 0) return
    const summary = state.sheetItems
      .slice(0, 3)
      .map((i) => i.text.split('\n')[0])
      .filter(Boolean)
      .join(' / ')
    const record: SavedPrintSheet = {
      id: `hist-${Date.now()}`,
      title: customTitle || summary || `打印单 (${state.sheetItems.length}个标签)`,
      savedAt: Date.now(),
      sizePresetId: state.activeSizePresetId,
      customWidthMm: state.customWidthMm,
      customHeightMm: state.customHeightMm,
      style: { ...state.style },
      paper: { ...state.paper, preheat: { ...state.paper.preheat } },
      items: state.sheetItems.map((it) => ({ ...it })),
    }
    setState((prev) => ({
      ...prev,
      history: [record, ...prev.history].slice(0, 50),
    }))
    showToast('已保存到历史打印单')
  }

  const handlePrint = async () => {
    if (state.sheetItems.length === 0) {
      showToast('画布为空，请先从左侧添加标签')
      return
    }
    saveCurrentToHistory()
    try {
      const pdfBlob = await generateExactSheetPdf({
        paper: state.paper,
        labelW: activeLabelSize.widthMm,
        labelH: activeLabelSize.heightMm,
        styleConfig: state.style,
        items: state.sheetItems,
        iconsMap,
      })
      printPdfBlob(pdfBlob)
    } catch {
      showToast('生成打印 PDF 失败，回退至浏览器打印')
      window.print()
    }
  }

  const handleExportPdf = async () => {
    if (state.sheetItems.length === 0) {
      showToast('画布为空，请先从左侧添加标签')
      return
    }
    try {
      const pdfBlob = await generateExactSheetPdf({
        paper: state.paper,
        labelW: activeLabelSize.widthMm,
        labelH: activeLabelSize.heightMm,
        styleConfig: state.style,
        items: state.sheetItems,
        iconsMap,
      })
      downloadPdfBlob(pdfBlob, `bonch-tags-${geo.paperW}x${geo.paperH}mm.pdf`)
      showToast('已导出 1:1 精准 PDF')
    } catch {
      showToast('导出 PDF 失败')
    }
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      const res = parseBackupFile(reader.result)
      if (!res.ok) {
        showToast(res.error)
      } else {
        setState(res.state)
        setSelectedItemId(null)
        showToast('备份已成功恢复')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const isOverflow = state.sheetItems.length > geo.perPage

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 text-zinc-900">
      {/* Top Header Bar */}
      <header className="no-print flex h-13 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Tag className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900">Bonch Tags</h1>
          </div>

          <div className="h-4 w-px bg-zinc-200" />

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
              isOverflow
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-zinc-200 bg-zinc-50 text-zinc-600'
            }`}
          >
            <span className="font-mono font-medium text-zinc-900">
              {geo.paperW}×{geo.paperH}mm
            </span>
            <span>·</span>
            <span>
              单页 {geo.cols}×{geo.rows} = {geo.perPage} 格
            </span>
            <span>·</span>
            <span className={isOverflow ? 'font-semibold text-amber-700' : 'font-medium text-zinc-900'}>
              已排 {state.sheetItems.length} 个{isOverflow ? '（超出部分将截断）' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => saveCurrentToHistory()}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            title="保存当前排版到历史打印单"
          >
            <Save className="h-3.5 w-3.5" />
            存单
          </button>

          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Clock className="h-3.5 w-3.5" />
            历史 ({state.history.length})
          </button>

          <div className="mx-1 h-4 w-px bg-zinc-200" />

          <button
            type="button"
            onClick={() => {
              exportBackup(state)
              showToast('已导出本地 JSON 备份')
            }}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5" />
            备份
          </button>

          <button
            type="button"
            onClick={() => backupInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Upload className="h-3.5 w-3.5" />
            恢复
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            title="导出 1:1 精确毫米 PDF（无页眉页脚）"
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800"
          >
            <Printer className="h-3.5 w-3.5" />
            打印标签
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="no-print flex min-h-0 flex-1">
        <LibrarySidebar
          icons={state.icons}
          parts={state.parts}
          iconsMap={iconsMap}
          onAddToSheet={addLabelToSheet}
          onCreatePart={(part: PartItem) => {
            setState((prev) => ({ ...prev, parts: [part, ...prev.parts] }))
            showToast(`已添加零件「${part.name}」`)
          }}
          onDeletePart={(partId) =>
            setState((prev) => ({ ...prev, parts: prev.parts.filter((p) => p.id !== partId) }))
          }
          onDeleteIcon={(iconId) =>
            setState((prev) => ({ ...prev, icons: prev.icons.filter((i) => i.id !== iconId) }))
          }
          onOpenIconImporter={() => setIconModalOpen(true)}
        />

        {/* Center: Interactive Print Canvas */}
        <main
          onClick={() => setSelectedItemId(null)}
          className="relative flex flex-1 flex-col overflow-hidden"
          style={{
            backgroundColor: '#f4f4f5',
            backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div className="flex flex-1 items-center justify-center overflow-auto p-10">
            <div className="flex flex-col items-center gap-2">
              <div className="font-mono text-[11px] text-zinc-500">
                纸张预览：{geo.paperW} × {geo.paperH} mm（{state.paper.orientation === 'landscape' ? '横向' : '纵向'}
                {state.paper.printRotate90 ? ' · 打印旋转90°' : ''}）
              </div>
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 120ms ease-out',
                }}
              >
                <PrintSheet
                  paper={state.paper}
                  labelW={activeLabelSize.widthMm}
                  labelH={activeLabelSize.heightMm}
                  styleConfig={state.style}
                  items={state.sheetItems}
                  iconsMap={iconsMap}
                  selectedItemId={selectedItemId}
                  onSelectItem={setSelectedItemId}
                  onUpdateItemText={(id, text) => updateItem(id, { text })}
                  onDuplicateItem={duplicateItem}
                  onDeleteItem={deleteItem}
                  onDropPart={handleDropPart}
                  onDropIcon={handleDropIcon}
                />
              </div>
            </div>
          </div>

          {/* Bottom Floating Canvas Toolbar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.3).toFixed(2)))}
                className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100"
                title="缩小预览"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-11 text-center font-mono text-[11px] text-zinc-700">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(5, +(z + 0.3).toFixed(2)))}
                className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100"
                title="放大预览"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>

              <div className="h-3.5 w-px bg-zinc-200" />

              <span className="text-[11px] text-zinc-500">双击标签直接改字 · 红点表示文字溢出</span>

              <div className="h-3.5 w-px bg-zinc-200" />

              <button
                type="button"
                onClick={() => {
                  setState((prev) => ({ ...prev, sheetItems: [] }))
                  setSelectedItemId(null)
                }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-zinc-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                清空
              </button>
            </div>
          </div>
        </main>

        <InspectorPanel
          state={state}
          selectedItem={selectedItem}
          onSelectSizePreset={(presetId) => {
            const preset = state.sizePresets.find((p) => p.id === presetId)
            setState((prev) => ({
              ...prev,
              activeSizePresetId: presetId,
              style: preset
                ? {
                    ...prev.style,
                    fontSizePt: preset.defaultFontSizePt,
                    splitRatio: preset.defaultSplitRatio,
                  }
                : prev.style,
            }))
          }}
          onChangeCustomSize={(w, h) =>
            setState((prev) => ({ ...prev, customWidthMm: w, customHeightMm: h }))
          }
          onChangeStyle={(patch) =>
            setState((prev) => ({ ...prev, style: { ...prev.style, ...patch } }))
          }
          onChangePaper={(patch) =>
            setState((prev) => ({ ...prev, paper: { ...prev.paper, ...patch } }))
          }
          onChangePreheat={(patch) =>
            setState((prev) => ({
              ...prev,
              paper: { ...prev.paper, preheat: { ...prev.paper.preheat, ...patch } },
            }))
          }
          onUpdateSelectedItem={(patch) => {
            if (!selectedItemId) return
            updateItem(selectedItemId, patch)
          }}
          onMoveSelected={moveSelected}
          onDuplicateSelected={() => selectedItemId && duplicateItem(selectedItemId)}
          onDeleteSelected={() => selectedItemId && deleteItem(selectedItemId)}
        />
      </div>

      {/* Exact 1:1 Physical Millimeter Print Target */}
      <PrintSheet
        paper={state.paper}
        labelW={activeLabelSize.widthMm}
        labelH={activeLabelSize.heightMm}
        styleConfig={state.style}
        items={state.sheetItems}
        iconsMap={iconsMap}
        forPrint
      />

      <IconImporterModal
        open={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        onSave={(icon, part) => {
          setState((prev) => ({
            ...prev,
            icons: [icon, ...prev.icons],
            parts: part ? [part, ...prev.parts] : prev.parts,
          }))
          showToast(`已导入图标「${icon.name}」`)
        }}
      />

      <HistoryDrawer
        open={historyOpen}
        history={state.history}
        onClose={() => setHistoryOpen(false)}
        onRestore={(sheet) => {
          setState((prev) => ({
            ...prev,
            activeSizePresetId: sheet.sizePresetId,
            customWidthMm: sheet.customWidthMm,
            customHeightMm: sheet.customHeightMm,
            style: { ...sheet.style },
            paper: { ...sheet.paper, preheat: { ...sheet.paper.preheat } },
            sheetItems: sheet.items.map((it) => ({ ...it })),
          }))
          setSelectedItemId(null)
          showToast(`已载入「${sheet.title}」`)
        }}
        onDelete={(id) =>
          setState((prev) => ({
            ...prev,
            history: prev.history.filter((h) => h.id !== id),
          }))
        }
      />

      {toast && (
        <div className="no-print fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
