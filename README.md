# Bonch Tags

简洁明快的零件收纳小标签快速排版与 600 DPI 精准打印基座（本地浏览器运行、零打印驱动、支持 AI Agent Skill 一句话排版）。

## 在线使用（零安装）

- **在线版（GitHub Pages）**：`https://seldomappple-ux.github.io/Bonch-Tags/`（开启仓库 Pages 后自动部署）
- 数据完全保存在各自浏览器的本地存储中，支持一键导出 / 恢复 `.json` 全量备份包。

## 核心特性

- **四层解耦基座**：图标库 / 零件库 / 尺寸与样式 / 纸张与打印完全分离，切换打印机或扩展新款式无需重做。
- **两档常用黑白上下双格尺寸**（支持随时自定义 mm）：
  - **小号 `10 × 13 mm`**：上格粗实心剪影图标 + 下格简短规格（如 `M2`、`CH224K`）
  - **中号 `15 × 20 mm`**：上格图标 + 下格多行详细说明（如 `MPU6050 / 6轴IMU | I2C`）
- **无缝相连（共享边框）**：相邻标签共享单倍线宽边框，无白缝，一刀裁切精准保持 `10.0 × 13.0 mm`。
- **600 DPI 1:1 物理毫米 PDF 打印引擎**：彻底消除浏览器自带页眉页脚（日期/网址/页码），所见即所得。
- **热升华 / 热敏专属预热引导条**：支持在出纸方向前端或前后两端自动添加纯黑矢量预热条，防止首排线条发虚。
- **AI Agent Skill 原生接入**：自带 [skills/bonch-tags/SKILL.md](skills/bonch-tags/SKILL.md)，让任意支持 Skill 的 AI Agent 读完即可帮你一句话选尺寸、复用或绘制黑白剪影 SVG 图标，并直接把排好的标签单载入 Bonch Tags 打印。

## 本地运行

```bash
npm install
npm run dev
```

Windows 用户也可以直接双击 `scripts/launch-bonch-tags.vbs`（无黑框静默启动本地服务并自动打开浏览器）。

## 开源协议

[MIT License](LICENSE)
