/**
 * Home - 国产大模型天梯榜主页
 * Design: 竞技场/体育赛事排行美学
 * Color: Deep navy (#0f172a) + gold champion + gradient blue
 * Font: DM Sans + Noto Sans SC + JetBrains Mono
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LeaderboardTable from "@/components/LeaderboardTable";
import DimensionComparison from "@/components/DimensionComparison";
import ModelHighlights from "@/components/ModelHighlights";
import UseCaseGuide from "@/components/UseCaseGuide";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <div id="leaderboard">
          <LeaderboardTable />
        </div>
        <div id="dimensions">
          <DimensionComparison />
        </div>
        <div id="models">
          <ModelHighlights />
        </div>
        <div id="guide">
          <UseCaseGuide />
        </div>
      </main>
      <Footer />
    </div>
  );
}
