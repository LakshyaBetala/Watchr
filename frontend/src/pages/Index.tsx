import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

import ModulePhases from "@/components/landing/ModulePhases";
import RecognitionGrid from "@/components/landing/RecognitionGrid";
import IndustryVerticals from "@/components/landing/IndustryVerticals";
import DeploymentJourney from "@/components/landing/DeploymentJourney";
import WhyVisionIQ from "@/components/landing/WhyVisionIQ";
import ComparisonTable from "@/components/landing/ComparisonTable";
import FAQSection from "@/components/landing/FAQSection";

import Footer from "@/components/landing/Footer";
import { BGPattern } from "@/components/ui/bg-pattern";

import WhisperText from "@/components/ui/whisper-text";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background whitespace-pre-wrap">
      {/* Full-page grid background behind everything */}
      <BGPattern
        variant="grid"
        mask="none"
        size={60}
        fill="rgba(255,255,255,0.07)"
      />
      <Navbar />
      <HeroSection />
      
      <div className="flex flex-col justify-center items-center py-20 px-4 w-full select-none bg-black border-b border-white/10 z-10 relative">
        <WhisperText
          text="Security without compromise."
          className="font-black text-[#00F0FF] text-3xl sm:text-5xl md:text-6xl tracking-tighter uppercase"
          delay={100}
          duration={0.5}
          x={-20}
          y={0}
        />
        <p className="text-gray-400 mt-6 max-w-2xl text-center font-mono text-sm uppercase tracking-widest">
          Industry leading inference speeds powered by distributed AI nodes.
        </p>
      </div>

      <ModulePhases />
      <RecognitionGrid />
      <DeploymentJourney />
      <IndustryVerticals />
      <WhyVisionIQ />

      <ComparisonTable />
      <FAQSection />

      <div id="footer-section">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
