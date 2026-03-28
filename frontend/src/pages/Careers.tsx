import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SectionBadge from "@/components/landing/SectionBadge";

const Careers = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <SectionBadge text="CAREERS" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2">Join VisionIQ</h1>
          <p className="mt-4 text-lg text-muted-foreground">Help us build the future of AI-powered surveillance.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center">
          <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">Open positions will be listed here shortly.</p>
        </motion.div>
      </div>
    </div>
    <div id="footer-section"><Footer /></div>
  </div>
);

export default Careers;
