# 此刻音乐 (Cike Music) — 产品开发文档

> 本文档面向 AI 分析工具，用于快速理解项目全貌、架构、数据流和设计决策。



***

## 1. 产品定位

**一句话**：用户用自然语言描述 "此刻状态"（如 "下午有点累，想喝杯咖啡看会儿书"），LLM 解析为结构化音乐偏好，从 253 首曲库中推荐 10 首歌，生成一本 "音乐手账"。

**差异化**：



* 不是搜索 / 分类式音乐 App，而是 "状态 → 歌单" 的场景化推荐

* 视觉风格是手绘手账 / 拼贴 / 音乐日记，不是工具型播放器

* 有负反馈闭环：跳过歌曲后 AI 自动调整偏好重新推荐

**目标用户**：想要 "被推荐" 而非 "自己找歌" 的年轻用户，重视情绪氛围而非具体歌手。



***

## 2. 技术栈



| 层   | 技术                                              |
| --- | ----------------------------------------------- |
| 框架  | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式  | Tailwind CSS v4                                 |
| 动画  | Framer Motion                                   |
| LLM | 火山方舟 doubao-seed-2-1-lite（OpenAI 兼容接口）          |
| 数据  | 纯前端 localStorage（无后端数据库）                        |
| 曲库  | 本地 JSON 文件（253 首）                               |



***

## 3. 页面结构



| 路由                | 页面   | 功能                                 |
| ----------------- | ---- | ---------------------------------- |
| `/`               | 首页   | 自然语言输入框 + 心情标签 + 14 个场景卡片          |
| `/playlist?p=xxx` | 歌单页  | AI 解读卡片 + 10 首歌列表 + 播放器 + 保存 / 换一批 |
| `/library`        | 我的歌单 | 已保存歌单列表 + "我喜欢" 虚拟歌单               |



***

## 4. 核心数据流

### 4.1 首次推荐流程



```
用户输入自然语言

&#x20; → POST /api/parse { text }

&#x20; → LLM 输出结构化 MusicPreferences (JSON)

&#x20; → POST /api/recommend { preferences, history }

&#x20; → 推荐引擎按 BPM/风格/情绪/人声/历史惩罚打分

&#x20; → 返回 10 首歌 + RecommendationContext

&#x20; → 前端渲染歌单
```

### 4.2 负反馈流程（跳过歌曲）



```
用户跳过歌曲

&#x20; → 记录到 skippedSongs

&#x20; → 连续跳过 ≥ 3 首后触发

&#x20; → POST /api/feedback { preferences, skippedSongs, history }

&#x20; → 分析被跳过歌曲特征，调整 preferences（排除风格、收窄 BPM、切情绪）

&#x20; → 返回新的 10 首歌 + 调整说明

&#x20; → 前端播放"纸片翻页"动画展示调整了什么

&#x20; → 最多重生成 2 次
```

### 4.3 播放历史



```
每首歌播放完成 → 写入 localStorage (cike\_music\_history, 最多 200 条)

下次推荐时 → 历史歌曲在评分中降权
```



***

## 5. 数据模型

### Song（歌曲）



```
{

&#x20; id: string;

&#x20; title: string;

&#x20; artist: string;

&#x20; album: string;

&#x20; duration: number;        // 秒

&#x20; bpm: number;             // 60-225

&#x20; vocal\_level: "none" | "low" | "medium" | "high";

&#x20; is\_instrumental: boolean;

&#x20; style: string\[];         // 标签，如 \["lo-fi", "chillhop"]

&#x20; mood: string\[];          // 标签，如 \["relaxed", "lazy"]

&#x20; has\_copyright: boolean;

&#x20; is\_lossless: boolean;

}
```

### MusicPreferences（用户偏好，LLM 输出）



```
{

&#x20; scene: string | null;         // study/work/tipsy/afternoon/...

&#x20; mood: string | null;          // happy/relaxed/romantic/focused/...

&#x20; bpm\_min: number;              // 如 60

&#x20; bpm\_max: number;              // 如 90

&#x20; vocal: "none"|"low"|"medium"|"high";

&#x20; exclude\_style: string\[];      // 要排除的风格标签

&#x20; confidence: number;          // 0-1，LLM 对解析结果的置信度

}
```

### Playlist（已保存歌单）



```
{

&#x20; id: string;

&#x20; name: string;

&#x20; createdAt: number;

&#x20; songs: Song\[];

&#x20; preferences: MusicPreferences;

&#x20; context: RecommendationContext;

}
```



***

## 6. 曲库概况



* **总数**：253 首

* **来源**：中日韩英美真实歌曲

* **BPM 范围**：60–225（覆盖 60-90 纯音乐段、90-120 流行段、120-225 高能段）

* **人声分布**：none=48（含 41 首纯音乐）、low、medium、high=12

* **风格标签**（39 个）：pop, rock, jazz, classical, electronic, hip-hop, rnb, folk, country, lo-fi, ambient, chillhop, indie, acoustic, piano, cinematic, bossa\_nova, city\_pop, k\_pop, j\_pop, mandopop, cantopop, reggae, blues, soul, funk, disco, synthwave, post\_rock, shoegaze, dream\_pop, trip\_hop, downtempo, house, techno, trance, drum\_and\_bass, reggaeton, latin

* **情绪标签**（29 个）：happy, motivational, energetic, chill, healing, warm, relaxed, sad, lonely, melancholy, romantic, lazy, calm, focused, free, dreamy, nostalgic, anxious, hopeful, mysterious, playful, passionate, peaceful, sensual, whimsical, groovy, ethereal, dark, bright



***

## 7. API 接口



| 接口               | 方法   | 输入                                                           | 输出                                                               |
| ---------------- | ---- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `/api/parse`     | POST | `{ text: string }`                                           | `{ success, preferences, confidence, reason? }`                  |
| `/api/recommend` | POST | `{ preferences, history?, excludeIds?, regenerationCount? }` | `{ success, songs, context }`                                    |
| `/api/feedback`  | POST | `{ preferences, skippedSongs, regenerationCount, history? }` | `{ success, adjustedPreferences, songs, shouldRegenerate, ... }` |
| `/api/events`    | POST | `{ events: AnalyticsEvent[] }`                               | `{ success, recorded }`                                          |



***

## 8. LLM 调用细节



* **模型**：doubao-seed-2-1-lite-260915

* **接口**：OpenAI 兼容 Chat Completions

* **关键参数**：


  * `response_format: { type: "json_object" }`（强制 JSON 输出）

  * `thinking: { type: "disabled" }`（火山方舟特有，关闭推理模式否则超时）

  * `temperature: 0.3`（意图解析需要稳定输出）

* **超时**：8 秒

* **错误处理**：超时 / 格式错误 / 低置信度分别降级，引导用户手动选场景

* **没有用 function call**：单任务意图解析，JSON mode + Zod 校验足够



***

## 9. 推荐引擎逻辑

推荐是纯本地规则打分（不是 ML 模型），五个维度：



1. **BPM 匹配**：在用户要求区间内的歌加分，偏离区间扣分

2. **风格匹配**：包含用户偏好风格标签的歌加分，包含排除风格的歌降权

3. **情绪匹配**：mood 标签匹配度

4. **人声匹配**：vocal\_level 精确匹配

5. **历史惩罚**：最近听过的歌降权（0 分）

**主动让步机制**：如果曲库中没有满足所有条件的歌，引擎会逐步放宽 BPM 区间或降低人声要求，并在 UI 中向用户说明 "我做了点让步"。

**换一批**：同一份偏好，硬排除当前歌单的 10 首歌，重新推荐。



***

## 10. localStorage 状态



| Key                    | 内容                       | 生命周期 |
| ---------------------- | ------------------------ | ---- |
| `cike_music_history`   | 最近播放的 song id 列表（最多 200） | 持久   |
| `cike_music_playlists` | 已保存的歌单列表                 | 持久   |
| `cike_music_liked`     | 收藏的歌曲列表（最新在前）            | 持久   |

注意：无损角标解锁状态是**内存级**的（不写 localStorage），方便 demo 重复演示。



***

## 11. 视觉设计系统



* **风格**：手绘手账 / 拼贴 / 音乐日记

* **背景**：温暖米色纸张 (#f5f0e8 系)

* **主色**：brick 砖红 #a1594a（主按钮）、olive 橄榄绿 #5f6a4c（成功 / 角标）、ink 深棕 #3d2f25（标题）、brown #6b5544（正文）

* **字体**：手写体用于标题，常规体用于正文

* **封面**：18 个手绘 SVG 涂鸦贴纸（耳机、磁带、唱片、音符、咖啡杯、花、星星、月亮、猫等），随机分配，不用首字母

* **进度条**：手绘曲线路径 + 6 个小角色（猫 / 兔 / 鸟 / 纸飞机 / 音符小人）沿路径跟随播放进度

* **无胶带**：washi tape 组件保留但不再使用（用户反馈挡文字）



***

## 12. 移动端适配



* 隐藏行号（省 28px）

* 封面 48px → 40px

* 收藏 / 不喜欢收进 ⋯ 菜单

* 标签行通栏显示

* 触摸热区 ≥40px



***

## 13. 已实现的关键交互



1. **自然语言 → 歌单**：LLM 解析 + 推荐引擎

2. **负反馈闭环**：跳过 3 首触发重生成，展示真实调整内容

3. **收藏持久化**：心形标记 → localStorage → 自动生成 "我喜欢" 歌单

4. **保存歌单**：命名后存入 localStorage，可回放

5. **换一批**：排除当前批次重新推荐

6. **无损角标渐进披露**：默认隐藏，打开会员弹窗后逐个淡入

7. **手绘进度条**：小角色沿路径移动，暂停时浮动待机

8. **动态标题**：根据场景显示 "给微醺的你"/"给自习的你" 等



***

## 14. 已知限制



* 无服务端数据库，所有数据在用户浏览器

* 推荐引擎是规则打分，不是协同过滤或 embedding

* LLM 只做意图解析，不做对话式多轮交互

* 无 function call /tool use

* 无真实音频播放（播放器是 UI mock）

* 曲库 253 首，没有流式更新