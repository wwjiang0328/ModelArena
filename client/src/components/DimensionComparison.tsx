/**
 * DimensionComparison - 分维度深度对比
 * Design: 卡片式展示，每个维度一张卡片，内含横向条形图
 */
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { benchlmCoding, benchlmMath, benchlmAgent, models, dimensions } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DIMENSION_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663486795345/oARNikNz6QTshgAdzsb4cE/dimension-icons-TTGdJyChREwQXvxPrJhRQX.webp";

function AnimatedBar({ value, max, color, label, rank }: { value: number; max: number; color: string; label: string; rank: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth((value / max) * 100), rank * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, max, rank]);

  return (
    <div ref={ref} className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-medium text-muted-foreground w-28 sm:w-32 truncate text-right">{label}</span>
      <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden relative">
        <div
          className="h-full rounded-md transition-all duration-1000 ease-out relative"
          style={{ width: `${width}%`, backgroundColor: color }}
        >
          {width > 20 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold font-mono text-white/90">
              {value}
            </span>
          )}
        </div>
        {width <= 20 && width > 0 && (
          <span className="absolute left-[calc(var(--w)+8px)] top-1/2 -translate-y-1/2 text-[11px] font-bold font-mono text-foreground/60" style={{ "--w": `${width}%` } as any}>
            {value}
          </span>
        )}
      </div>
      {rank <= 3 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          rank === 1 ? "bg-amber-500/20 text-amber-400" : rank === 2 ? "bg-gray-400/20 text-gray-300" : "bg-orange-600/20 text-orange-400"
        }`}>
          #{rank}
        </span>
      )}
    </div>
  );
}

function CodingTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          SWE-bench Verified
        </h4>
        <p className="text-xs text-muted-foreground mb-4">真实GitHub Issue修复能力</p>
        {benchlmCoding.sort((a, b) => b.swebench - a.swebench).map((d, i) => (
          <AnimatedBar key={d.model} value={d.swebench} max={100} color="#10b981" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          LiveCodeBench
        </h4>
        <p className="text-xs text-muted-foreground mb-4">实时编程竞赛题目</p>
        {benchlmCoding.sort((a, b) => b.livecodebench - a.livecodebench).map((d, i) => (
          <AnimatedBar key={d.model} value={d.livecodebench} max={100} color="#3b82f6" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          SWE-bench Pro
        </h4>
        <p className="text-xs text-muted-foreground mb-4">高难度专业级代码修复</p>
        {benchlmCoding.sort((a, b) => b.swebenchPro - a.swebenchPro).map((d, i) => (
          <AnimatedBar key={d.model} value={d.swebenchPro} max={100} color="#8b5cf6" label={d.model} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function MathTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          AIME 2025
        </h4>
        <p className="text-xs text-muted-foreground mb-4">美国数学邀请赛题目</p>
        {benchlmMath.sort((a, b) => b.aime - a.aime).map((d, i) => (
          <AnimatedBar key={d.model} value={d.aime} max={100} color="#3b82f6" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          HMMT 2025
        </h4>
        <p className="text-xs text-muted-foreground mb-4">哈佛-MIT数学锦标赛</p>
        {benchlmMath.sort((a, b) => b.hmmt - a.hmmt).map((d, i) => (
          <AnimatedBar key={d.model} value={d.hmmt} max={100} color="#f59e0b" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          MATH 500
        </h4>
        <p className="text-xs text-muted-foreground mb-4">标准数学推理基准</p>
        {benchlmMath.sort((a, b) => b.math500 - a.math500).map((d, i) => (
          <AnimatedBar key={d.model} value={d.math500} max={100} color="#10b981" label={d.model} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function AgentTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Terminal-Bench 2.0
        </h4>
        <p className="text-xs text-muted-foreground mb-4">终端命令行操作能力</p>
        {benchlmAgent.sort((a, b) => b.terminalBench - a.terminalBench).map((d, i) => (
          <AnimatedBar key={d.model} value={d.terminalBench} max={100} color="#f59e0b" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          BrowseComp
        </h4>
        <p className="text-xs text-muted-foreground mb-4">网页浏览与信息检索</p>
        {benchlmAgent.sort((a, b) => b.browseComp - a.browseComp).map((d, i) => (
          <AnimatedBar key={d.model} value={d.browseComp} max={100} color="#06b6d4" label={d.model} rank={i + 1} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          OSWorld
        </h4>
        <p className="text-xs text-muted-foreground mb-4">操作系统级任务完成</p>
        {benchlmAgent.sort((a, b) => b.osworld - a.osworld).map((d, i) => (
          <AnimatedBar key={d.model} value={d.osworld} max={100} color="#8b5cf6" label={d.model} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function SuperCLUEOverview() {
  const sortedByDim = (key: keyof typeof models[0]["superclue"]) =>
    [...models].sort((a, b) => b.superclue[key] - a.superclue[key]).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dimensions.map((dim) => {
        const top5 = sortedByDim(dim.key);
        return (
          <div key={dim.key} className="rounded-xl border border-border bg-card/30 p-5">
            <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <span>{dim.icon}</span> {dim.label}
            </h4>
            <p className="text-xs text-muted-foreground mb-4">{dim.description}</p>
            {top5.map((m, i) => (
              <AnimatedBar
                key={m.id}
                value={m.superclue[dim.key]}
                max={100}
                color={dim.color}
                label={m.shortName}
                rank={i + 1}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function DimensionComparison() {
  return (
    <section className="container py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">分维度深度对比</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-8 ml-4">
          从编程、数学、智能体等核心维度，深入对比各模型的专项能力
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted/50 border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📊 SuperCLUE 总览
            </TabsTrigger>
            <TabsTrigger value="coding" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              {"{ }"} 编程能力
            </TabsTrigger>
            <TabsTrigger value="math" className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              ∑ 数学推理
            </TabsTrigger>
            <TabsTrigger value="agent" className="text-xs sm:text-sm data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              🤖 智能体
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SuperCLUEOverview />
          </TabsContent>
          <TabsContent value="coding">
            <CodingTab />
          </TabsContent>
          <TabsContent value="math">
            <MathTab />
          </TabsContent>
          <TabsContent value="agent">
            <AgentTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  );
}
