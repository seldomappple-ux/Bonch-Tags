import type { IconAsset, LabelSizePreset, PartItem } from '../types/bonch'

const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

export const BUILT_IN_ICONS: IconAsset[] = [
  {
    id: 'icon-chip',
    name: '芯片 / MCU',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 1,
    svgContent: wrap(`
      <rect x="18" y="18" width="28" height="28" rx="3"/>
      <rect x="25" y="25" width="14" height="14" rx="1.5"/>
      <path d="M24 10v8M32 10v8M40 10v8"/>
      <path d="M24 46v8M32 46v8M40 46v8"/>
      <path d="M10 24h8M10 32h8M10 40h8"/>
      <path d="M46 24h8M46 32h8M46 40h8"/>
    `),
  },
  {
    id: 'icon-screw-hex',
    name: '内六角螺丝',
    category: '紧固件',
    isBuiltIn: true,
    createdAt: 2,
    svgContent: wrap(`
      <rect x="20" y="10" width="24" height="12" rx="3"/>
      <path d="M27 16h10"/>
      <path d="M25 22v28l7 4 7-4V22"/>
      <path d="M25 29h14M25 36h14M25 43h14"/>
    `),
  },
  {
    id: 'icon-nut',
    name: '六角螺母',
    category: '紧固件',
    isBuiltIn: true,
    createdAt: 3,
    svgContent: wrap(`
      <polygon points="32,10 52,21 52,43 32,54 12,43 12,21"/>
      <circle cx="32" cy="32" r="10"/>
    `),
  },
  {
    id: 'icon-typec',
    name: 'Type-C 接口',
    category: '接口',
    isBuiltIn: true,
    createdAt: 4,
    svgContent: wrap(`
      <rect x="8" y="20" width="48" height="24" rx="12"/>
      <rect x="18" y="29" width="28" height="6" rx="3" fill="currentColor"/>
    `),
  },
  {
    id: 'icon-usba',
    name: 'USB-A 接口',
    category: '接口',
    isBuiltIn: true,
    createdAt: 5,
    svgContent: wrap(`
      <rect x="12" y="14" width="40" height="24" rx="2"/>
      <rect x="18" y="38" width="28" height="12" rx="2"/>
      <rect x="21" y="21" width="6" height="6"/>
      <rect x="37" y="21" width="6" height="6"/>
    `),
  },
  {
    id: 'icon-gyro',
    name: '陀螺仪 / IMU',
    category: '模块',
    isBuiltIn: true,
    createdAt: 6,
    svgContent: wrap(`
      <ellipse cx="32" cy="32" rx="22" ry="9"/>
      <ellipse cx="32" cy="32" rx="9" ry="22"/>
      <circle cx="32" cy="32" r="4" fill="currentColor"/>
    `),
  },
  {
    id: 'icon-module',
    name: '电源/功能模块',
    category: '模块',
    isBuiltIn: true,
    createdAt: 7,
    svgContent: wrap(`
      <rect x="12" y="14" width="40" height="36" rx="3"/>
      <circle cx="18" cy="20" r="2" fill="currentColor"/>
      <circle cx="46" cy="20" r="2" fill="currentColor"/>
      <circle cx="18" cy="44" r="2" fill="currentColor"/>
      <circle cx="46" cy="44" r="2" fill="currentColor"/>
      <path d="M34 22l-7 11h7l-4 9"/>
    `),
  },
  {
    id: 'icon-heatsink',
    name: '散热片',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 8,
    svgContent: wrap(`
      <path d="M10 46h44v6H10z"/>
      <path d="M14 46V16M23 46V16M32 46V16M41 46V16M50 46V16"/>
    `),
  },
  {
    id: 'icon-resistor',
    name: '电阻',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 9,
    svgContent: wrap(`
      <path d="M8 32h10l3-9 6 18 6-18 6 18 3-9h14"/>
    `),
  },
  {
    id: 'icon-capacitor',
    name: '电容',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 10,
    svgContent: wrap(`
      <path d="M10 32h16M38 32h16"/>
      <path d="M26 16v32M38 16v32"/>
    `),
  },
  {
    id: 'icon-led',
    name: 'LED 灯珠',
    category: '电子元件',
    isBuiltIn: true,
    createdAt: 11,
    svgContent: wrap(`
      <path d="M22 38V24a10 10 0 0 1 20 0v14"/>
      <path d="M18 38h28"/>
      <path d="M27 38v14M37 38v10"/>
      <path d="M46 14l5-4M49 21l5-2"/>
    `),
  },
  {
    id: 'icon-grommet',
    name: '3D打印 / 硅胶扣',
    category: '结构件',
    isBuiltIn: true,
    createdAt: 12,
    svgContent: wrap(`
      <path d="M16 14h32M16 50h32"/>
      <rect x="22" y="14" width="20" height="36" rx="2"/>
      <line x1="32" y1="22" x2="32" y2="42" stroke-dasharray="3 4"/>
    `),
  },
  {
    id: 'icon-pinheader',
    name: '排针 / 线材',
    category: '接口',
    isBuiltIn: true,
    createdAt: 13,
    svgContent: wrap(`
      <rect x="12" y="28" width="40" height="10" rx="2"/>
      <path d="M20 14v14M32 14v14M44 14v14"/>
      <path d="M20 38v12M32 38v12M44 38v12"/>
    `),
  },
  {
    id: 'icon-box',
    name: '通用零件',
    category: '通用',
    isBuiltIn: true,
    createdAt: 14,
    svgContent: wrap(`
      <polygon points="32,10 52,20 52,44 32,54 12,44 12,20"/>
      <path d="M12 20l20 10 20-10M32 30v24"/>
    `),
  },
]

export const DEFAULT_PARTS: PartItem[] = [
  { id: 'part-1', name: '六角螺丝', category: '紧固件', iconId: 'icon-screw-hex', defaultText: 'M2', createdAt: 1 },
  { id: 'part-2', name: '六角螺母', category: '紧固件', iconId: 'icon-nut', defaultText: 'M3', createdAt: 2 },
  { id: 'part-3', name: '诱骗芯片', category: '电子元件', iconId: 'icon-chip', defaultText: 'CH224K', createdAt: 3 },
  { id: 'part-4', name: '陀螺仪', category: '模块', iconId: 'icon-gyro', defaultText: 'MPU6050\n6轴IMU | I2C', createdAt: 4 },
  { id: 'part-5', name: 'Type-C母座', category: '接口', iconId: 'icon-typec', defaultText: '16P 贴片', createdAt: 5 },
  { id: 'part-6', name: '散热片', category: '电子元件', iconId: 'icon-heatsink', defaultText: '10×10', createdAt: 6 },
  { id: 'part-7', name: '充放模块', category: '模块', iconId: 'icon-module', defaultText: '5V/3A', createdAt: 7 },
  { id: 'part-8', name: '硅胶扣', category: '结构件', iconId: 'icon-grommet', defaultText: '孔5.5/内3', createdAt: 8 },
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
    defaultFontSizePt: 6.2,
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
