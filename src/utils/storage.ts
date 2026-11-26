import { BUILT_IN_ICONS, DEFAULT_PARTS, DEFAULT_SIZE_PRESETS } from '../data/builtInIcons'
import type { BonchAppState } from '../types/bonch'

const STORAGE_KEY = 'bonch-tags-state-v1'
const CURRENT_DATA_VERSION = 2

export function createInitialState(): BonchAppState {
  return {
    version: CURRENT_DATA_VERSION,
    icons: BUILT_IN_ICONS,
    parts: DEFAULT_PARTS,
    sizePresets: DEFAULT_SIZE_PRESETS,
    activeSizePresetId: 'small',
    customWidthMm: 12,
    customHeightMm: 16,
    style: {
      borderWidthMm: 0.35,
      dividerWidthMm: 0.25,
      dividerStyle: 'solid',
      borderRadiusMm: 0,
      splitRatio: 0.56,
      iconScale: 0.78,
      fontFamily: 'sans',
      fontSizePt: 5.5,
      fontWeight: 'bold',
      invertedTop: false,
    },
    paper: {
      presetId: '60x40',
      widthMm: 60,
      heightMm: 40,
      orientation: 'landscape',
      printRotate90: false,
      offsetXMm: 0,
      offsetYMm: 0,
      connectedGrid: true,
      marginTopMm: 2.5,
      marginRightMm: 2.5,
      marginBottomMm: 2.5,
      marginLeftMm: 2.5,
      gapXMm: 0,
      gapYMm: 0,
      preheat: {
        enabled: true,
        position: 'top',
        thicknessMm: 1.2,
        offsetGapMm: 1.5,
        pattern: 'solid',
      },
    },
    sheetItems: [
      { id: 'init-1', partId: 'part-1', iconId: 'icon-screw-hex', text: 'M2' },
      { id: 'init-2', partId: 'part-1', iconId: 'icon-screw-hex', text: 'M2.5' },
      { id: 'init-3', partId: 'part-1', iconId: 'icon-screw-hex', text: 'M3' },
      { id: 'init-4', partId: 'part-2', iconId: 'icon-nut', text: 'M3' },
      { id: 'init-5', partId: 'part-4', iconId: 'icon-chip', text: 'CH224K' },
      { id: 'init-6', partId: 'part-5', iconId: 'icon-heatsink', text: '10×10' },
    ],
    history: [],
  }
}

export function loadState(): BonchAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<BonchAppState>
    const base = createInitialState()

    // Always refresh built-in icons to the latest bold silhouette SVGs while keeping user-imported icons
    const userIcons = Array.isArray(parsed.icons)
      ? parsed.icons.filter((ic) => !ic.isBuiltIn && !BUILT_IN_ICONS.some((b) => b.id === ic.id))
      : []
    const icons = [...userIcons, ...BUILT_IN_ICONS]

    const parts = Array.isArray(parsed.parts) && parsed.parts.length > 0 ? parsed.parts : base.parts
    const sizePresets =
      Array.isArray(parsed.sizePresets) && parsed.sizePresets.length > 0 ? parsed.sizePresets : base.sizePresets

    return {
      ...base,
      ...parsed,
      version: CURRENT_DATA_VERSION,
      icons,
      parts,
      sizePresets,
      style: { ...base.style, ...(parsed.style || {}) },
      paper: {
        ...base.paper,
        ...(parsed.paper || {}),
        preheat: { ...base.paper.preheat, ...(parsed.paper?.preheat || {}) },
      },
      sheetItems: Array.isArray(parsed.sheetItems) ? parsed.sheetItems : base.sheetItems,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    }
  } catch {
    return createInitialState()
  }
}

export function saveState(state: BonchAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota errors
  }
}

export function exportBackup(state: BonchAppState): void {
  const payload = {
    app: 'Bonch Tags',
    exportedAt: new Date().toISOString(),
    data: state,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `bonch-tags-backup-${dateStr}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackupFile(text: string): { ok: true; state: BonchAppState } | { ok: false; error: string } {
  try {
    const raw = JSON.parse(text)
    const candidate = raw?.data ?? raw
    if (!candidate || !Array.isArray(candidate.icons) || !Array.isArray(candidate.parts)) {
      return { ok: false, error: '备份文件格式不正确，缺少 icons 或 parts 字段。' }
    }
    const base = createInitialState()
    return {
      ok: true,
      state: {
        ...base,
        ...candidate,
        style: { ...base.style, ...(candidate.style || {}) },
        paper: {
          ...base.paper,
          ...(candidate.paper || {}),
          preheat: { ...base.paper.preheat, ...(candidate.paper?.preheat || {}) },
        },
      },
    }
  } catch {
    return { ok: false, error: '无法解析 JSON 文件，请确认文件未损坏。' }
  }
}
