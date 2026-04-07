/**
 * HeroSection - 英雄区 TOP3 领奖台
 * Design: 竞技场体育赛事美学，深色背景+金色冠军
 */
import { motion } from "framer-motion";
import { Crown, Trophy, Medal, Sparkles } from "lucide-react";
import { models, dataUpdatedAt, pageGeneratedAt } from "@/lib/data";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663486795345/oARNikNz6QTshgAdzsb4cE/hero-bg-mWkcuQSYnUSUyjcWDgpkb8.webp";

// Sort by BenchLM overall score for podium
const top3 = [...models].sort((a, b) => b.benchlm.overall - a.benchlm.overall).slice(0, 3);

const podiumOrder = [top3[1], top3[0], top3[2]]; // silver, gold, bronze layout

const rankConfig = [
  { height: "h-32 sm:h-40", bg: "from-gray-400/20 to-gray-500/10", border: "border-gray-400/40", badge: "bg-gray-400/20 text-gray-300", icon: Medal, label: "亚军", rank: 2 },
  { height: "h-44 sm:h-52", bg: "from-amber-500/20 to-yellow-600/10", border: "border-amber-400/50", badge: "bg-amber-500/20 text-amber-300", icon: Crown, label: "冠军", rank: 1 },
  { height: "h-28 sm:h-36", bg: "from-orange-700/20 to-orange-800/10", border: "border-orange-600/40", badge: "bg-orange-700/20 text-orange-400", icon: Trophy, label: "季军", rank: 3 },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      <div className="container relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300 tracking-wide">
              数据截止 {dataUpdatedAt
                ? dataUpdatedAt.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${y}年${m}月${d}日`)
                : "最新"} · 权威评测
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-gradient-gold">国产大模型</span>
            <span className="text-foreground"> 天梯榜</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            基于 SuperCLUE · BenchLM.ai 权威评测，全面对比国产大模型在数学、编程、推理、智能体等核心维度的能力表现
          </p>
        </motion.div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 sm:gap-5 max-w-3xl mx-auto">
          {podiumOrder.map((model, idx) => {
            const config = rankConfig[idx];
            const Icon = config.icon;
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx === 1 ? 0.1 : idx === 0 ? 0.3 : 0.5 }}
                className="flex-1 max-w-[200px]"
              >
                {/* Model card */}
                <div className={`relative rounded-xl border ${config.border} bg-gradient-to-b ${config.bg} backdrop-blur-sm p-3 sm:p-4 text-center mb-2`}>
                  {config.rank === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Crown className="w-3.5 h-3.5 text-amber-950" />
                      </div>
                    </div>
                  )}
                  <div className="text-2xl sm:text-3xl mb-1">{model.logo}</div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{model.shortName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{model.company}</p>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="text-xl sm:text-2xl font-extrabold font-mono" style={{ color: config.rank === 1 ? '#f59e0b' : config.rank === 2 ? '#9ca3af' : '#d97706' }}>
                      {model.benchlm.overall}
                    </span>
                    <span className="text-xs text-muted-foreground">分</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                    {model.strengths.slice(0, 2).map((s) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Podium bar */}
                <div className={`${config.height} rounded-t-lg bg-gradient-to-t ${config.bg} border-x border-t ${config.border} flex items-center justify-center`}>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${config.badge}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{config.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
