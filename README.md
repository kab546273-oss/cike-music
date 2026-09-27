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
| Data | music.json (200 首) · localStorage |
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

失败时返回可判定的原因码，前端据此给出不同的降级文案，
服务端则把真实错误打进日志：

```json
{
  "success": false,
  "error": "PARSE_FAILED",
  "reason": "LLM_TIMEOUT"
}
```

`reason` ∈ `LLM_NOT_CONFIGURED` · `LLM_TIMEOUT` · `LLM_API_ERROR` ·
`INVALID_OUTPUT` · `LOW_CONFIDENCE` · `BAD_REQUEST` · `UNKNOWN`

### POST /api/recommend
推荐引擎返回 TOP10 + 推荐上下文（含 `relaxations`）。

```json
// Request
{
  "preferences": { "...": "..." },
  "history": ["s030", "s032"],
  "regenerationCount": 0
}
```

### POST /api/feedback
负反馈处理，返回调整后的偏好**和已经算好的新歌单**（客户端直接用，
不需要再请求 /api/recommend）。请求体可带 `history`。

### POST /api/events
行为埋点（Demo 阶段 console.log，只记录事件名，不记录用户输入原文）。

## 推荐算法

1. **硬过滤** — 排除无版权、BPM 越界、风格命中 exclude_style 的歌曲
2. **软评分** — BPM（高斯衰减）、Vocal（距离分级）、Style（场景偏好映射）、Mood（直接/相关/基线）、History（惩罚）
3. **场景权重** — 运动场景加重 BPM，安静场景加重 Mood + Vocal
4. **总分排序** — 加权求和降序
5. **多样性打散** — 同歌手 ≤2 首、同专辑 ≤1 首、前 5 首覆盖 ≥2 风格

### 主动让步（relaxations）

曲库满足不了请求时，引擎不会静默返回别的东西，而是按
**人声档位 → BPM 区间 → 排除风格** 的顺序让步，并把每一步写进
`context.relaxations`，由 `AIInterpretation` 如实展示「这一批我做了点让步」。

例：曲库里 `vocal_level = "none"` 只有 7 首且都在 120 BPM 以上，
所以安静场景点「无人声」时，卡片会说明已放宽到「低人声」，
而不是卡片写着无人声、歌单里全是有人声的歌。

## 曲库词表（重要）

`lib/constants.ts` 是唯一的词表来源，`CATALOG_STYLES` / `CATALOG_MOODS`
必须与 `data/music.json` 保持一致：

- `SCENE_STYLE_WEIGHTS`、`MOOD_RELATIONS` 只能用曲库里真实存在的标签。
  历史上这张表写过 lo-fi / chillhop / ambient / classical / lullaby / bossa
  —— 这 6 个标签在 200 首里一首都没有，导致自习 / 备考 / 撸猫场景
  只有 5% 的歌能在风格维度拿到区分度（风格权重被静默浪费）。
- LLM 的 prompt 词表由 constants 注入（`lib/llm/prompt.ts`），
  模型不会再被要求输出曲库里没有的标签。
- 历史标签仍可通过 `STYLE_ALIASES` 映射（lo-fi → chill / electronic …），
  所以排除风格与场景偏好都不会因为旧标签而失效。

改完词表请跑：

```bash
npm run audit:vocab   # 风格权重表 / 心情关联表 是否与曲库对得上
npm run lint
npx tsc --noEmit
```

`audit:vocab` 会列出每个场景的风格覆盖率，并对"表里写了、曲库没有"
的标签返回退出码 1。当前覆盖率（修复前 → 修复后）：

| 场景 | 修复前 | 修复后 |
|---|---|---|
| 自习 | 5% | 29% |
| 备考 | 5% | 24% |
| 撸猫 | 5% | 27% |
| 阅读 | 12% | 27% |
| 午后 | 19% | 50% |
| 其余 9 个场景 | 33%~68% | 45%~74% |

## 负反馈机制

- 同一歌单连续跳过 ≥2 首 → 触发动态重生成
- 客户端**并行**发起 `/api/feedback` 与纸片翻页动画（旧版要等动画 3.7s 播完才发请求）
- 动画里展示的 chip 来自接口返回的真实差异（新增的排除风格 / 新情绪 / 新 BPM 区间），
  不再是写死的示意文案
- 重生成后的歌单直接复用 `/api/feedback` 返回的 songs，不再多打一次 `/api/recommend`
- 已播放/已跳过的歌曲 id 会随请求带上（`history`），避免重生成后重复出现
- 被跳歌曲 style 加入 exclude_style
- BPM 区间向中点收窄 25%
- 被跳歌曲 mood 与原 mood 重合时切换到相关情绪
- 一轮最多重新生成 2 次，超过提示换描述
- 完整播放超过 70% → skip 计数归零

> 规则常量（跳几首触发、上限几次、提示文案、最短思考时长）统一放在
> `lib/constants.ts`，客户端与服务端共用一份，避免两边漂移。

## 最近播放

`localStorage.cike_music_history` 保存最近播放/跳过的歌曲 id（上限 200），
随 `/api/recommend` 与 `/api/feedback` 一起上传，让 History 这一维真正生效
（旧版永远发 `history: []`，该维度恒为常数，等于没实现）。

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
- **手绘图形**：`components/scrapbook/Doodles.tsx`（48 网格，封面涂鸦 / 卡带 / 麦克风）、`Characters.tsx`（32 网格，进度条上的走路小人）、`DoodleIcons.tsx`（24 网格，14 个场景 + 12 个心情图标）
- **线重规则**：48 网格缩到 20px 左右展示时描边会偏细，需补偿——例如 `.think-icon svg[viewBox="0 0 48 48"] { stroke-width: 2.6 }`；24 网格直接用 1.4 即可
- **纸片家族**：`paper-card`（主纸面）· `paper-slip`（同族浅色纸片，用于 Tips 与歌单页提示）· `Tape`（和纸胶带，永远 `pointer-events-none`）

## 动效规范

> 原则：**像纸和笔在动，而不是像 UI 在缩放**。位移都带一点旋转，落地要有一点回弹，线条是"画"出来的而不是"淡入"的；一屏里只允许一个持续动的东西（现在全站只有过场的卡带卷盘），其余都是单次播放。

### 时长与缓动

| 用途 | 值 |
|---|---|
| 微交互（hover 抬起 / 换色） | 180–220ms ease |
| 落纸（纸片、胶带贴上） | 300ms `cubic-bezier(.3,1.25,.5,1)` |
| 画线 / 写字（mask 揭示） | 420–500ms ease-out；导航下划线 320ms |
| 元素入场 | `spring(stiffness 260–320, damping 22–26)` |
| 退出（卡片 / 弹层 / 折回） | ~250ms ease + 轻微位移与缩放 |
| 持续动效 | 线性、不加速：卡带卷盘 1.1s/圈 ·「正在理解」的三个小点 `think-bump` 1.1s |
| 进度条小人 | `charWalk` 0.7s 循环 + 尘埃 `dustFade` 0.8s |
| 模拟播放心跳 | 500ms 一次（`usePlayer`），播到 70% 视为完整播放 |

### 三处关键时间线

**① 首页开场（`components/home/HeroNote.tsx`）**

```
0.00s  胶带落下 0.5s（rotate -14° → -3°）
0.00s  标题逐字写出：每字间隔 60ms、每字 0.5s mask；笔尖按总时长横移后淡出
       （总时长 = 标题字数 × 60ms + 450ms）
全程    鼠标移动 → 贴纸视差：远处 ±5px、近处 ±9px（reduced-motion 下关闭）
点撕角  Tips 纸片展开 spring(260, 22)，6s 后自动折回；鼠标停在上面时不收
轮播    输入框示例每 4s 换一句（正在打字或解析时暂停）
提交    便签内容换成"正在理解这一刻…"，跳转歌单页后由 AIThinking 接着演
```

**② 过场（`components/ai/AIThinking.tsx`）——必须短于 MIN_AI_THINKING_MS**

```
0.00s  笔尖沿左缘往下走 1.8s（每行 0.36s）
每行    写实 0.42s（clip-path 从左往右）→ +0.12s 画 ✓ 0.3s → +0.18s 贴胶带 0.3s
全程    卡带两卷盘反向旋转 1.1s/圈（唯一的持续动效）
1.95s  笔尖淡出；2.05s 揭晓"✦ 10 首刚刚好的歌"
>4.0s  浮出"还在整理，马上好"（SLOW_HINT_MS）
```

⚠️ 改五步的步进时必须满足 `5 × STEP_STAGGER + 0.6s < MIN_AI_THINKING_MS`。旧版用 0.55s 步进（2.75s）超过 2.2s 的预算，导致**第 5 步"为你整理音乐"从来没出现在屏幕上**。

**③ 歌单页**

```
列表行入场     spring(260, 24)，每行额外 rotate(-0.5° + i × 0.15°)
重生成弹层     0.65 / 1.25 / 2.0 / 2.6 / 3.2 / 3.7s 六个节点，与 /api/feedback 并行
播放条上滑     spring(260, 26)
```

### 常量的唯一来源

| 常量 | 位置 | 作用 |
|---|---|---|
| `MIN_AI_THINKING_MS` | `lib/constants.ts` | 过场最短展示时长，动效预算上限（当前 2.6s） |
| `SKIP_THRESHOLD` / `MAX_REGENERATIONS` | `lib/constants.ts` | 连跳几次触发重生成、一轮上限 |
| `STEP_STAGGER` / `WRITE_DURATION` / `TICK_AFTER` / `TAPE_AFTER` / `SLOW_HINT_MS` | `components/ai/AIThinking.tsx` | 过场步进与延迟 |
| `WRITE_STEP` / `HINT_AUTO_FOLD_MS` | `components/home/HeroNote.tsx` | 标题写字速度 / Tips 自动折回 |
| `HINT_INTERVAL_MS` | `app/page.tsx` | 输入框示例轮播 |

### 无障碍降级

`prefers-reduced-motion: reduce` 下：标题直接显示（不逐字写）· 笔尖隐藏 · Tips 不做展开/折回 · 卡带停转 · 过场清单直接呈现最终态。**新增动效时请把对应规则补进 `globals.css` 末尾的两个 `@media (prefers-reduced-motion: reduce)` 块。**

### 三条红线

1. **除播放器外，一屏只留一个持续动效**：常驻动画只有过场的卡带卷盘（导航 logo 的胶带只在首屏播一次；进度条上的走路小人属于"正在播放"的状态指示）。
2. **过场必须留够预算**：动效时间线要短于 `MIN_AI_THINKING_MS`，否则会出现"动画没播完就被卸载"。
3. **线条用"画"的方式出场**：手绘元素优先用 `stroke-dashoffset` 或 `clip-path` 的遮罩揭示，不要用 opacity 淡入——这是这套视觉最容易露馅的地方。

## 质量检查

```bash
npm run lint          # eslint
npx tsc --noEmit      # 类型检查
npm run build         # 生产构建
```

当前状态：`eslint` 0 error 0 warning · `tsc --noEmit` 通过 · `next build` 通过。

## 已知限制（曲库层面）

这些都需要动 `data/music.json`，不是代码能补的：

| 现象 | 数据现状 | 影响 |
|---|---|---|
| 安静场景风格区分度低 | 曲库没有 lo-fi / chillhop / ambient / classical 类曲目 | 自习 / 备考 / 撸猫只有 5% 的歌能在风格维度得分 |
| 「无人声」不可得 | `vocal_level = "none"` 仅 7 首，BPM 120~225 | 安静场景点「无人声」会触发让步提示，实际返回低人声歌曲 |
| 「高人声」不可得 | `vocal_level = "high"` 0 首 | 跑步 / 健身 / 逛街的人声偏好最多只能到 0.6 |
| 惬意 / 慵懒情绪 | 曲库没有 relaxed / lazy 标签 | 这两个心情 chip 只能靠相关情绪拿 0.5 |

> 补一批 60–90 BPM 的纯音乐 / 环境曲目，是提升「自习 / 阅读 / 午后」
> 体感最划算的一件事。

## 其他说明

- **播放器是模拟的**：`usePlayer` 用 500ms 计时器推进进度，没有真实音频；
  `is_lossless` 目前只用于歌单行上的「无损」角标。
- **推荐是确定性的**：同一份偏好永远得到同一批结果，方便复现与测试。
  若想让手账有"每次都不一样"的感觉，需要在排序后加入带种子的抖动。
- **从「我的歌单」进入是原样回放**（`/playlist?id=…` 直接用保存的歌曲），
  不会再重新推荐一份"看起来差不多"的歌单。
- **心情标签是单选**：`MusicPreferences.mood` 只能表达一个心情，
  所以 chip 做成单选，而不是让用户选三个、静默生效一个。
- **`has_copyright` 全为 true**：硬过滤里的无版权规则目前不会命中，
  它是留给真实曲库的护栏。
- **密钥**：`.env.local` 已被 `.gitignore` 覆盖，不会进版本库；
  但只要它出现在聊天记录、日志或截图里，就该去火山方舟后台轮换一次。
