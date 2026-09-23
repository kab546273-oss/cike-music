# 此刻音乐 — 一本可以听的 AI 音乐手账

> 基于 LLM 意图理解 + 可解释推荐算法 + 用户负反馈闭环的 AI 音乐场景助手。

## 项目定位

这不是一个手账风音乐网站，而是一个**完整的 AI 产品 Demo**，展示：

- **Natural Language Understanding** — 真实 LLM API 将自然语言转为结构化音乐偏好
- **Structured Output** — LLM 严格输出 JSON Schema（scene / mood / bpm / vocal / exclude_style / confidence）
- **Recommendation Engine** — 硬过滤 → 五维软评分 → 场景权重 → 多样性打散 → TOP10
- **Negative Feedback Loop** — 连续跳过 2 首触发动态重生成，收紧 BPM、扩展排除风格、切换情绪
- **Dynamic Playlist Regeneration** — Paper Shuffle 动效呈现 AI 重新理解的过程
- **AI Interaction Design** — AI 理解结果可视化、5 步解析状态、重新生成动画
- **Full-Stack Architecture** — Next.js App Router + Route Handlers + 三层分离
- **Scrapbook Design System** — Vintage Music Journal 视觉语言

## 技术栈

| 层 | 技术 |
|---|---|
| Frontend | Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide React |
| Backend | Next.js Route Handlers · Server-side business logic · LLM API |
| Data | music.json (198 首) · localStorage |
| Validation | Zod |

## 三层架构

```
Browser (UI / Animation / Player / localStorage)
    │  fetch POST
    ▼
Next.js Route Handlers (/api/parse, /api/recommend, /api/feedback, /api/events)
    │
    ├── LLM Intent Layer (lib/llm/) — 理解用户自然语言，输出结构化偏好
    ├── Recommendation Engine (lib/recommendation/) — 硬过滤 + 软评分 + 多样性
    ├── Feedback Engine (lib/feedback/) — 负反馈计算与偏好调整
    └── Data Layer (lib/data.ts) — music.json 加载
```

**LLM = 意图理解层**，只负责理解，不选歌。
**Recommendation Engine = 音乐排序层**，纯函数，不知道 React。
**Frontend = 用户体验层**，不实现推荐算法。

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量（复制并填入你的 LLM API Key）
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

### 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `LLM_API_KEY` | LLM API 密钥（仅服务端） | — |
| `LLM_MODEL` | 模型名称 | `gpt-4o-mini` |
| `LLM_API_BASE_URL` | API 基础 URL（OpenAI 兼容） | `https://api.openai.com/v1` |
| `LLM_TIMEOUT_MS` | 请求超时（毫秒） | `8000` |
| `LLM_MIN_CONFIDENCE` | 最低置信度阈值 | `0.5` |

> 未配置 `LLM_API_KEY` 时，自然语言输入会优雅降级到场景选择 UI，不会崩溃。

## API 设计

### POST /api/parse
调用 LLM 将自然语言转换为结构化音乐偏好。

```json
// Request
{ "text": "下午有点累，想喝杯咖啡看会儿书" }

// Response
{
  "success": true,
  "preferences": {
    "scene": "reading", "mood": "relaxed",
    "bpm_min": 70, "bpm_max": 90,
    "vocal": "low", "exclude_style": ["rock", "edm"],
    "confidence": 0.92
  }
}
```

### POST /api/recommend
推荐引擎返回 TOP10 + 推荐上下文。

### POST /api/feedback
负反馈处理，返回调整后的偏好和新歌单。

### POST /api/events
行为埋点（Demo 阶段 console.log）。

## 推荐算法

1. **硬过滤** — 排除无版权、BPM 越界、风格命中 exclude_style 的歌曲
2. **软评分** — BPM（高斯衰减）、Vocal（距离分级）、Style（场景偏好映射）、Mood（直接/相关/基线）、History（惩罚）
3. **场景权重** — 运动场景加重 BPM，安静场景加重 Mood + Vocal
4. **总分排序** — 加权求和降序
5. **多样性打散** — 同歌手 ≤2 首、同专辑 ≤1 首、前 5 首覆盖 ≥2 风格

## 负反馈机制

- 同一歌单连续跳过 ≥2 首 → 触发动态重生成
- 被跳歌曲 style 加入 exclude_style
- BPM 区间向中点收窄 25%
- 被跳歌曲 mood 与原 mood 重合时切换到相关情绪
- 一轮最多重新生成 2 次，超过提示换描述
- 完整播放超过 70% → skip 计数归零

## 项目结构

```
app/
├── page.tsx              # 首页"此刻"
├── playlist/page.tsx     # AI 生成歌单
├── library/page.tsx      # 我的歌单
└── api/
    ├── parse/route.ts
    ├── recommend/route.ts
    ├── feedback/route.ts
    └── events/route.ts
components/
├── scrapbook/            # PaperCard, Tape, Sticker, Stamp, StickyNote, HandwrittenLabel
├── music/                # SceneCard, MoodTag, SongCard, SongCover, PlaylistCard
├── ai/                   # AIThinking, AIInterpretation, AIRegeneration
├── player/               # PlayerBar, usePlayer
├── layout/               # Navbar
└── modals/               # MemberModal
lib/
├── llm/                  # client, parseIntent, schema, prompt
├── recommendation/       # index, scoring, diversity
├── feedback/             # 负反馈计算
├── storage/              # localStorage 封装
├── analytics/            # 埋点队列
├── data.ts               # music.json 加载
├── constants.ts          # 场景/情绪预设
└── utils.ts              # 工具函数
types/index.ts            # 统一 TypeScript 类型
data/music.json           # 198 首歌曲数据
```

## 视觉系统

- **色彩**：米色纸张 #F4EBDD · 纸张 #EFE3D2 · 墨色 #302B27 · 棕 #6B5745 · 橄榄 #84906B · 砖红 #B86F5E · 奶油黄 #E4C778
- **字体**：Caveat（手写体，仅大标题/标签/装饰）· Inter + Noto Sans SC（正文/数据/按钮）
- **动效**：Paper Motion — rotate / translate / scale / spring / subtle opacity
- **纹理**：全局纸张噪点，不影响文字可读性
