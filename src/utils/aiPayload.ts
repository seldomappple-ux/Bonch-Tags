import type { BonchAppState, IconAsset, PartItem, SheetLabelInstance } from '../types/bonch'
import { normalizeSvg } from './svgUtils'

export interface AiNewIconSpec {
  id: string
  name: string
  category?: string
  svg: string
  defaultText?: string
  addToParts?: boolean
}

export interface AiSheetItemSpec {
  iconId: string
  text: string
  fontSizeOverridePt?: number
}

export interface AiSheetPayload {
  size?: 'small' | 'medium' | 'custom'
  customWidthMm?: number
  customHeightMm?: number
  replace?: boolean
  paperOrientation?: 'landscape' | 'portrait'
  newIcons?: AiNewIconSpec[]
  items: AiSheetItemSpec[]
}

function decodeBase64UrlUtf8(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (base64.length % 4)) % 4
  const padded = base64 + '='.repeat(padLen)
  const bin = atob(padded)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

export function extractAiPayloadFromHash(hash: string): AiSheetPayload | null {
  if (!hash) return null
  const match = hash.match(/import=([^&]+)/)
  if (!match) return null
  try {
    const jsonStr = decodeBase64UrlUtf8(decodeURIComponent(match[1]))
    const parsed = JSON.parse(jsonStr) as AiSheetPayload
    if (!parsed || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function applyAiPayloadToState(
  prev: BonchAppState,
  payload: AiSheetPayload,
): { nextState: BonchAppState; addedIcons: number; itemCount: number } {
  let icons = [...prev.icons]
  let parts = [...prev.parts]
  let addedIcons = 0

  if (Array.isArray(payload.newIcons)) {
    for (const spec of payload.newIcons) {
      if (!spec?.id || !spec?.svg) continue
      const norm = normalizeSvg(spec.svg)
      if (!norm.ok) continue

      const existingIdx = icons.findIndex((i) => i.id === spec.id)
      const asset: IconAsset = {
        id: spec.id,
        name: spec.name || spec.id,
        category: spec.category || 'AI生成',
        svgContent: norm.svg,
        createdAt: Date.now(),
      }
      if (existingIdx >= 0) {
        icons[existingIdx] = asset
      } else {
        icons = [asset, ...icons]
        addedIcons++
      }

      if (spec.addToParts !== false) {
        const partExists = parts.some((p) => p.iconId === spec.id && p.name === asset.name)
        if (!partExists) {
          const newPart: PartItem = {
            id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: asset.name,
            category: asset.category,
            iconId: asset.id,
            defaultText: spec.defaultText || asset.name,
            createdAt: Date.now(),
          }
          parts = [newPart, ...parts]
        }
      }
    }
  }

  let activeSizePresetId = prev.activeSizePresetId
  let customWidthMm = prev.customWidthMm
  let customHeightMm = prev.customHeightMm
  let style = { ...prev.style }

  if (payload.size) {
    activeSizePresetId = payload.size
    if (payload.size === 'custom') {
      if (payload.customWidthMm) customWidthMm = payload.customWidthMm
      if (payload.customHeightMm) customHeightMm = payload.customHeightMm
    } else {
      const preset = prev.sizePresets.find((p) => p.id === payload.size)
      if (preset) {
        style = {
          ...style,
          fontSizePt: preset.defaultFontSizePt,
          splitRatio: preset.defaultSplitRatio,
        }
      }
    }
  }

  const paper = payload.paperOrientation
    ? { ...prev.paper, orientation: payload.paperOrientation }
    : prev.paper

  const newItems: SheetLabelInstance[] = payload.items.map((it, idx) => ({
    id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
    iconId: it.iconId,
    text: String(it.text ?? ''),
    fontSizeOverridePt: it.fontSizeOverridePt,
  }))

  const sheetItems = payload.replace === false ? [...prev.sheetItems, ...newItems] : newItems

  return {
    nextState: {
      ...prev,
      icons,
      parts,
      activeSizePresetId,
      customWidthMm,
      customHeightMm,
      style,
      paper,
      sheetItems,
    },
    addedIcons,
    itemCount: newItems.length,
  }
}
