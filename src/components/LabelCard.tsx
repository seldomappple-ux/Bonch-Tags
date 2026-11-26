import React, { useEffect, useRef } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import type { IconAsset, LabelStyleConfig, SheetLabelInstance } from '../types/bonch'
import { getFontFamilyCss } from '../utils/layoutEngine'

interface LabelCardProps {
  item: SheetLabelInstance
  icon?: IconAsset
  widthMm: number
  heightMm: number
  styleConfig: LabelStyleConfig
  selected?: boolean
  forPrint?: boolean
  onSelect?: () => void
  onTextChange?: (nextText: string) => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export const LabelCard: React.FC<LabelCardProps> = ({
  item,
  icon,
  widthMm,
  heightMm,
  styleConfig,
  selected = false,
  forPrint = false,
  onSelect,
  onTextChange,
  onDuplicate,
  onDelete,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fontSizePt = item.fontSizeOverridePt ?? styleConfig.fontSizePt

  useEffect(() => {
    if (selected && textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [item.text, selected])

  const topHeightPct = Math.round(styleConfig.splitRatio * 100)
  const bottomHeightPct = 100 - topHeightPct

  const dividerCss =
    styleConfig.dividerStyle === 'none'
      ? 'none'
      : `${styleConfig.dividerWidthMm}mm ${styleConfig.dividerStyle} #000000`

  return (
    <div
      onClick={(e) => {
        if (forPrint) return
        e.stopPropagation()
        onSelect?.()
      }}
      className={`group relative select-none bg-white text-black transition-shadow ${
        !forPrint ? 'cursor-pointer' : ''
      } ${!forPrint && selected ? 'ring-[0.45mm] ring-zinc-900 ring-offset-[0.35mm]' : ''}`}
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        border: `${styleConfig.borderWidthMm}mm solid #000000`,
        borderRadius: `${styleConfig.borderRadiusMm}mm`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Top Icon Cell */}
      <div
        style={{
          height: `${topHeightPct}%`,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: styleConfig.invertedTop ? '#000000' : '#ffffff',
          color: styleConfig.invertedTop ? '#ffffff' : '#000000',
          borderBottom: dividerCss,
          padding: '0.4mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {icon ? (
          <div
            style={{
              width: `${Math.round(styleConfig.iconScale * 100)}%`,
              height: `${Math.round(styleConfig.iconScale * 100)}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: icon.svgContent }}
          />
        ) : (
          <span style={{ fontSize: '4pt', opacity: 0.4 }}>无图标</span>
        )}
      </div>

      {/* Bottom Text Cell */}
      <div
        style={{
          height: `${bottomHeightPct}%`,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.35mm 0.5mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          color: '#000000',
        }}
      >
        {forPrint ? (
          <div
            style={{
              width: '100%',
              textAlign: 'center',
              fontFamily: getFontFamilyCss(styleConfig.fontFamily),
              fontSize: `${fontSizePt}pt`,
              fontWeight:
                styleConfig.fontFamily === 'bold'
                  ? 700
                  : styleConfig.fontWeight === 'bold'
                    ? 700
                    : styleConfig.fontWeight === 'medium'
                      ? 500
                      : 400,
              lineHeight: 1.15,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
            }}
          >
            {item.text}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={item.text}
            onChange={(e) => onTextChange?.(e.target.value)}
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.()
            }}
            spellCheck={false}
            rows={item.text.includes('\n') ? 2 : 1}
            placeholder="输入文字"
            className="w-full resize-none border-none bg-transparent p-0 text-center text-black outline-none placeholder:text-zinc-300"
            style={{
              fontFamily: getFontFamilyCss(styleConfig.fontFamily),
              fontSize: `${fontSizePt}pt`,
              fontWeight:
                styleConfig.fontFamily === 'bold'
                  ? 700
                  : styleConfig.fontWeight === 'bold'
                    ? 700
                    : styleConfig.fontWeight === 'medium'
                      ? 500
                      : 400,
              lineHeight: 1.15,
              maxHeight: '100%',
              overflow: 'hidden',
            }}
          />
        )}
      </div>

      {/* Floating quick actions (screen only, hidden in print) */}
      {!forPrint && (
        <div
          className={`no-print absolute top-0 right-0 flex gap-[0.3mm] rounded-bl bg-zinc-900/90 p-[0.35mm] text-white transition-opacity ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            title="复制一张"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate?.()
            }}
            className="flex items-center justify-center rounded p-[0.25mm] hover:bg-zinc-700"
          >
            <Copy style={{ width: '1.8mm', height: '1.8mm' }} />
          </button>
          <button
            type="button"
            title="删除"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="flex items-center justify-center rounded p-[0.25mm] hover:bg-red-600"
          >
            <Trash2 style={{ width: '1.8mm', height: '1.8mm' }} />
          </button>
        </div>
      )}
    </div>
  )
}
