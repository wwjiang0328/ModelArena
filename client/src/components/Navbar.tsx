/**
 * Navbar - 顶部导航栏
 * Design: 竞技场风格，半透明毛玻璃
 */
import { Trophy, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-4 h-4 text-amber-950" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground tracking-tight">AI Arena</span>
            <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">国产大模型天梯榜</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#leaderboard" className="hover:text-foreground transition-colors hidden sm:block">排行榜</a>
          <a href="#dimensions" className="hover:text-foreground transition-colors hidden sm:block">维度对比</a>
          <a href="#models" className="hover:text-foreground transition-colors hidden sm:block">模型档案</a>
          <a href="#guide" className="hover:text-foreground transition-colors hidden sm:block">选型指南</a>
          <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            2026.03
          </span>
        </div>
      </div>
    </nav>
  );
}
