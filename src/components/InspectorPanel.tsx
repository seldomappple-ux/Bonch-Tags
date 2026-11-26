import React from 'react'
import { ArrowLeft, ArrowRight, Copy, Flame, Trash2 } from 'lucide-react'
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

  return (
    <aside className="no-print flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-zinc-200 bg-white">
      <div className="divide-y divide-zinc-200">
        {/* Selected Label Quick Editor */}
        {selectedItem && (
          <section className="bg-zinc-50/80 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900">当前选中标签</h3>
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

            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-600">
                  标签文字（支持换行，可直接改规格）
                </label>
                <textarea
                  value={selectedItem.text}
                  onChange={(e) => onUpdateSelectedItem({ text: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-xs outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-600">单张字号微调</label>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {(selectedItem.fontSizeOverridePt ?? style.fontSizePt).toFixed(1)} pt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={3.5}
                    max={11}
                    step={0.2}
                    value={selectedItem.fontSizeOverridePt ?? style.fontSizePt}
                    onChange={(e) => onUpdateSelectedItem({ fontSizeOverridePt: parseFloat(e.target.value) })}
                    className="h-1.5 flex-1 accent-zinc-900"
                  />
                  {selectedItem.fontSizeOverridePt !== undefined && (
                    <button
                      type="button"
                      onClick={() => onUpdateSelectedItem({ fontSizeOverridePt: undefined })}
                      className="text-[10px] text-zinc-500 underline hover:text-zinc-900"
                    >
                      恢复默认
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Label Size */}
        <section className="p-4">
          <h3 className="mb-2.5 text-xs font-semibold text-zinc-900">标签尺寸</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {state.sizePresets.map((preset) => {
              const active = state.activeSizePresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectSizePreset(preset.id)}
                  className={`rounded-lg border px-2 py-2 text-left transition ${
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="text-xs font-semibold">{preset.name}</div>
                  <div className={`mt-0.5 font-mono text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {preset.widthMm}×{preset.heightMm}mm
                  </div>
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => onSelectSizePreset('custom')}
              className={`rounded-lg border px-2 py-2 text-left transition ${
                state.activeSizePresetId === 'custom'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
              }`}
            >
              <div className="text-xs font-semibold">自定义</div>
              <div
                className={`mt-0.5 font-mono text-[10px] ${
                  state.activeSizePresetId === 'custom' ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                {state.customWidthMm}×{state.customHeightMm}mm
              </div>
            </button>
          </div>

          {state.activeSizePresetId === 'custom' && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[11px] text-zinc-500">宽 (mm)</label>
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={0.5}
                  value={state.customWidthMm}
                  onChange={(e) => onChangeCustomSize(parseFloat(e.target.value) || 10, state.customHeightMm)}
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] text-zinc-500">高 (mm)</label>
                <input
                  type="number"
                  min={6}
                  max={100}
                  step={0.5}
                  value={state.customHeightMm}
                  onChange={(e) => onChangeCustomSize(state.customWidthMm, parseFloat(e.target.value) || 13)}
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}
        </section>

        {/* Border & Line Width + Typography */}
        <section className="space-y-3 p-4">
          <h3 className="text-xs font-semibold text-zinc-900">线宽、边框与文字</h3>

          <div>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-zinc-600">外框线宽</span>
              <span className="font-mono text-zinc-500">{style.borderWidthMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.9}
              step={0.05}
              value={style.borderWidthMm}
              onChange={(e) => onChangeStyle({ borderWidthMm: parseFloat(e.target.value) })}
              className="h-1.5 w-full accent-zinc-900"
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-zinc-600">中间分隔线宽</span>
              <span className="font-mono text-zinc-500">{style.dividerWidthMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.7}
              step={0.05}
              value={style.dividerWidthMm}
              onChange={(e) => onChangeStyle({ dividerWidthMm: parseFloat(e.target.value) })}
              className="h-1.5 w-full accent-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-zinc-600">分隔线样式</label>
              <select
                value={style.dividerStyle}
                onChange={(e) => onChangeStyle({ dividerStyle: e.target.value as DividerStyle })}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                <option value="solid">实线</option>
                <option value="dashed">虚线</option>
                <option value="dotted">点线</option>
                <option value="none">无分隔线</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-zinc-600">外框圆角</label>
              <select
                value={style.borderRadiusMm}
                onChange={(e) => onChangeStyle({ borderRadiusMm: parseFloat(e.target.value) })}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                <option value={0}>直角 (0mm)</option>
                <option value={0.6}>微圆角 (0.6mm)</option>
                <option value={1.2}>圆角 (1.2mm)</option>
                <option value={2}>大圆角 (2.0mm)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-zinc-600">上格图标占比</span>
              <span className="font-mono text-zinc-500">{Math.round(style.splitRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.36}
              max={0.68}
              step={0.02}
              value={style.splitRatio}
              onChange={(e) => onChangeStyle({ splitRatio: parseFloat(e.target.value) })}
              className="h-1.5 w-full accent-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-zinc-600">字体</label>
              <select
                value={style.fontFamily}
                onChange={(e) => onChangeStyle({ fontFamily: e.target.value as FontFamilyKey })}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                <option value="sans">标准黑体</option>
                <option value="bold">加粗黑体</option>
                <option value="mono">等宽编号</option>
                <option value="rounded">清晰圆体</option>
              </select>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-zinc-600">字号</span>
                <span className="font-mono text-zinc-500">{style.fontSizePt.toFixed(1)}pt</span>
              </div>
              <input
                type="range"
                min={3.5}
                max={10}
                step={0.2}
                value={style.fontSizePt}
                onChange={(e) => onChangeStyle({ fontSizePt: parseFloat(e.target.value) })}
                className="mt-1.5 h-1.5 w-full accent-zinc-900"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs">
            <span className="text-zinc-700">上格反色（黑底白图标）</span>
            <input
              type="checkbox"
              checked={style.invertedTop}
              onChange={(e) => onChangeStyle({ invertedTop: e.target.checked })}
              className="h-3.5 w-3.5 accent-zinc-900"
            />
          </label>
        </section>

        {/* Paper & Thermal Pre-heat Strip */}
        <section className="space-y-3 p-4">
          <h3 className="text-xs font-semibold text-zinc-900">纸张与打印设置</h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] text-zinc-600">纸张预设</label>
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
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                {PAPER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-zinc-600">方向</label>
              <select
                value={paper.orientation}
                onChange={(e) =>
                  onChangePaper({ orientation: e.target.value as 'landscape' | 'portrait' })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-900"
              >
                <option value="landscape">横向</option>
                <option value="portrait">纵向</option>
              </select>
            </div>
          </div>

          {paper.presetId === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[11px] text-zinc-500">纸宽 (mm)</label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={paper.widthMm}
                  onChange={(e) => onChangePaper({ widthMm: parseFloat(e.target.value) || 60 })}
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] text-zinc-500">纸高 (mm)</label>
                <input
                  type="number"
                  min={15}
                  max={400}
                  value={paper.heightMm}
                  onChange={(e) => onChangePaper({ heightMm: parseFloat(e.target.value) || 40 })}
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[11px] text-zinc-500">页边距 (mm)</label>
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
                className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] text-zinc-500">标签间距 (mm)</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={paper.gapXMm}
                onChange={(e) => {
                  const g = Math.max(0, parseFloat(e.target.value) || 0)
                  onChangePaper({ gapXMm: g, gapYMm: g })
                }}
                className="w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Pre-heat bar card */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-900">
                <Flame className="h-3.5 w-3.5 text-zinc-700" />
                热升华预热引导条
              </span>
              <input
                type="checkbox"
                checked={paper.preheat.enabled}
                onChange={(e) => onChangePreheat({ enabled: e.target.checked })}
                className="h-3.5 w-3.5 accent-zinc-900"
              />
            </label>
            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
              在出纸方向前端（或前后两端）先打一条黑线预热打印头，避免第一排标签边框发虚。
            </p>

            {paper.preheat.enabled && (
              <div className="mt-2.5 space-y-2 border-t border-zinc-200 pt-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-zinc-600">位置</label>
                    <select
                      value={paper.preheat.position}
                      onChange={(e) => onChangePreheat({ position: e.target.value as PreheatPosition })}
                      className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                    >
                      <option value="top">顶部（出纸端）</option>
                      <option value="both">上下两端</option>
                      <option value="bottom">底部</option>
                      <option value="left">左侧</option>
                      <option value="left-right">左右两端</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-zinc-600">样式</label>
                    <select
                      value={paper.preheat.pattern}
                      onChange={(e) => onChangePreheat({ pattern: e.target.value as 'solid' | 'dashed' })}
                      className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                    >
                      <option value="solid">实心黑条</option>
                      <option value="dashed">间断黑条</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-zinc-600">条宽 (mm)</label>
                    <input
                      type="number"
                      min={0.5}
                      max={4}
                      step={0.2}
                      value={paper.preheat.thicknessMm}
                      onChange={(e) =>
                        onChangePreheat({ thicknessMm: Math.max(0.4, parseFloat(e.target.value) || 1.2) })
                      }
                      className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-zinc-600">安全间距 (mm)</label>
                    <input
                      type="number"
                      min={0.5}
                      max={6}
                      step={0.5}
                      value={paper.preheat.offsetGapMm}
                      onChange={(e) =>
                        onChangePreheat({ offsetGapMm: Math.max(0.5, parseFloat(e.target.value) || 1.5) })
                      }
                      className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </aside>
  )
}
