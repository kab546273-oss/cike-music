// ============================================================
// components/scrapbook/DoodleIcons.tsx
// 手绘场景 / 心情图标（26 个）— 与 Doodles.tsx / Characters.tsx
// 同一套笔触：24×24 网格、暖褐墨线 #5A4A3A、局部薄涂 30–45%。
//
// 为什么不用 emoji：系统 emoji 彩色、光滑、跨平台不一致，
// 贴在米色纸面上像塑料贴纸，和站内的手绘涂鸦不是同一支笔。
// 这套是 SVG：可换色（hover / 选中态直接改 stroke）、体积 KB 级、
// 任意分辨率不糊，也不增加图片请求。
//
// 用法：
//   <SceneIcon id="study" size={30} />
//   <MoodIcon id="chill" size={18} />
//
// 图标语义与 lib/constants.ts 里 SCENE_PRESETS.icon 的 lucide 名称
// 一一对应（study=BookOpen 语义换成了"台灯 + 待读"，其余同名）。
// ============================================================

import type { ReactElement, ReactNode } from "react";

export interface DoodleIconProps {
  /** 像素边长（正方形） */
  size?: number;
  className?: string;
  /** 线宽（24 网格内的单位），默认 1.4 */
  strokeWidth?: number;
  /** 墨线颜色，默认 #5A4A3A；深色底（如选中的心情 chip）传 DOODLE_INK_LIGHT */
  strokeColor?: string;
}

type IconComponent = (props: DoodleIconProps) => ReactElement;

// 与 Doodles.tsx 完全相同的调色板
const INK = "#5A4A3A";
const OLIVE = "#84906B";
const BRICK = "#B86F5E";
const OCHRE = "#D4B96A";
const SAND = "#E8DCC8";
const BLUE = "#7A8FA6";
const PINK = "#C9907E";

/** 描边墨色（与 Doodles.tsx / Characters.tsx 一致）。 */
export const DOODLE_INK = INK;
/** 深色底上的墨色（= --color-paper-light）。 */
export const DOODLE_INK_LIGHT = "#F7F0E4";

/** 统一的 svg 外壳：所有图标共用同一套描边属性。 */
function Doodle({
  size = 24,
  className,
  strokeWidth = 1.4,
  strokeColor,
  children,
}: DoodleIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor ?? INK}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

// ---------- 场景图标（14） ----------

/** 自习：台灯 + 待读的横线 */
export function IconStudy(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M6.6,5.2 H15.8 L17.8,10.2 H4.4 Z" fill={OCHRE} fillOpacity="0.45" />
      <path d="M11.2,10.2 V15.6" />
      <path d="M7.6,17.2 C9.8,16.6 12.8,16.6 15,17.2" />
      <path d="M9.4,13.6 H13" strokeWidth={1.1} strokeDasharray="1.8 1.8" />
    </Doodle>
  );
}

/** 办公：笔记本电脑 */
export function IconWork(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M5.4,6.6 C5.4,5.9 5.9,5.4 6.6,5.4 H17.4 C18.1,5.4 18.6,5.9 18.6,6.6 V15.4 H5.4 Z"
        fill={SAND}
        fillOpacity="0.5"
      />
      <path d="M7.6,8.2 H16.4 V13.4 H7.6 Z" />
      <path d="M5.4,15.4 V17.4 M18.6,15.4 V17.4" />
      <path d="M2.8,17.8 C7.6,16.9 16.4,17 21.2,17.7" />
      <path d="M10.2,17.3 H13.8" />
    </Doodle>
  );
}

/** 备考：学士帽压着一摞书 */
export function IconExam(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M2.4,8.6 L12,4.4 L21.6,8.6 L12,12.8 Z" fill="#302B27" fillOpacity="0.14" />
      <path
        d="M6.4,10.4 V14.2 C6.4,15.6 9,16.6 12,16.6 C15,16.6 17.6,15.6 17.6,14.2 V10.4"
        fill={SAND}
        fillOpacity="0.45"
      />
      <path d="M19.4,9.4 V14.4" />
      <path d="M19.4,14.4 L18.6,16.6 L20.2,16.6 Z" fill={BRICK} fillOpacity="0.45" />
      <path d="M5.2,19.6 H18.8" />
    </Doodle>
  );
}

/** 阅读：摊开的书 + 书签 */
export function IconReading(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M4.2,6.6 C6.6,5.4 9.4,5.4 11.6,6.8 L11.6,18.4 C9.4,17 6.6,17 4.2,18.2 Z"
        fill={SAND}
        fillOpacity="0.5"
      />
      <path
        d="M19.8,6.6 C17.4,5.4 14.6,5.4 12.4,6.8 L12.4,18.4 C14.6,17 17.4,17 19.8,18.2 Z"
        fill={SAND}
        fillOpacity="0.5"
      />
      <path d="M12,6.7 V18.4" />
      <path d="M15.4,5.8 V11.4 L16.8,10.2 L18.2,11.4 V5.6 Z" fill={BRICK} fillOpacity="0.5" />
    </Doodle>
  );
}

/** 通勤：车厢 + 轨道 */
export function IconCommute(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M6.4,4.6 H17.6 C18.6,4.6 19.2,5.2 19.2,6.2 V14.4 C19.2,15.4 18.6,16 17.6,16 H6.4 C5.4,16 4.8,15.4 4.8,14.4 V6.2 C4.8,5.2 5.4,4.6 6.4,4.6 Z"
        fill={BLUE}
        fillOpacity="0.35"
      />
      <path d="M7.6,7.4 H16.4 V11.4 H7.6 Z" fill={SAND} fillOpacity="0.6" />
      <path d="M8.6,18.4 V20.4 M15.4,18.4 V20.4" />
      <path d="M3.4,21.6 C8.6,20.9 15.4,20.9 20.6,21.6" />
    </Doodle>
  );
}

/** 散步：走路的小人（与 Characters.tsx 同源） */
export function IconWalk(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <circle cx="12" cy="5.6" r="2.3" fill={SAND} fillOpacity="0.6" />
      <path d="M12,8.4 V14" />
      <path d="M12,14 L9.4,19.6 M12,14 L14.8,18.4" />
      <path d="M12,10.4 L8.4,12.2 M12,10.4 L15.8,11.6" />
    </Doodle>
  );
}

/** 跑步：侧视跑鞋（去掉鞋带，只留鞋身 + 厚鞋底，保证 24px 可辨） */
export function IconRunning(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M4.6,16 C4.6,15 5.4,14.2 6.4,14.1 L11,13.4 C12.4,13.2 13.2,12.4 13.8,11.4 C14.4,10.4 15.8,10 17,10.6 C18.6,11.4 19.8,12.8 20.4,14.4 L20.4,16 Z"
        fill={BRICK}
        fillOpacity="0.4"
      />
      <path
        d="M3.6,17.8 C3.6,16.9 4.3,16.2 5.2,16.2 H20.4 C21,16.2 21.4,16.6 21.4,17.2 C21.4,17.8 21,18.2 20.4,18.2 H5.4 C4.4,18.2 3.6,18.2 3.6,17.8 Z"
        fill={SAND}
        fillOpacity="0.75"
      />
    </Doodle>
  );
}

/** 健身：哑铃 */
export function IconFitness(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M4.4,9.4 H6.4 V15.2 H4.4 Z" fill={OLIVE} fillOpacity="0.5" />
      <path d="M17.6,9.4 H19.6 V15.2 H17.6 Z" fill={OLIVE} fillOpacity="0.5" />
      <path d="M7.4,7.4 H9.4 V17.2 H7.4 Z" fill={OLIVE} fillOpacity="0.4" />
      <path d="M14.6,7.4 H16.6 V17.2 H14.6 Z" fill={OLIVE} fillOpacity="0.4" />
      <path d="M9.4,12.3 H14.6" />
    </Doodle>
  );
}

/** 骑行：自行车 */
export function IconCycling(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <circle cx="6.4" cy="16.4" r="3.6" />
      <circle cx="17.6" cy="16.4" r="3.6" />
      <path d="M6.4,16.4 L10.8,10.4 H15.4 L17.6,16.4" />
      <path d="M10.8,10.4 L12.8,16.4" />
      <path d="M9.2,10.4 H12.2 M14.8,10.4 H16.6" />
    </Doodle>
  );
}

/** 午后：太阳 + 一朵小云 */
export function IconAfternoon(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <circle cx="9.4" cy="9.4" r="4" fill={OCHRE} fillOpacity="0.5" />
      <path d="M9.4,3.2 V4.4 M9.4,14.4 V15.6 M3.2,9.4 H4.4 M14.4,9.4 H15.6 M5,5 L5.9,5.9 M12.9,12.9 L13.8,13.8 M13.8,5 L12.9,5.9 M5.9,12.9 L5,13.8" />
      <path
        d="M13.6,20 C13.6,18.6 14.6,17.8 15.8,17.8 C16.4,16.6 18.2,16.4 19.2,17.4 C20.4,17.4 21.2,18.2 21.2,19.2 C21.2,20 20.6,20.4 19.6,20.4 Z"
        fill={SAND}
        fillOpacity="0.6"
      />
    </Doodle>
  );
}

/** 微醺：高脚杯 + 两颗气泡 */
export function IconTipsy(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M8.4,4.6 H15.6 C15.6,8.6 14.2,11.2 12,11.2 C9.8,11.2 8.4,8.6 8.4,4.6 Z"
        fill={BRICK}
        fillOpacity="0.45"
      />
      <path d="M12,11.2 V16.6" />
      <path d="M9,17.8 C10.6,17.1 13.4,17.1 15,17.8" />
      <circle cx="17.2" cy="6.2" r="1.1" fill={OCHRE} fillOpacity="0.55" stroke="none" />
      <circle cx="18.6" cy="9.6" r="0.8" fill={OCHRE} fillOpacity="0.5" stroke="none" />
    </Doodle>
  );
}

/** 撸猫：猫头 + 胡须 */
export function IconCat(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M7.4,7.6 L7,3.2 L10.6,5.6 M16.6,7.6 L17,3.2 L13.4,5.6" fill={OCHRE} fillOpacity="0.35" />
      <path
        d="M6,10.6 C6,7.6 8.4,5.8 12,5.8 C15.6,5.8 18,7.6 18,10.6 C18,14.4 15.6,17.4 12,17.4 C8.4,17.4 6,14.4 6,10.6 Z"
        fill={OCHRE}
        fillOpacity="0.38"
      />
      <circle cx="9.8" cy="10.6" r="0.75" fill={INK} stroke="none" />
      <circle cx="14.2" cy="10.6" r="0.75" fill={INK} stroke="none" />
      <path d="M11.2,13.2 L12.8,13.2" />
      <path d="M3.8,11.4 H6.8 M4,13.4 H6.8 M17.2,11.4 H20.2 M17.2,13.4 H20" />
    </Doodle>
  );
}

/** 旅行：纸飞机 + 虚线轨迹 */
export function IconTravel(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M3,11.6 L21.4,3.2 L15.4,20.6 L11.2,13.6 Z" fill={SAND} fillOpacity="0.6" />
      <path d="M11.2,13.6 L21.4,3.2" />
      <path d="M11.2,13.6 L10.4,18.2" />
      <path d="M2.6,15.6 C3.6,16.2 4,16.6 4.6,17.8" strokeDasharray="1.7 1.7" />
      <path d="M2.2,19 C3.2,19.6 3.6,20 4.2,21.2" strokeDasharray="1.7 1.7" />
    </Doodle>
  );
}

/** 逛街：购物纸袋 */
export function IconShopping(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M6.4,8.6 H17.6 L18.8,20 C18.9,20.6 18.5,21 17.9,21 H6.1 C5.5,21 5.1,20.6 5.2,20 Z"
        fill={OCHRE}
        fillOpacity="0.45"
      />
      <path d="M9.2,9 V6.6 C9.2,4.9 10.4,3.6 12,3.6 C13.6,3.6 14.8,4.9 14.8,6.6 V9" />
    </Doodle>
  );
}

// ---------- 心情图标（12） ----------

/** 开心：眯眼笑的小圆脸 */
export function IconHappy(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <circle cx="12" cy="12" r="8" fill={OCHRE} fillOpacity="0.35" />
      <path d="M8.4,10.4 C9,9.8 9.8,9.8 10.4,10.4" />
      <path d="M13.6,10.4 C14.2,9.8 15,9.8 15.6,10.4" />
      <path d="M8.8,13.8 C10.2,15.6 13.8,15.6 15.2,13.8" />
    </Doodle>
  );
}

/** 励志：小旗子 */
export function IconMotivational(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M6.6,20.6 V4.2" />
      <path
        d="M7.2,4.8 C9.6,3.4 12,3.4 14.4,4.8 C16.6,6 18.2,6 19.2,5.2 V12.6 C18.2,13.4 16.6,13.4 14.4,12.2 C12,10.8 9.6,10.8 7.2,12.2 Z"
        fill={BRICK}
        fillOpacity="0.42"
      />
      <path d="M4.4,20.6 H9" />
    </Doodle>
  );
}

/** 活力：闪电 */
export function IconEnergetic(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M13.8,3.2 L7.2,13.2 H11.6 L10.2,20.8 L17,10.6 H12.4 Z" fill={OCHRE} fillOpacity="0.5" />
    </Doodle>
  );
}

/** 放松：一片叶子 */
export function IconChill(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M19.4,4.6 C13,4.2 7.4,8.2 6.4,13.4 C5.8,16.8 7.6,19.4 10.6,19.6 C16,20 20,13.8 19.4,4.6 Z"
        fill={OLIVE}
        fillOpacity="0.4"
      />
      <path d="M19.4,4.6 C15.6,8.4 12.6,13.2 10.6,19.6" />
    </Doodle>
  );
}

/** 治愈：创可贴（中间小十字，避免被读成胶囊） */
export function IconHealing(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M5.6,13.4 L13.4,5.6 C14.6,4.4 16.6,4.4 17.8,5.6 C19,6.8 19,8.8 17.8,10 L10,17.8 C8.8,19 6.8,19 5.6,17.8 C4.4,16.6 4.4,14.6 5.6,13.4 Z"
        fill={PINK}
        fillOpacity="0.45"
      />
      <path d="M12.4,9.8 V14.2 M10.2,12 H14.6" />
    </Doodle>
  );
}

/** 温馨：屋顶冒烟的小屋 */
export function IconWarm(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M4.2,11.6 L12,4.6 L19.8,11.6" />
      <path d="M6.4,10.4 V19.6 H17.6 V10.4" fill={SAND} fillOpacity="0.6" />
      <path d="M10.2,19.6 V14.6 H13.8 V19.6" fill={OCHRE} fillOpacity="0.4" />
      <path d="M15.8,6 V8.2" />
    </Doodle>
  );
}

/** 惬意：冒热气的杯子 */
export function IconRelaxed(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M6.4,10.8 H16.4 V16.4 C16.4,18 15.2,19.2 13.6,19.2 H9.2 C7.6,19.2 6.4,18 6.4,16.4 Z"
        fill={SAND}
        fillOpacity="0.65"
      />
      <path d="M16.4,12.6 H18 C19.2,12.6 20,13.4 20,14.6 C20,15.8 19.2,16.6 18,16.6 H16.4" />
      <path d="M9.4,8.6 C9,7.6 9.6,7 10,6 C10.4,5 10,4.4 9.6,3.6" />
      <path d="M13.2,8.6 C12.8,7.6 13.4,7 13.8,6 C14.2,5 13.8,4.4 13.4,3.6" />
    </Doodle>
  );
}

/** 伤感：一滴眼泪 */
export function IconSad(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M12,4.2 C12,4.2 18,11.4 18,14.8 C18,18 15.4,20.4 12,20.4 C8.6,20.4 6,18 6,14.8 C6,11.4 12,4.2 12,4.2 Z"
        fill={BLUE}
        fillOpacity="0.38"
      />
    </Doodle>
  );
}

/** 孤独：弯月 + 一颗小星 */
export function IconLonely(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M14.6,3.8 C10.4,4.6 7.6,8 7.6,12 C7.6,16 10.4,19.4 14.6,20.2 C9.8,21 5.2,17.4 5.2,12 C5.2,6.6 9.8,3 14.6,3.8 Z"
        fill={SAND}
        fillOpacity="0.65"
      />
      <path
        d="M17.4,6.4 L18,8.2 L19.8,8.8 L18,9.4 L17.4,11.2 L16.8,9.4 L15,8.8 L16.8,8.2 Z"
        fill={OCHRE}
        fillOpacity="0.55"
      />
    </Doodle>
  );
}

/** 忧郁：云 + 斜雨 */
export function IconMelancholy(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M7.4,16 C5.6,16 4.4,14.8 4.6,13.2 C4.8,11.8 6,11 7.4,11.2 C7.8,9 9.8,7.6 12,8 C14.2,8.4 15.6,10.4 15.2,12.6 C16.8,12.6 18,13.6 18,14.8"
        fill={SAND}
        fillOpacity="0.65"
      />
      <path d="M15.2,12.6 H17.2 C18.6,12.6 19.6,13.6 19.6,14.8 C19.6,15.4 19.4,16 18.8,16" />
      <path d="M8.8,18 L7.8,20.6 M13,18 L12,20.6 M17.2,18 L16.2,20.6" />
    </Doodle>
  );
}

/** 浪漫：一颗心 */
export function IconRomantic(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path
        d="M12,19.6 C8.4,16.6 5.8,14.2 5.8,11.4 C5.8,9.4 7.4,8 9.2,8 C10.6,8 11.6,8.8 12,10 C12.4,8.8 13.4,8 14.8,8 C16.6,8 18.2,9.4 18.2,11.4 C18.2,14.2 15.6,16.6 12,19.6 Z"
        fill={BRICK}
        fillOpacity="0.42"
      />
    </Doodle>
  );
}

/** 慵懒：闭眼打哈欠的猫 */
export function IconLazy(props: DoodleIconProps) {
  return (
    <Doodle {...props}>
      <path d="M6.8,9 L6.4,5.2 L9.2,7.4 M15.2,7.4 L17.8,5.2 L17.4,9" fill={OCHRE} fillOpacity="0.35" />
      <circle cx="12" cy="13" r="7.2" fill={OCHRE} fillOpacity="0.35" />
      <path d="M9,13.2 C9.6,14 10.4,14 11,13.2" />
      <path d="M13.4,13.2 C14,14 14.8,14 15.4,13.2" />
      <path d="M11.4,16.2 C12.2,16.9 13,16.9 13.8,16.2" />
    </Doodle>
  );
}

// ---------- 映射与包装组件 ----------

/** 场景 id（SCENE_PRESETS.id）→ 图标 */
export const SCENE_ICONS: Record<string, IconComponent> = {
  study: IconStudy,
  work: IconWork,
  exam: IconExam,
  reading: IconReading,
  commute: IconCommute,
  walk: IconWalk,
  running: IconRunning,
  fitness: IconFitness,
  cycling: IconCycling,
  afternoon: IconAfternoon,
  tipsy: IconTipsy,
  cat: IconCat,
  travel: IconTravel,
  shopping: IconShopping,
};

/** 心情 id（MOOD_PRESETS.id）→ 图标 */
export const MOOD_ICONS: Record<string, IconComponent> = {
  happy: IconHappy,
  motivational: IconMotivational,
  energetic: IconEnergetic,
  chill: IconChill,
  healing: IconHealing,
  warm: IconWarm,
  relaxed: IconRelaxed,
  sad: IconSad,
  lonely: IconLonely,
  melancholy: IconMelancholy,
  romantic: IconRomantic,
  lazy: IconLazy,
};

/**
 * 场景图标。未知 id（例如旧版保存的歌单）回退到"随心"的散步图标，
 * 不会渲染成空白。
 */
export function SceneIcon({ id, ...rest }: { id: string } & DoodleIconProps) {
  const Icon = SCENE_ICONS[id] ?? IconWalk;
  return <Icon {...rest} />;
}

/** 心情图标。未知 id 回退到"放松"的叶子图标。 */
export function MoodIcon({ id, ...rest }: { id: string } & DoodleIconProps) {
  const Icon = MOOD_ICONS[id] ?? IconChill;
  return <Icon {...rest} />;
}
