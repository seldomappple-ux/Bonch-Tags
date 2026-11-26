import type { IconAsset, LabelSizePreset, PartItem } from '../types/bonch'

const wrapSolid = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" fill="currentColor">${inner}</svg>`

export const BUILT_IN_ICONS: IconAsset[] = [
  {
    id: 'icon-nut',
    name: '六角螺母',
    category: '紧固件',
    isBuiltIn: true,
    createdAt: 1,
    // Bold solid black hexagon with clean white center cutout (matches Excel silhouette style)
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M32 6 L55 19 V45 L32 58 L9 45 V19 Z M32 21 A11 11 0 1 0 32 43 A11 11 0 1 0 32 21 Z"/>
    `),
  },
  {
    id: 'icon-screw-hex',
    name: '内六角螺丝',
    category: '紧固件',
    isBuiltIn: true,
    createdAt: 2,
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M17 8 H47 Q50 8 50 11 V20 Q50 23 47 23 H17 Q14 23 14 20 V11 Q14 8 17 8 Z M24 13 H40 V18 H24 Z"/>
      <rect x="23" y="25" width="18" height="6" rx="1"/>
      <rect x="23" y="34" width="18" height="6" rx="1"/>
      <rect x="23" y="43" width="18" height="6" rx="1"/>
      <polygon points="23,51 41,51 35,57 29,57"/>
    `),
  },
  {
    id: 'icon-screw-flat',
    name: '沉头螺丝',
    category: '紧固件',
    isBuiltIn: true,
    createdAt: 3,
    svgContent: wrapSolid(`
      <polygon points="10,10 54,10 41,23 23,23"/>
      <rect x="23" y="25" width="18" height="6" rx="1"/>
      <rect x="23" y="34" width="18" height="6" rx="1"/>
      <rect x="23" y="43" width="18" height="6" rx="1"/>
      <polygon points="23,51 41,51 35,57 29,57"/>
    `),
  },
  {
    id: 'icon-chip',
    name: '芯片 / MCU',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 4,
    // Bold thick IC block matching Excel's image1.png
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M16 14 H48 Q50 14 50 16 V48 Q50 50 48 50 H16 Q14 50 14 48 V16 Q14 14 16 14 Z M23 23 H41 V41 H23 Z"/>
      <rect x="27" y="27" width="10" height="10" rx="1"/>
      <rect x="20" y="5" width="5" height="9" rx="2"/>
      <rect x="29.5" y="5" width="5" height="9" rx="2"/>
      <rect x="39" y="5" width="5" height="9" rx="2"/>
      <rect x="20" y="50" width="5" height="9" rx="2"/>
      <rect x="29.5" y="50" width="5" height="9" rx="2"/>
      <rect x="39" y="50" width="5" height="9" rx="2"/>
      <rect x="5" y="20" width="9" height="5" rx="2"/>
      <rect x="5" y="29.5" width="9" height="5" rx="2"/>
      <rect x="5" y="39" width="9" height="5" rx="2"/>
      <rect x="50" y="20" width="9" height="5" rx="2"/>
      <rect x="50" y="29.5" width="9" height="5" rx="2"/>
      <rect x="50" y="39" width="9" height="5" rx="2"/>
    `),
  },
  {
    id: 'icon-heatsink',
    name: '散热片',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 5,
    // Solid chunky fins matching Excel's image11.png
    svgContent: wrapSolid(`
      <rect x="8" y="42" width="48" height="14" rx="1"/>
      <rect x="8" y="10" width="9" height="34"/>
      <rect x="21" y="10" width="9" height="34"/>
      <rect x="34" y="10" width="9" height="34"/>
      <rect x="47" y="10" width="9" height="34"/>
    `),
  },
  {
    id: 'icon-typec',
    name: 'Type-C 接口',
    category: '接口',
    isBuiltIn: true,
    createdAt: 6,
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M20 16 H44 A16 16 0 0 1 44 48 H20 A16 16 0 0 1 20 16 Z M20 23 A9 9 0 0 0 20 41 H44 A9 9 0 0 0 44 23 Z"/>
      <rect x="17" y="28.5" width="30" height="7" rx="3.5"/>
    `),
  },
  {
    id: 'icon-usba',
    name: 'USB-A 接口',
    category: '接口',
    isBuiltIn: true,
    createdAt: 7,
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M10 12 H54 V38 H10 Z M19 20 H27 V28 H19 Z M37 20 H45 V28 H37 Z"/>
      <rect x="18" y="41" width="28" height="12" rx="2"/>
    `),
  },
  {
    id: 'icon-gyro',
    name: '陀螺仪 / IMU',
    category: '模块',
    isBuiltIn: true,
    createdAt: 8,
    // Thick high-contrast gyroscope rings matching Excel's image6.png
    svgContent: wrapSolid(`
      <path fill-rule="evenodd" d="M32 6 A26 26 0 1 1 32 58 A26 26 0 1 1 32 6 Z M32 13 A19 19 0 1 0 32 51 A19 19 0 1 0 32 13 Z"/>
      <ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(-45 32 32)" fill="none" stroke="currentColor" stroke-width="5.5"/>
      <circle cx="32" cy="32" r="6"/>
    `),
  },
  {
    id: 'icon-module',
    name: '电源/充放模块',
    category: '模块',
    isBuiltIn: true,
    createdAt: 9,
    // Bold lightning in circle matching Excel's image5.png
    svgContent: wrapSolid(`
      <path d="M36 6 L15 35 H30 L26 58 L49 27 H34 Z"/>
      <path d="M19 13 A24 24 0 0 0 16 50" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M45 51 A24 24 0 0 0 48 14" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
    `),
  },
  {
    id: 'icon-resistor',
    name: '电阻',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 10,
    svgContent: wrapSolid(`
      <rect x="4" y="29" width="12" height="6" rx="2"/>
      <rect x="48" y="29" width="12" height="6" rx="2"/>
      <path fill-rule="evenodd" d="M16 19 H48 Q51 19 51 22 V42 Q51 45 48 45 H16 Q13 45 13 42 V22 Q13 19 16 19 Z M23 23 V41 H27 V23 Z M33 23 V41 H37 V23 Z"/>
    `),
  },
  {
    id: 'icon-capacitor',
    name: '电容',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 11,
    svgContent: wrapSolid(`
      <rect x="6" y="29" width="17" height="6" rx="2"/>
      <rect x="41" y="29" width="17" height="6" rx="2"/>
      <rect x="21" y="12" width="8" height="40" rx="2"/>
      <rect x="35" y="12" width="8" height="40" rx="2"/>
    `),
  },
  {
    id: 'icon-led',
    name: 'LED 灯珠',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 12,
    svgContent: wrapSolid(`
      <path d="M20 38 V24 A12 12 0 0 1 44 24 V38 H48 V43 H16 V38 Z"/>
      <rect x="23" y="45" width="5" height="13" rx="1.5"/>
      <rect x="36" y="45" width="5" height="10" rx="1.5"/>
    `),
  },
  {
    id: 'icon-grommet',
    name: '3D打印 / 硅胶扣',
    category: '结构件',
    isBuiltIn: true,
    createdAt: 13,
    // Bold split-flange silhouette matching Excel's image8.png
    svgContent: wrapSolid(`
      <path d="M10 10 H27 V54 H21 L15 44 V22 H10 Z"/>
      <path d="M54 10 H37 V54 H43 L49 44 V22 H54 Z"/>
    `),
  },
  {
    id: 'icon-pinheader',
    name: '排针 / 线材',
    category: '接口',
    isBuiltIn: true,
    createdAt: 14,
    svgContent: wrapSolid(`
      <rect x="8" y="26" width="48" height="14" rx="2"/>
      <rect x="16" y="10" width="6" height="16" rx="1.5"/>
      <rect x="29" y="10" width="6" height="16" rx="1.5"/>
      <rect x="42" y="10" width="6" height="16" rx="1.5"/>
      <rect x="16" y="40" width="6" height="14" rx="1.5"/>
      <rect x="29" y="40" width="6" height="14" rx="1.5"/>
      <rect x="42" y="40" width="6" height="14" rx="1.5"/>
    `),
  },
  {
    id: 'icon-box',
    name: '通用零件',
    category: '通用',
    isBuiltIn: true,
    createdAt: 15,
    svgContent: wrapSolid(`
      <polygon points="32,8 56,20 32,32 8,20"/>
      <polygon points="8,24 30,35 30,56 8,45"/>
      <polygon points="56,24 34,35 34,56 56,45"/>
    `),
  },
]

export const DEFAULT_PARTS: PartItem[] = [
  { id: 'part-1', name: '内六角螺丝', category: '紧固件', iconId: 'icon-screw-hex', defaultText: 'M2', createdAt: 1 },
  { id: 'part-2', name: '六角螺母', category: '紧固件', iconId: 'icon-nut', defaultText: 'M3', createdAt: 2 },
  { id: 'part-3', name: '沉头螺丝', category: '紧固件', iconId: 'icon-screw-flat', defaultText: 'M3×8', createdAt: 3 },
  { id: 'part-4', name: '诱骗芯片', category: '电子元件', iconId: 'icon-chip', defaultText: 'CH224K', createdAt: 4 },
  { id: 'part-5', name: '散热片', category: '电子元件', iconId: 'icon-heatsink', defaultText: '10×10', createdAt: 5 },
  { id: 'part-6', name: '陀螺仪', category: '模块', iconId: 'icon-gyro', defaultText: 'MPU6050\n6轴IMU | I2C', createdAt: 6 },
  { id: 'part-7', name: '充放模块', category: '模块', iconId: 'icon-module', defaultText: '5V/3A', createdAt: 7 },
  { id: 'part-8', name: 'Type-C母座', category: '接口', iconId: 'icon-typec', defaultText: '16P 贴片', createdAt: 8 },
  { id: 'part-9', name: 'USB-A公头', category: '接口', iconId: 'icon-usba', defaultText: '贴片焊板', createdAt: 9 },
  { id: 'part-10', name: '工字硅胶扣', category: '结构件', iconId: 'icon-grommet', defaultText: '孔5.5/内3', createdAt: 10 },
]

export const DEFAULT_SIZE_PRESETS: LabelSizePreset[] = [
  {
    id: 'small',
    name: '小号',
    widthMm: 10,
    heightMm: 13,
    defaultFontSizePt: 5.5,
    defaultSplitRatio: 0.56,
    description: '10×13 mm · 简洁规格',
    isBuiltIn: true,
  },
  {
    id: 'medium',
    name: '中号',
    widthMm: 15,
    heightMm: 20,
    defaultFontSizePt: 6.0,
    defaultSplitRatio: 0.44,
    description: '15×20 mm · 多行说明',
    isBuiltIn: true,
  },
]

export const PAPER_PRESETS = [
  { id: '60x40', name: '60 × 40 mm（常用小纸）', widthMm: 60, heightMm: 40 },
  { id: '50x30', name: '50 × 30 mm', widthMm: 50, heightMm: 30 },
  { id: '70x50', name: '70 × 50 mm', widthMm: 70, heightMm: 50 },
  { id: '100x150', name: '100 × 150 mm（热敏大纸）', widthMm: 100, heightMm: 150 },
  { id: 'a4', name: 'A4（210 × 297 mm）', widthMm: 210, heightMm: 297 },
  { id: 'custom', name: '自定义尺寸', widthMm: 60, heightMm: 40 },
]
