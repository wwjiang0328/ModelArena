# 国产大模型天梯榜 - AI Arena

基于 SuperCLUE（2026年3月）和 BenchLM.ai 权威评测数据，全面对比国产大模型在数学、编程、推理、智能体等核心维度的能力表现。

## 功能特色

- **TOP3 领奖台**：以竞技场风格展示综合排名前三的模型
- **综合排行榜**：11 款国产模型完整数据表格，支持按任意维度排序，点击展开详情
- **分维度深度对比**：编程、数学、智能体、SuperCLUE 总览四大 Tab 切换
- **模型侧重点卡片**：每个模型的核心优势与适用场景
- **场景选型指南**：编程助手、数学推理、AI 智能体等 6 大场景推荐
- **海外模型参考**：Claude / GPT / Gemini 对比参考（不参与排名）

## 技术栈

- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion（动画）
- Vite（构建工具）
- shadcn/ui（UI 组件库）

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build:vercel
```

## 部署到 Vercel

1. Fork 或 clone 本仓库
2. 在 [Vercel](https://vercel.com) 中导入该 GitHub 仓库
3. Vercel 会自动检测配置并部署，无需额外设置
4. 部署完成后即可通过 Vercel 分配的域名访问

### Vercel 配置说明

项目已包含 `vercel.json` 配置文件：
- **构建命令**：`pnpm run build:vercel`
- **输出目录**：`dist/public`
- **SPA 路由**：已配置 rewrites 支持客户端路由

## 数据来源

- [SuperCLUE](https://www.superclueai.com) — 中文大模型测评基准（2026年3月）
- [BenchLM.ai](https://benchlm.ai) — 全球大模型基准评测排行榜（2026年3月）
- [Chatbot Arena (LMSYS)](https://lmarena.ai) — 人类偏好盲测 Elo 排名

## 许可证

MIT License
