import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Landing pages
import Index from "./pages/Index";
import Approach from "./pages/Approach";
import CapabilityPage from "./pages/CapabilityPage";
import Solutions from "./pages/Solutions";
import SolutionPage from "./pages/SolutionPage";
import CaseStudies from "./pages/CaseStudies";
import Company from "./pages/Company";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";

// Watchr Dashboard
import { WatchrShell } from "./components/watchr/WatchrShell";
import LiveCanvas from "./pages/watchr/LiveCanvas";
import ThreatMonitor from "./pages/watchr/ThreatMonitor";
import SafetySentinel from "./pages/watchr/SafetySentinel";
import EmployeeKiosk from "./pages/watchr/EmployeeKiosk";
import CustomerAnalytics from "./pages/watchr/CustomerAnalytics";
import AlertsCenter from "./pages/watchr/AlertsCenter";
import Settings from "./pages/watchr/Settings";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Landing pages */}
          <Route path="/" element={<Index />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/capabilities/:slug" element={<CapabilityPage />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/:slug" element={<SolutionPage />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/company" element={<Company />} />
          <Route path="/careers" element={<Careers />} />

          {/* Watchr Dashboard routes — wrapped in WatchrShell */}
          <Route path="/dashboard" element={<WatchrShell><LiveCanvas /></WatchrShell>} />
          <Route path="/dashboard/threat-monitor" element={<WatchrShell><ThreatMonitor /></WatchrShell>} />
          <Route path="/dashboard/safety" element={<WatchrShell><SafetySentinel /></WatchrShell>} />
          <Route path="/dashboard/kiosk" element={<WatchrShell><EmployeeKiosk /></WatchrShell>} />
          <Route path="/dashboard/customer-analytics" element={<WatchrShell><CustomerAnalytics /></WatchrShell>} />
          <Route path="/dashboard/alerts" element={<WatchrShell><AlertsCenter /></WatchrShell>} />
          <Route path="/dashboard/settings" element={<WatchrShell><Settings /></WatchrShell>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

