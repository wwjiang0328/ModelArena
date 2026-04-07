/**
 * Footer - 数据来源说明和页脚
 *
 * 展示两个不同的时间概念：
 *   - 数据统计截止日期（data_cutoff_date）：本次榜单数据所覆盖的最晚评测发布日期，
 *     与模型新品发布节奏对齐，不固定更新周期
 *   - 页面生成时间（page_generated_at）：本次 GitHub Actions 运行并重新构建页面的时间
 */
import { ExternalLink, CalendarDays, RefreshCw } from "lucide-react";
import { dataUpdatedAt, pageGeneratedAt } from "@/lib/data";

/** 将 "YYYY-MM-DD" 格式化为 "YYYY年MM月DD日" */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return dateStr.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日");
}

/** 将 ISO 8601 时间格式化为 "YYYY年MM月DD日 HH:mm（北京时间）" */
function formatDateTime(isoStr: string | undefined): string {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}年${mo}月${day}日 ${h}:${min}`;
  } catch {
    return isoStr;
  }
}

export default function Footer() {
  const formattedCutoffDate = formatDate(dataUpdatedAt);
  const formattedGeneratedAt = formatDateTime(pageGeneratedAt);

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 数据来源 */}
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

          {/* 时间说明 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">数据时效</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CalendarDays className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <span className="text-foreground/70 font-medium">数据统计截止：</span>
                  <span className="text-amber-400 font-semibold">{formattedCutoffDate}</span>
                  <br />
                  <span className="text-[10px] leading-relaxed opacity-70">
                    以模型新品发布为准，不固定更新周期
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-3 h-3 shrink-0 mt-0.5 text-sky-400" />
                <span>
                  <span className="text-foreground/70 font-medium">页面生成时间：</span>
                  <span className="text-sky-400">{formattedGeneratedAt}</span>
                  <br />
                  <span className="text-[10px] leading-relaxed opacity-70">
                    每次数据更新后自动重新构建
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* 说明 */}
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
            国产大模型天梯榜 · 数据统计截止 {formattedCutoffDate} · 仅供学习研究参考
          </p>
        </div>
      </div>
    </footer>
  );
}
