import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyCTABarProps {
  onDemoClick: () => void;
}

const StickyCTABar = ({ onDemoClick }: StickyCTABarProps) => {
  const [visible, setVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero-section");
      const footer = document.getElementById("footer-section");
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
      const windowH = window.innerHeight;
      setVisible(heroBottom < 0 && footerTop > windowH);
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <AnimatePresence>
        {visible && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.25 }}
            className="fixed top-[57px] md:top-[73px] left-0 right-0 z-40 h-12 border-b border-primary/30 bg-background/95 backdrop-blur-md"
          >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
              <p className="text-sm font-medium text-muted-foreground truncate mr-3">
                <span className="text-foreground font-semibold">VisionIQ</span> — AI Surveillance for Retail
              </p>
              <Button size="sm" className="rounded-md font-semibold text-xs h-8 shrink-0" onClick={onDemoClick}>
                Get Demo <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sticky CTA */}
      <AnimatePresence>
        {visible && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/30 bg-background/95 backdrop-blur-md px-4 py-3 safe-area-bottom"
          >
            <Button className="w-full rounded-md font-semibold text-base h-[52px]" onClick={onDemoClick}>
              Get Your Demo <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className={`fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors active:bg-muted ${
              isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
            }`}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickyCTABar;
