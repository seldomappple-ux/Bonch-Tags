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
  onDropIcon?: (iconId: string) => void
}

const PreheatBarSvg: React.FC<{
  horizontal: boolean
  pattern: 'solid' | 'dashed'
  style: React.CSSProperties
  title: string
}> = ({ horizontal, pattern, style, title }) => (
  <svg
    aria-label={title}
    style={{ position: 'absolute', ...style }}
    preserveAspectRatio="none"
    viewBox={horizontal ? '0 0 100 10' : '0 0 10 100'}
  >
    {pattern === 'solid' ? (
      <rect width={horizontal ? 100 : 10} height={horizontal ? 10 : 100} fill="#000000" />
    ) : horizontal ? (
      <line x1="0" y1="5" x2="100" y2="5" stroke="#000000" strokeWidth="10" strokeDasharray="6 3.5" />
    ) : (
      <line x1="5" y1="0" x2="5" y2="100" stroke="#000000" strokeWidth="10" strokeDasharray="6 3.5" />
    )}
  </svg>
)

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
  onDropIcon,
}) => {
  const geo = computeSheetGeometry(paper, labelW, labelH, styleConfig.borderWidthMm)
  const ph = paper.preheat

  const showTopBar = ph.enabled && (ph.position === 'top' || ph.position === 'both')
  const showBottomBar = ph.enabled && (ph.position === 'bottom' || ph.position === 'both')
  const showLeftBar = ph.enabled && (ph.position === 'left' || ph.position === 'left-right')
  const showRightBar = ph.enabled && ph.position === 'left-right'

  const sheetContent = (
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
        if (partId) {
          onDropPart?.(partId)
          return
        }
        const iconId = e.dataTransfer.getData('text/bonch-icon-id')
        if (iconId) {
          onDropIcon?.(iconId)
        }
      }}
      className={forPrint ? 'bg-white' : 'relative bg-white shadow-md ring-1 ring-zinc-300'}
      style={{
        width: `${geo.paperW}mm`,
        height: `${geo.paperH}mm`,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Foreground SVG Pre-heat bars (always print pure black even if background graphics is off) */}
      {showTopBar && (
        <PreheatBarSvg
          horizontal
          pattern={ph.pattern}
          title="预热引导条（上）"
          style={{
            top: `${paper.marginTopMm}mm`,
            left: `${paper.marginLeftMm}mm`,
            width: `${Math.max(0, geo.paperW - paper.marginLeftMm - paper.marginRightMm)}mm`,
            height: `${ph.thicknessMm}mm`,
          }}
        />
      )}
      {showBottomBar && (
        <PreheatBarSvg
          horizontal
          pattern={ph.pattern}
          title="预热引导条（下）"
          style={{
            bottom: `${paper.marginBottomMm}mm`,
            left: `${paper.marginLeftMm}mm`,
            width: `${Math.max(0, geo.paperW - paper.marginLeftMm - paper.marginRightMm)}mm`,
            height: `${ph.thicknessMm}mm`,
          }}
        />
      )}
      {showLeftBar && (
        <PreheatBarSvg
          horizontal={false}
          pattern={ph.pattern}
          title="预热引导条（左）"
          style={{
            left: `${paper.marginLeftMm}mm`,
            top: `${paper.marginTopMm}mm`,
            width: `${ph.thicknessMm}mm`,
            height: `${Math.max(0, geo.paperH - paper.marginTopMm - paper.marginBottomMm)}mm`,
          }}
        />
      )}
      {showRightBar && (
        <PreheatBarSvg
          horizontal={false}
          pattern={ph.pattern}
          title="预热引导条（右）"
          style={{
            right: `${paper.marginRightMm}mm`,
            top: `${paper.marginTopMm}mm`,
            width: `${ph.thicknessMm}mm`,
            height: `${Math.max(0, geo.paperH - paper.marginTopMm - paper.marginBottomMm)}mm`,
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
          columnGap: paper.connectedGrid ? '0mm' : `${paper.gapXMm}mm`,
          rowGap: paper.connectedGrid ? '0mm' : `${paper.gapYMm}mm`,
          paddingLeft: paper.connectedGrid ? `${styleConfig.borderWidthMm}mm` : '0mm',
          paddingTop: paper.connectedGrid ? `${styleConfig.borderWidthMm}mm` : '0mm',
          overflow: 'hidden',
        }}
      >
        {items.length === 0 && !forPrint ? (
          <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-zinc-300 text-center text-zinc-400">
            <span style={{ fontSize: '4.5pt' }}>从左侧点击或拖拽零件/图标到此处排版</span>
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
              connectedGrid={paper.connectedGrid}
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

  if (!forPrint) {
    return sheetContent
  }

  // Print target: supports optional 90° rotation for sideways-feeding thermal/dye-sub printers
  if (paper.printRotate90) {
    return (
      <div
        className="print-only-sheet hidden bg-white"
        style={{
          width: `${geo.paperH}mm`,
          height: `${geo.paperW}mm`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `translateX(${geo.paperH}mm) rotate(90deg)`,
          }}
        >
          {sheetContent}
        </div>
      </div>
    )
  }

  return (
    <div
      className="print-only-sheet hidden bg-white"
      style={{
        width: `${geo.paperW}mm`,
        height: `${geo.paperH}mm`,
        overflow: 'hidden',
      }}
    >
      {sheetContent}
    </div>
  )
}
