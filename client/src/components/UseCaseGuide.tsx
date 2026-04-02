/**
 * UseCaseGuide - 使用场景推荐
 * Design: 竞技场风格场景卡片
 */
import { motion } from "framer-motion";
import { Code, Calculator, Bot, BookOpen, MessageSquare, Cpu } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "编程助手",
    description: "代码生成、Bug修复、代码审查",
    recommended: "Kimi K2.5",
    reason: "SWE-bench 76.8 全球顶尖，LiveCodeBench 85 编程能力最强",
    alternative: "Step 3.5 Flash（LiveCodeBench 86.4 最高）",
    color: "#10b981",
  },
  {
    icon: Calculator,
    title: "数学推理",
    description: "数学竞赛、科学计算、逻辑推导",
    recommended: "GLM-5",
    reason: "AIME 98 近乎满分，HMMT 95 全球最高水平",
    alternative: "Kimi K2.5（AIME 96.1 紧随其后）",
    color: "#3b82f6",
  },
  {
    icon: Bot,
    title: "AI 智能体",
    description: "自动化任务、工具调用、浏览器操作",
    recommended: "GLM-5",
    reason: "Terminal-Bench 81, OSWorld 74 媲美 GPT-5.4",
    alternative: "通义千问 3.5（Terminal-Bench 77 同样出色）",
    color: "#f59e0b",
  },
  {
    icon: BookOpen,
    title: "长文档处理",
    description: "超长上下文理解、文档分析",
    recommended: "MiMo V2",
    reason: "256K 超长上下文窗口，开源可自部署",
    alternative: "通义千问 2.5-1M（100万 token 上下文）",
    color: "#8b5cf6",
  },
  {
    icon: MessageSquare,
    title: "中文对话",
    description: "日常对话、内容创作、客服",
    recommended: "豆包 Seed 2.0",
    reason: "SuperCLUE 国内第一，中文理解能力最强",
    alternative: "GLM-5（Arena Elo 1456 对话体验最佳）",
    color: "#06b6d4",
  },
  {
    icon: Cpu,
    title: "开源自部署",
    description: "私有化部署、模型微调、二次开发",
    recommended: "GLM-5",
    reason: "BenchLM 78 分开源最强，200K 上下文",
    alternative: "DeepSeek V3.2（全球最活跃开源生态）",
    color: "#ec4899",
  },
];

export default function UseCaseGuide() {
  return (
    <section className="container py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">场景选型指南</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-8 ml-4">
          根据你的使用场景，选择最合适的国产大模型
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-xl border border-border bg-card/40 p-5 hover:border-white/15 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: uc.color + "15" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: uc.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{uc.title}</h3>
                    <p className="text-xs text-muted-foreground">{uc.description}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.03] border border-border/50 p-3 mb-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">推荐首选</div>
                  <div className="text-sm font-bold" style={{ color: uc.color }}>{uc.recommended}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{uc.reason}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground/50 font-medium">备选：</span> {uc.alternative}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
