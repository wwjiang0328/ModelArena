/**
 * Footer - 数据来源说明和页脚
 */
import { ExternalLink } from "lucide-react";
import { dataUpdatedAt } from "@/lib/data";

export default function Footer() {
  // 将 "YYYY-MM-DD" 格式化为 "YYYY年MM月DD日"
  const formattedDate = dataUpdatedAt
    ? dataUpdatedAt.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日")
    : "—";

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">数据来源</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <a
                  href="https://www.superclueai.com/generalpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  SuperCLUE 中文大模型测评基准 — 通用榜
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <a
                  href="https://benchlm.ai/best/overall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  BenchLM.ai — 全球大模型基准评测排行榜
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">说明</h3>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li>排名基于公开评测数据，仅供参考。模型能力持续迭代，数据可能存在时效性差异。</li>
              <li>SuperCLUE 总分为六大维度加权平均；BenchLM 综合分为8个基准类别的归一化加权平均。</li>
              <li>海外模型（Claude、GPT、Gemini等）仅作参考对比，不参与国产模型排名。</li>
              <li>「开源」指模型权重公开可下载，可用于自部署和微调。</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>
            国产大模型天梯榜 · 数据统计截止 {formattedDate} · 仅供学习研究参考
          </p>
        </div>
      </div>
    </footer>
  );
}
