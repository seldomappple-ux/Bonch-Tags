export interface IconAsset {
  id: string
  name: string
  category: string
  svgContent: string
  createdAt: number
  isBuiltIn?: boolean
}

export interface PartItem {
  id: string
  name: string
  category: string
  iconId: string
  defaultText: string
  createdAt: number
}

export interface LabelSizePreset {
  id: string
  name: string
  widthMm: number
  heightMm: number
  defaultFontSizePt: number
  defaultSplitRatio: number
  description: string
  isBuiltIn?: boolean
}

export type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'none'
export type FontFamilyKey = 'sans' | 'bold' | 'mono' | 'rounded'
export type PreheatPosition = 'top' | 'both' | 'bottom' | 'left' | 'left-right'
export type PreheatPattern = 'solid' | 'dashed'

export interface LabelStyleConfig {
  borderWidthMm: number
  dividerWidthMm: number
  dividerStyle: DividerStyle
  borderRadiusMm: number
  splitRatio: number // 0.35 - 0.70, proportion of top icon box
  iconScale: number // 0.40 - 1.00, icon size inside top box
  fontFamily: FontFamilyKey
  fontSizePt: number
  fontWeight: 'normal' | 'medium' | 'bold'
  invertedTop: boolean
}

export interface PreheatConfig {
  enabled: boolean
  position: PreheatPosition
  thicknessMm: number
  offsetGapMm: number
  pattern: PreheatPattern
}

export interface PaperConfig {
  presetId: string
  widthMm: number
  heightMm: number
  orientation: 'landscape' | 'portrait'
  printRotate90: boolean
  connectedGrid: boolean // Seamless shared-border grid (no white gaps)
  marginTopMm: number
  marginRightMm: number
  marginBottomMm: number
  marginLeftMm: number
  gapXMm: number
  gapYMm: number
  preheat: PreheatConfig
}

export interface SheetLabelInstance {
  id: string
  partId?: string
  iconId: string
  text: string
  fontSizeOverridePt?: number
}

export interface SavedPrintSheet {
  id: string
  title: string
  savedAt: number
  sizePresetId: string
  customWidthMm: number
  customHeightMm: number
  style: LabelStyleConfig
  paper: PaperConfig
  items: SheetLabelInstance[]
}

export interface BonchAppState {
  version: number
  icons: IconAsset[]
  parts: PartItem[]
  sizePresets: LabelSizePreset[]
  activeSizePresetId: string
  customWidthMm: number
  customHeightMm: number
  style: LabelStyleConfig
  paper: PaperConfig
  sheetItems: SheetLabelInstance[]
  history: SavedPrintSheet[]
}
