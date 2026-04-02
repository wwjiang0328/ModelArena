/**
 * ModelHighlights - 模型侧重点/特色卡片
 * Design: 竞技场选手档案卡片
 */
import { motion } from "framer-motion";
import { models, referenceModels } from "@/lib/data";
import { Unlock, Lock, Zap, Brain, Code, Bot, Shield, Target } from "lucide-react";

const TROPHY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663486795345/oARNikNz6QTshgAdzsb4cE/trophy-glow-ADbKUwfRGXPwzX7RWB8uNe.webp";

const strengthIcons: Record<string, any> = {
  "编程之王": Code,
  "数学天花板": Brain,
  "智能体": Bot,
  "全能王": Zap,
  "幻觉控制": Shield,
  "效率之星": Zap,
  "编程新秀": Code,
  "均衡全能": Target,
  "中文理解": Brain,
  "开源先驱": Unlock,
  "科学推理": Brain,
  "性价比": Zap,
};

function ModelCard({ model, index }: { model: typeof models[0]; index: number }) {
  const mainStrength = model.strengths[0];
  const Icon = strengthIcons[mainStrength] || Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative rounded-xl border border-border bg-card/40 backdrop-blur-sm p-5 hover:border-white/20 transition-all duration-300 hover:bg-card/60"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start gap-4">
        <div className="text-3xl">{model.logo}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-base truncate">{model.shortName}</h3>
            {model.isOpenSource ? (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                开源
              </span>
            ) : (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
                闭源
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{model.company} · {model.contextLength}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted-foreground">BenchLM</div>
          <div className="text-xl font-extrabold font-mono text-foreground">{model.benchlm.overall}</div>
        </div>
      </div>

      {/* Main strength badge */}
      <div className="mt-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: model.color + "20", color: model.color, borderColor: model.color + "30", borderWidth: 1 }}>
          <Icon className="w-3.5 h-3.5" />
          {mainStrength}
        </div>
        {model.strengths.slice(1).map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">
            {s}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {model.strengthDetail}
      </p>

      {/* Score bars */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "数学", value: model.superclue.math, color: "#3b82f6" },
          { label: "编程", value: model.superclue.coding, color: "#10b981" },
          { label: "智能体", value: model.superclue.agent, color: "#f59e0b" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-[10px] text-muted-foreground mb-1">{item.label}</div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
            <div className="text-[10px] font-mono font-medium text-foreground/60 mt-0.5">{item.value.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ModelHighlights() {
  return (
    <section className="container py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-violet-400 to-pink-400" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">模型侧重点一览</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-8 ml-4">
          每个模型都有独特的能力侧重，选择最适合你需求的模型
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.sort((a, b) => b.benchlm.overall - a.benchlm.overall).map((model, idx) => (
            <ModelCard key={model.id} model={model} index={idx} />
          ))}
        </div>

        {/* Reference: International models */}
        <div className="mt-10 rounded-xl border border-border/50 bg-muted/20 p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            🌍 海外模型参考（不参与排名）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {referenceModels.map((ref) => (
              <div key={ref.name} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] border border-border/30">
                <div>
                  <div className="text-sm font-medium text-foreground/70">{ref.name}</div>
                  <div className="text-xs text-muted-foreground">{ref.company}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-foreground/50">{ref.benchlmOverall}</div>
                  <div className="text-[10px] text-muted-foreground">BenchLM</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
