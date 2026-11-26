import React from 'react'
import type { IconAsset, LabelStyleConfig, PaperConfig, SheetLabelInstance } from '../types/bonch'
import { computeSheetGeometry } from '../utils/layoutEngine'
import { LabelCard } from './LabelCard'

interface PrintSheetProps {
  paper: PaperConfig
  labelW: number
  labelH: number
  styleConfig: LabelStyleConfig
  items: SheetLabelInstance[]
  iconsMap: Map<string, IconAsset>
  selectedItemId?: string | null
  forPrint?: boolean
  onSelectItem?: (id: string | null) => void
  onUpdateItemText?: (id: string, text: string) => void
  onDuplicateItem?: (id: string) => void
  onDeleteItem?: (id: string) => void
  onDropPart?: (partId: string) => void
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  paper,
  labelW,
  labelH,
  styleConfig,
  items,
  iconsMap,
  selectedItemId,
  forPrint = false,
  onSelectItem,
  onUpdateItemText,
  onDuplicateItem,
  onDeleteItem,
  onDropPart,
}) => {
  const geo = computeSheetGeometry(paper, labelW, labelH)
  const ph = paper.preheat

  const barBg =
    ph.pattern === 'dashed'
      ? 'repeating-linear-gradient(90deg, #000000 0, #000000 2mm, transparent 2mm, transparent 3.2mm)'
      : '#000000'

  const barBgVertical =
    ph.pattern === 'dashed'
      ? 'repeating-linear-gradient(180deg, #000000 0, #000000 2mm, transparent 2mm, transparent 3.2mm)'
      : '#000000'

  const showTopBar = ph.enabled && (ph.position === 'top' || ph.position === 'both')
  const showBottomBar = ph.enabled && (ph.position === 'bottom' || ph.position === 'both')
  const showLeftBar = ph.enabled && (ph.position === 'left' || ph.position === 'left-right')
  const showRightBar = ph.enabled && ph.position === 'left-right'

  return (
    <div
      onClick={() => !forPrint && onSelectItem?.(null)}
      onDragOver={(e) => {
        if (forPrint) return
        e.preventDefault()
      }}
      onDrop={(e) => {
        if (forPrint) return
        e.preventDefault()
        const partId = e.dataTransfer.getData('text/bonch-part-id')
        if (partId) onDropPart?.(partId)
      }}
      className={forPrint ? 'print-only-sheet hidden bg-white' : 'relative bg-white shadow-md ring-1 ring-zinc-300'}
      style={{
        width: `${geo.paperW}mm`,
        height: `${geo.paperH}mm`,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Pre-heat bars for dye-sub / thermal printers */}
      {showTopBar && (
        <div
          title="预热引导条（上）"
          style={{
            position: 'absolute',
            top: `${paper.marginTopMm}mm`,
            left: `${paper.marginLeftMm}mm`,
            right: `${paper.marginRightMm}mm`,
            height: `${ph.thicknessMm}mm`,
            background: barBg,
          }}
        />
      )}
      {showBottomBar && (
        <div
          title="预热引导条（下）"
          style={{
            position: 'absolute',
            bottom: `${paper.marginBottomMm}mm`,
            left: `${paper.marginLeftMm}mm`,
            right: `${paper.marginRightMm}mm`,
            height: `${ph.thicknessMm}mm`,
            background: barBg,
          }}
        />
      )}
      {showLeftBar && (
        <div
          title="预热引导条（左）"
          style={{
            position: 'absolute',
            left: `${paper.marginLeftMm}mm`,
            top: `${paper.marginTopMm}mm`,
            bottom: `${paper.marginBottomMm}mm`,
            width: `${ph.thicknessMm}mm`,
            background: barBgVertical,
          }}
        />
      )}
      {showRightBar && (
        <div
          title="预热引导条（右）"
          style={{
            position: 'absolute',
            right: `${paper.marginRightMm}mm`,
            top: `${paper.marginTopMm}mm`,
            bottom: `${paper.marginBottomMm}mm`,
            width: `${ph.thicknessMm}mm`,
            background: barBgVertical,
          }}
        />
      )}

      {/* Printable Label Grid Area */}
      <div
        style={{
          position: 'absolute',
          top: `${geo.padTop}mm`,
          left: `${geo.padLeft}mm`,
          right: `${geo.padRight}mm`,
          bottom: `${geo.padBottom}mm`,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          columnGap: `${paper.gapXMm}mm`,
          rowGap: `${paper.gapYMm}mm`,
          overflow: 'hidden',
        }}
      >
        {items.length === 0 && !forPrint ? (
          <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-zinc-300 text-center text-zinc-400">
            <span style={{ fontSize: '4.5pt' }}>从左侧点击或拖拽零件到此处排版</span>
          </div>
        ) : (
          items.map((item) => (
            <LabelCard
              key={item.id}
              item={item}
              icon={iconsMap.get(item.iconId)}
              widthMm={labelW}
              heightMm={labelH}
              styleConfig={styleConfig}
              selected={selectedItemId === item.id}
              forPrint={forPrint}
              onSelect={() => onSelectItem?.(item.id)}
              onTextChange={(t) => onUpdateItemText?.(item.id, t)}
              onDuplicate={() => onDuplicateItem?.(item.id)}
              onDelete={() => onDeleteItem?.(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
