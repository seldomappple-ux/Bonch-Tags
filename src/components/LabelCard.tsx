import React, { useLayoutEffect, useRef, useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import type { IconAsset, LabelStyleConfig, SheetLabelInstance } from '../types/bonch'
import { getFontFamilyCss } from '../utils/layoutEngine'

interface LabelCardProps {
  item: SheetLabelInstance
  icon?: IconAsset
  widthMm: number
  heightMm: number
  styleConfig: LabelStyleConfig
  connectedGrid?: boolean
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
  connectedGrid = false,
  selected = false,
  forPrint = false,
  onSelect,
  onTextChange,
  onDuplicate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false)
  const [isTextOverflow, setIsTextOverflow] = useState(false)
  const textBoxRef = useRef<HTMLDivElement>(null)
  const fontSizePt = item.fontSizeOverridePt ?? styleConfig.fontSizePt

  // Detect exact text overflow on screen so screen preview matches print 100%
  useLayoutEffect(() => {
    if (forPrint || !textBoxRef.current) return
    const el = textBoxRef.current
    setIsTextOverflow(el.scrollHeight > el.clientHeight + 0.8 || el.scrollWidth > el.clientWidth + 0.8)
  }, [item.text, fontSizePt, widthMm, heightMm, styleConfig.splitRatio, styleConfig.fontFamily, forPrint])

  const topHeightPct = Math.round(styleConfig.splitRatio * 100)
  const bottomHeightPct = 100 - topHeightPct
  const effectiveRadiusMm = connectedGrid ? 0 : styleConfig.borderRadiusMm

  const dividerCss =
    styleConfig.dividerStyle === 'none'
      ? 'none'
      : `${styleConfig.dividerWidthMm}mm ${styleConfig.dividerStyle} #000000`

  const fontWeightValue =
    styleConfig.fontFamily === 'bold'
      ? 700
      : styleConfig.fontWeight === 'bold'
        ? 700
        : styleConfig.fontWeight === 'medium'
          ? 500
          : 400

  return (
    <div
      onClick={(e) => {
        if (forPrint) return
        e.stopPropagation()
        onSelect?.()
      }}
      onDoubleClick={(e) => {
        if (forPrint) return
        e.stopPropagation()
        onSelect?.()
        setEditing(true)
      }}
      className={`group relative select-none bg-white text-black ${!forPrint ? 'cursor-pointer' : ''}`}
      style={{
        width: `${connectedGrid ? widthMm + styleConfig.borderWidthMm : widthMm}mm`,
        height: `${connectedGrid ? heightMm + styleConfig.borderWidthMm : heightMm}mm`,
        border: `${styleConfig.borderWidthMm}mm solid #000000`,
        borderRadius: `${effectiveRadiusMm}mm`,
        marginLeft: connectedGrid ? `-${styleConfig.borderWidthMm}mm` : undefined,
        marginTop: connectedGrid ? `-${styleConfig.borderWidthMm}mm` : undefined,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
        zIndex: !forPrint && selected ? 10 : 1,
        outline: !forPrint && selected ? '0.45mm solid #2563eb' : 'none',
        outlineOffset: '-0.2mm',
      }}
    >
      {/* Top Icon Cell */}
      <div
        style={{
          position: 'relative',
          height: `${topHeightPct}%`,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: styleConfig.invertedTop ? '#ffffff' : '#000000',
          borderBottom: dividerCss,
          padding: '0.35mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Use foreground SVG rect for inverted background so Chrome print never strips it */}
        {styleConfig.invertedTop && (
          <svg
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
            preserveAspectRatio="none"
            viewBox="0 0 10 10"
          >
            <rect width="10" height="10" fill="#000000" />
          </svg>
        )}

        {icon ? (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: `${Math.round(styleConfig.iconScale * 100)}%`,
              height: `${Math.round(styleConfig.iconScale * 100)}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: icon.svgContent }}
          />
        ) : (
          <span style={{ position: 'relative', zIndex: 1, fontSize: '4pt', opacity: 0.4 }}>无图标</span>
        )}
      </div>

      {/* Bottom Text Cell — IDENTICAL DOM & CSS on screen and in print! */}
      <div
        ref={textBoxRef}
        style={{
          position: 'relative',
          height: `${bottomHeightPct}%`,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.3mm 0.45mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          color: '#000000',
        }}
      >
        {!editing && (
          <div
            style={{
              width: '100%',
              textAlign: 'center',
              fontFamily: getFontFamilyCss(styleConfig.fontFamily),
              fontSize: `${fontSizePt}pt`,
              fontWeight: fontWeightValue,
              lineHeight: 1.15,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {item.text || (!forPrint ? <span style={{ color: '#d4d4d8' }}>双击改字</span> : '')}
          </div>
        )}

        {/* Clean opaque inline editor without scrollbars or ghosting */}
        {!forPrint && editing && (
          <textarea
            autoFocus
            value={item.text}
            onChange={(e) => onTextChange?.(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false)
            }}
            onClick={(e) => e.stopPropagation()}
            spellCheck={false}
            className="no-print no-scrollbar absolute inset-0 h-full w-full resize-none overflow-hidden border-none bg-white p-[0.3mm] text-center text-black outline-none"
            style={{
              fontFamily: getFontFamilyCss(styleConfig.fontFamily),
              fontSize: `${fontSizePt}pt`,
              fontWeight: fontWeightValue,
              lineHeight: 1.15,
            }}
          />
        )}

        {/* Overflow warning dot (screen only) */}
        {!forPrint && isTextOverflow && !editing && (
          <div
            title="文字超出格子范围，打印会被裁切，请调小字号或精简文字"
            className="no-print absolute right-[0.3mm] bottom-[0.3mm] rounded-full bg-red-600"
            style={{ width: '1.3mm', height: '1.3mm' }}
          />
        )}
      </div>

      {/* Floating quick actions (screen only) */}
      {!forPrint && !editing && (
        <div
          className={`no-print absolute top-0 right-0 z-20 flex gap-[0.25mm] rounded-bl bg-zinc-900/90 p-[0.3mm] text-white transition-opacity ${
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
            className="flex items-center justify-center rounded p-[0.2mm] hover:bg-zinc-700"
          >
            <Copy style={{ width: '1.6mm', height: '1.6mm' }} />
          </button>
          <button
            type="button"
            title="删除"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="flex items-center justify-center rounded p-[0.2mm] hover:bg-red-600"
          >
            <Trash2 style={{ width: '1.6mm', height: '1.6mm' }} />
          </button>
        </div>
      )}
    </div>
  )
}
