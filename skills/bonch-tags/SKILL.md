---
name: bonch-tags
description: Generate and load parts-organizer label sheets directly into Bonch Tags from natural language. Use when the user asks to create, batch-generate, or draw icons for small/medium parts storage labels (e.g., screws, nuts, chips, modules, 3D-printed parts) and open them in Bonch Tags for printing.
---

# Bonch Tags Agent Skill

Use this skill whenever the user asks you to generate parts-organizer labels, pick a size (小号 `10×13mm` / 中号 `15×20mm`), reuse existing icons, or draw new bold monochrome SVG icons and load them straight into **Bonch Tags** for printing.

## 1. Built-in Icon IDs (Reuse First!)

Always reuse a built-in icon ID when it matches the user's part:

| `iconId` | Meaning | Category |
| :--- | :--- | :--- |
| `icon-nut` | 六角螺母 / 外牙螺母 | 紧固件 |
| `icon-screw-hex` | 内六角螺丝 / 圆柱头螺丝 | 紧固件 |
| `icon-screw-flat` | 沉头螺丝 / 平头螺丝 | 紧固件 |
| `icon-chip` | 芯片 / MCU / IC (STM32, CH224K) | 电子元件 |
| `icon-heatsink` | 散热片 | 电子元件 |
| `icon-resistor` | 电阻 | 电子元件 |
| `icon-capacitor` | 电容 | 电子元件 |
| `icon-led` | LED 灯珠 / 发光二极管 | 电子元件 |
| `icon-gyro` | 陀螺仪 / IMU 模块 (MPU6050, QMI8658) | 模块 |
| `icon-module` | 电源 / 充放 / 功能模块 | 模块 |
| `icon-typec` | Type-C 母座 / 接口 | 接口 |
| `icon-usba` | USB-A 公头 / 接口 | 接口 |
| `icon-pinheader` | 排针 / 线材 / 连接器 | 接口 |
| `icon-grommet` | 3D打印 / 工字硅胶扣 / 结构件 | 结构件 |
| `icon-box` | 通用零件 / 杂项 | 通用 |

## 2. Drawing New Icons (`newIcons`)

If no built-in icon matches, draw a brand-new SVG icon following **Bonch Tags Bold Solid Silhouette** rules:
- `viewBox="0 0 64 64"`, transparent background (NO white/black background `<rect>`).
- **Bold solid black silhouette style** (`fill="currentColor"`), using `fill-rule="evenodd"` for crisp white interior cutouts. Avoid thin hairlines — icons are printed at `6~8 mm` on 203 DPI thermal/dye-sub printers.
- Keep ~6px padding around the edges inside `64×64`.
- Give each new icon a unique `id` like `"icon-inductor"` or `"icon-washer"`.

## 3. Payload JSON Schema

Construct a JSON object with this structure:

```json
{
  "size": "small",
  "replace": true,
  "newIcons": [
    {
      "id": "icon-washer",
      "name": "平垫片",
      "category": "紧固件",
      "defaultText": "M3",
      "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M32 8 A24 24 0 1 1 32 56 A24 24 0 1 1 32 8 Z M32 22 A10 10 0 1 0 32 42 A10 10 0 1 0 32 22 Z\"/></svg>"
    }
  ],
  "items": [
    { "iconId": "icon-nut", "text": "M2" },
    { "iconId": "icon-nut", "text": "M2.5" },
    { "iconId": "icon-nut", "text": "M3" },
    { "iconId": "icon-nut", "text": "M4" }
  ]
}
```

- `size`: `"small"` (`10×13 mm`, short 1-line specs) | `"medium"` (`15×20 mm`, supports multi-line `\n` descriptions) | `"custom"` (with `customWidthMm`, `customHeightMm`).
- `replace`: `true` replaces the current print sheet; `false` appends to existing labels on the sheet.
- `paperOrientation` (optional): `"landscape"` | `"portrait"`.
- `items`: array of `{ iconId, text, fontSizeOverridePt? }`.

## 4. Load Directly into Bonch Tags

Run the bundled script `scripts/apply_sheet.py` to open Bonch Tags with the generated sheet loaded and ready to print:

```bash
python scripts/apply_sheet.py --json '{"size":"small","replace":true,"items":[{"iconId":"icon-nut","text":"M2"},{"iconId":"icon-nut","text":"M3"}]}'
```

- For local Windows installation, `apply_sheet.py` automatically starts the local Bonch Tags server on `http://127.0.0.1:5178/` if it is not running yet, then opens the `#import=...` URL in the default browser.
- Add `--web` to generate and open a link targeting the public GitHub Pages site (`https://seldomappple-ux.github.io/Bonch-Tags/`).
- Add `--no-open` to only print the clickable URL without launching a browser.
