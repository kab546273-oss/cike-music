import type { Metadata } from "next";
import { Caveat, Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "此刻音乐 — 一本可以听的 AI 音乐手账",
  description:
    "基于 LLM 意图理解 + 可解释推荐算法 + 用户负反馈闭环的 AI 音乐场景助手。告诉我这一刻，AI 帮你找到刚刚好的歌。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${caveat.variable} ${inter.variable} ${notoSansSC.variable} h-full`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
