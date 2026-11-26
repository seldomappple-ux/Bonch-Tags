import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  ChevronDown,
  Contrast,
  Copy,
  Flame,
  Grid2x2,
  LayoutGrid,
  RotateCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { PAPER_PRESETS } from '../data/builtInIcons'
import type {
  BonchAppState,
  DividerStyle,
  FontFamilyKey,
  LabelStyleConfig,
  PaperConfig,
  PreheatPosition,
  SheetLabelInstance,
} from '../types/bonch'

interface InspectorPanelProps {
  state: BonchAppState
  selectedItem: SheetLabelInstance | null
  onSelectSizePreset: (presetId: string) => void
  onChangeCustomSize: (w: number, h: number) => void
  onChangeStyle: (patch: Partial<LabelStyleConfig>) => void
  onChangePaper: (patch: Partial<PaperConfig>) => void
  onChangePreheat: (patch: Partial<PaperConfig['preheat']>) => void
  onUpdateSelectedItem: (patch: Partial<SheetLabelInstance>) => void
  onMoveSelected: (dir: -1 | 1) => void
  onDuplicateSelected: () => void
  onDeleteSelected: () => void
}

const DividerIcon: React.FC<{ kind: DividerStyle }> = ({ kind }) => {
  if (kind === 'none') return <Ban className="h-3.5 w-3.5" />
  return (
    <svg viewBox="0 0 24 12" className="h-3.5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
      {kind === 'solid' && <line x1="2" y1="6" x2="22" y2="6" strokeLinecap="round" />}
      {kind === 'dashed' && <line x1="2" y1="6" x2="22" y2="6" strokeDasharray="4.5 3.5" strokeLinecap="round" />}
      {kind === 'dotted' && <line x1="3" y1="6" x2="21" y2="6" strokeDasharray="0.5 4.2" strokeLinecap="round" />}
    </svg>
  )
}

const CornerIcon: React.FC<{ radius: number }> = ({ radius }) => (
  <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2.5" y="2.5" width="13" height="13" rx={radius} />
  </svg>
)

const PreheatPosIcon: React.FC<{ pos: PreheatPosition }> = ({ pos }) => (
  <svg viewBox="0 0 20 16" className="h-3.5 w-4" fill="none">
    <rect x="1" y="1" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    {(pos === 'top' || pos === 'both') && <rect x="3" y="2.5" width="14" height="2.2" fill="currentColor" />}
    {(pos === 'bottom' || pos === 'both') && <rect x="3" y="11.3" width="14" height="2.2" fill="currentColor" />}
    {(pos === 'left' || pos === 'left-right') && <rect x="2.5" y="3" width="2.2" height="10" fill="currentColor" />}
    {pos === 'left-right' && <rect x="15.3" y="3" width="2.2" height="10" fill="currentColor" />}
  </svg>
)

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  state,
  selectedItem,
  onSelectSizePreset,
  onChangeCustomSize,
  onChangeStyle,
  onChangePaper,
  onChangePreheat,
  onUpdateSelectedItem,
  onMoveSelected,
  onDuplicateSelected,
  onDeleteSelected,
}) => {
  const { style, paper } = state
  const [openDetails, setOpenDetails] = useState(false)
  const [openPaper, setOpenPaper] = useState(false)

  const maxDim = Math.max(paper.widthMm, paper.heightMm)
  const minDim = Math.min(paper.widthMm, paper.heightMm)

  const paperSummary = `${paper.orientation === 'landscape' ? `${maxDim}×${minDim}` : `${minDim}×${maxDim}`}${
    paper.preheat.enabled ? ' · 预热' : ''
  }`

  return (
    <aside className="no-print flex h-full w-76 shrink-0 flex-col overflow-y-auto border-l border-zinc-200 bg-white">
      <div className="divide-y divide-zinc-100">
        {/* Selected Label Quick Editor (contextual, only when selected) */}
        {selectedItem && (
          <section className="bg-zinc-50/90 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-900">选中标签</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMoveSelected(-1)}
                  className="rounded border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100"
                  title="前移"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSelected(1)}
                  className="rounded border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100"
                  title="后移"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={onDuplicateSelected}
                  className="rounded border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100"
                  title="复制一张"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={onDeleteSelected}
                  className="rounded border border-zinc-200 bg-white p-1 text-red-500 hover:bg-red-50"
                  title="删除"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            <textarea
              value={selectedItem.text}
              onChange={(e) => onUpdateSelectedItem({ text: e.target.value })}
              rows={2}
              placeholder="输入标签文字（回车换行）"
              className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-zinc-900"
            />

            <div className="mt-2 flex items-center gap-2">
              <span className="shrink-0 text-[11px] text-zinc-500">单张字号</span>
              <input
                type="range"
                min={3.2}
                max={11}
                step={0.2}
                value={selectedItem.fontSizeOverridePt ?? style.fontSizePt}
                onChange={(e) => onUpdateSelectedItem({ fontSizeOverridePt: parseFloat(e.target.value) })}
                className="h-1 flex-1 accent-zinc-900"
              />
              <span className="w-9 text-right font-mono text-[10px] text-zinc-500">
                {(selectedItem.fontSizeOverridePt ?? style.fontSizePt).toFixed(1)}
              </span>
              {selectedItem.fontSizeOverridePt !== undefined && (
                <button
                  type="button"
                  onClick={() => onUpdateSelectedItem({ fontSizeOverridePt: undefined })}
                  className="text-[10px] text-zinc-400 hover:text-zinc-900"
                  title="恢复全局字号"
                >
                  重置
                </button>
              )}
            </div>
          </section>
        )}

        {/* Primary Frequent Section: Size, Typography & Visual Controls */}
        <section className="space-y-4 p-4">
          {/* Size Presets */}
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-zinc-500">标签尺寸</div>
            <div className="grid grid-cols-3 gap-1.5">
              {state.sizePresets.map((preset) => {
                const active = state.activeSizePresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectSizePreset(preset.id)}
                    className={`rounded-lg border px-2 py-1.5 text-center transition ${
                      active
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-medium">{preset.name}</div>
                    <div className={`font-mono text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {preset.widthMm}×{preset.heightMm}
                    </div>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => onSelectSizePreset('custom')}
                className={`rounded-lg border px-2 py-1.5 text-center transition ${
                  state.activeSizePresetId === 'custom'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="text-xs font-medium">自定义</div>
                <div
                  className={`font-mono text-[10px] ${
                    state.activeSizePresetId === 'custom' ? 'text-zinc-300' : 'text-zinc-400'
                  }`}
                >
                  {state.customWidthMm}×{state.customHeightMm}
                </div>
              </button>
            </div>

            {state.activeSizePresetId === 'custom' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={0.5}
                  value={state.customWidthMm}
                  onChange={(e) => onChangeCustomSize(parseFloat(e.target.value) || 10, state.customHeightMm)}
                  placeholder="宽 mm"
                  className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={0.5}
                  value={state.customHeightMm}
                  onChange={(e) => onChangeCustomSize(state.customWidthMm, parseFloat(e.target.value) || 13)}
                  placeholder="高 mm"
                  className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
              </div>
            )}
          </div>

          {/* Icon-based Divider Style */}
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-zinc-500">分隔线</div>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-zinc-100 p-0.5">
              {(
                [
                  ['solid', '实线'],
                  ['dashed', '虚线'],
                  ['dotted', '点线'],
                  ['none', '无分隔线'],
                ] as [DividerStyle, string][]
              ).map(([kind, label]) => {
                const active = style.dividerStyle === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    title={label}
                    onClick={() => onChangeStyle({ dividerStyle: kind })}
                    className={`flex h-7 items-center justify-center rounded-md transition ${
                      active
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <DividerIcon kind={kind} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Icon-based Grid Mode, Corner & Invert */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1.5 text-[11px] font-medium text-zinc-500">排版拼接</div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-0.5">
                <button
                  type="button"
                  title="无缝相连（共享边框，无白缝）"
                  onClick={() => onChangePaper({ connectedGrid: true })}
                  className={`flex h-7 items-center justify-center gap-1 rounded-md text-[11px] transition ${
                    paper.connectedGrid
                      ? 'bg-white font-medium text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Grid2x2 className="h-3.5 w-3.5" />
                  相连
                </button>
                <button
                  type="button"
                  title="独立留白间距"
                  onClick={() => onChangePaper({ connectedGrid: false })}
                  className={`flex h-7 items-center justify-center gap-1 rounded-md text-[11px] transition ${
                    !paper.connectedGrid
                      ? 'bg-white font-medium text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  留缝
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-medium text-zinc-500">圆角 / 反色</div>
              <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5">
                {[0, 0.8, 1.8].map((r) => {
                  const active = !paper.connectedGrid && Math.abs(style.borderRadiusMm - r) < 0.3
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={paper.connectedGrid}
                      title={r === 0 ? '直角' : r < 1 ? '微圆角' : '圆角'}
                      onClick={() => onChangeStyle({ borderRadiusMm: r })}
                      className={`flex h-7 flex-1 items-center justify-center rounded-md transition disabled:opacity-35 ${
                        active ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <CornerIcon radius={r === 0 ? 0 : r < 1 ? 2.5 : 5} />
                    </button>
                  )
                })}
                <button
                  type="button"
                  title="上格黑白反色"
                  onClick={() => onChangeStyle({ invertedTop: !style.invertedTop })}
                  className={`flex h-7 flex-1 items-center justify-center rounded-md transition ${
                    style.invertedTop
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Contrast className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Font, Font Size & Icon Size */}
          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[11px] text-zinc-500">字体</span>
              <select
                value={style.fontFamily}
                onChange={(e) => onChangeStyle({ fontFamily: e.target.value as FontFamilyKey })}
                className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                <option value="sans">标准黑体</option>
                <option value="bold">加粗黑体</option>
                <option value="mono">等宽编号</option>
                <option value="rounded">清晰圆体</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[11px] text-zinc-500">字号</span>
              <input
                type="range"
                min={3.2}
                max={10}
                step={0.2}
                value={style.fontSizePt}
                onChange={(e) => onChangeStyle({ fontSizePt: parseFloat(e.target.value) })}
                className="h-1 flex-1 accent-zinc-900"
              />
              <span className="w-10 text-right font-mono text-[10px] text-zinc-500">
                {style.fontSizePt.toFixed(1)}pt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[11px] text-zinc-500">图标大</span>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.02}
                value={style.iconScale}
                onChange={(e) => onChangeStyle({ iconScale: parseFloat(e.target.value) })}
                className="h-1 flex-1 accent-zinc-900"
              />
              <span className="w-10 text-right font-mono text-[10px] text-zinc-500">
                {Math.round(style.iconScale * 100)}%
              </span>
            </div>
          </div>
        </section>

        {/* Collapsible Accordion 1: Line Widths & Split Ratio */}
        <section>
          <button
            type="button"
            onClick={() => setOpenDetails((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-zinc-50"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-800">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              线宽与比例微调
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-zinc-400">
                {style.borderWidthMm.toFixed(2)}mm
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  openDetails ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>

          {openDetails && (
            <div className="space-y-2.5 px-4 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-zinc-500">外框线宽</span>
                <input
                  type="range"
                  min={0.15}
                  max={0.9}
                  step={0.05}
                  value={style.borderWidthMm}
                  onChange={(e) => onChangeStyle({ borderWidthMm: parseFloat(e.target.value) })}
                  className="h-1 flex-1 accent-zinc-900"
                />
                <span className="w-10 text-right font-mono text-[10px] text-zinc-500">
                  {style.borderWidthMm.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-zinc-500">分隔线宽</span>
                <input
                  type="range"
                  min={0.1}
                  max={0.7}
                  step={0.05}
                  value={style.dividerWidthMm}
                  onChange={(e) => onChangeStyle({ dividerWidthMm: parseFloat(e.target.value) })}
                  className="h-1 flex-1 accent-zinc-900"
                />
                <span className="w-10 text-right font-mono text-[10px] text-zinc-500">
                  {style.dividerWidthMm.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-zinc-500">上格占比</span>
                <input
                  type="range"
                  min={0.35}
                  max={0.68}
                  step={0.02}
                  value={style.splitRatio}
                  onChange={(e) => onChangeStyle({ splitRatio: parseFloat(e.target.value) })}
                  className="h-1 flex-1 accent-zinc-900"
                />
                <span className="w-10 text-right font-mono text-[10px] text-zinc-500">
                  {Math.round(style.splitRatio * 100)}%
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Collapsible Accordion 2: Paper & Thermal Pre-heat (Set once, tuck away!) */}
        <section>
          <button
            type="button"
            onClick={() => setOpenPaper((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-zinc-50"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-800">
              <Flame className="h-3.5 w-3.5 text-zinc-400" />
              纸张与预热条
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                {paperSummary}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  openPaper ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>

          {openPaper && (
            <div className="space-y-3 px-4 pb-4">
              <select
                value={paper.presetId}
                onChange={(e) => {
                  const id = e.target.value
                  const found = PAPER_PRESETS.find((p) => p.id === id)
                  if (found && id !== 'custom') {
                    onChangePaper({ presetId: id, widthMm: found.widthMm, heightMm: found.heightMm })
                  } else {
                    onChangePaper({ presetId: 'custom' })
                  }
                }}
                className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-zinc-900"
              >
                {PAPER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => onChangePaper({ orientation: 'landscape' })}
                  className={`rounded-md py-1 transition ${
                    paper.orientation === 'landscape'
                      ? 'bg-white font-medium text-zinc-900 shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  横向 {maxDim}×{minDim}
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaper({ orientation: 'portrait' })}
                  className={`rounded-md py-1 transition ${
                    paper.orientation === 'portrait'
                      ? 'bg-white font-medium text-zinc-900 shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  纵向 {minDim}×{maxDim}
                </button>
              </div>

              {paper.presetId === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={paper.widthMm}
                    onChange={(e) => onChangePaper({ widthMm: parseFloat(e.target.value) || 60 })}
                    placeholder="纸宽 mm"
                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                  />
                  <input
                    type="number"
                    min={15}
                    max={400}
                    value={paper.heightMm}
                    onChange={(e) => onChangePaper({ heightMm: parseFloat(e.target.value) || 40 })}
                    placeholder="纸高 mm"
                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] text-zinc-500">页边距 (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={paper.marginTopMm}
                    onChange={(e) => {
                      const m = Math.max(0, parseFloat(e.target.value) || 0)
                      onChangePaper({ marginTopMm: m, marginRightMm: m, marginBottomMm: m, marginLeftMm: m })
                    }}
                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-zinc-500">留缝间距 (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    disabled={paper.connectedGrid}
                    value={paper.connectedGrid ? 0 : paper.gapXMm}
                    onChange={(e) => {
                      const g = Math.max(0, parseFloat(e.target.value) || 0)
                      onChangePaper({ gapXMm: g, gapYMm: g })
                    }}
                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-400"
                  />
                </div>
              </div>

              {/* Pre-heat Strip Controls */}
              <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                <label className="flex cursor-pointer items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800">预热引导条</span>
                  <input
                    type="checkbox"
                    checked={paper.preheat.enabled}
                    onChange={(e) => onChangePreheat({ enabled: e.target.checked })}
                    className="h-3.5 w-3.5 accent-zinc-900"
                  />
                </label>

                {paper.preheat.enabled && (
                  <>
                    <div className="grid grid-cols-5 gap-1 rounded-md bg-zinc-200/70 p-0.5">
                      {(
                        [
                          ['top', '顶部'],
                          ['both', '上下两端'],
                          ['bottom', '底部'],
                          ['left', '左侧'],
                          ['left-right', '左右两端'],
                        ] as [PreheatPosition, string][]
                      ).map(([pos, tip]) => (
                        <button
                          key={pos}
                          type="button"
                          title={tip}
                          onClick={() => onChangePreheat({ position: pos })}
                          className={`flex h-6 items-center justify-center rounded transition ${
                            paper.preheat.position === pos
                              ? 'bg-white text-zinc-900 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          <PreheatPosIcon pos={pos} />
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="grid grid-cols-2 gap-0.5 rounded bg-zinc-200/70 p-0.5">
                        <button
                          type="button"
                          title="实心黑条"
                          onClick={() => onChangePreheat({ pattern: 'solid' })}
                          className={`flex items-center justify-center rounded ${
                            paper.preheat.pattern === 'solid' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                          }`}
                        >
                          <DividerIcon kind="solid" />
                        </button>
                        <button
                          type="button"
                          title="间断黑条"
                          onClick={() => onChangePreheat({ pattern: 'dashed' })}
                          className={`flex items-center justify-center rounded ${
                            paper.preheat.pattern === 'dashed' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                          }`}
                        >
                          <DividerIcon kind="dashed" />
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0.5}
                        max={4}
                        step={0.2}
                        title="预热条宽 (mm)"
                        value={paper.preheat.thicknessMm}
                        onChange={(e) =>
                          onChangePreheat({ thicknessMm: Math.max(0.4, parseFloat(e.target.value) || 1.2) })
                        }
                        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                      />
                      <input
                        type="number"
                        min={0.5}
                        max={6}
                        step={0.5}
                        title="与标签间距 (mm)"
                        value={paper.preheat.offsetGapMm}
                        onChange={(e) =>
                          onChangePreheat({ offsetGapMm: Math.max(0.5, parseFloat(e.target.value) || 1.5) })
                        }
                        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                      />
                    </div>
                  </>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-3 w-3" />
                  输出旋转 90°
                </span>
                <input
                  type="checkbox"
                  checked={paper.printRotate90}
                  onChange={(e) => onChangePaper({ printRotate90: e.target.checked })}
                  className="h-3.5 w-3.5 accent-zinc-900"
                />
              </label>
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}
