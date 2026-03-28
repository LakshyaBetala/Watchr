import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionBadge from "./SectionBadge";
import { Button } from "@/components/ui/button";
import { Mail, Terminal } from "lucide-react";

const faqs = [
  { q: "What is VisionIQ?", a: "VisionIQ is an AI-powered smart surveillance platform that transforms standard CCTV cameras into intelligent business tools for retail — covering theft prevention, customer analytics, staff monitoring, fire safety, and people re-identification." },
  { q: "Do you use facial recognition?", a: "No. VisionIQ uses silhouette-based analysis and behavioral AI. We never store biometric data or facial features. Our platform is fully compliant with GDPR and India's IT Act 2000." },
  { q: "How does installation work?", a: "We deploy edge AI hardware that connects to your existing CCTV infrastructure. The entire setup — from hardware installation to dashboard onboarding — takes under 48 hours per store." },
  { q: "Is the data stored on cloud or on-device?", a: "All real-time processing happens on-device at the edge. Only aggregated analytics and alert metadata are synced to the cloud dashboard. Raw video never leaves your premises." },
  { q: "What industries do you serve?", a: "We serve fashion retail, supermarkets, cafes & QSR, warehouses, electronics stores, hotels, banks, and pharmaceutical outlets — any commercial space with security and analytics needs." },
];

const FAQSection = () => (
  <section className="py-24 md:py-32 relative overflow-hidden bg-[#000000] border-t border-white/10">
    {/* Tactical Grid Background */}
    <div 
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />

    <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Heading and CTA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 lg:sticky lg:top-32"
        >
          <SectionBadge text="KNOWLEDGE BASE" />
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mt-6 uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Query <br/>
            <span className="text-gray-500">Database.</span>
          </h2>
          <p className="mt-6 text-sm md:text-base text-gray-400 font-mono uppercase tracking-widest leading-relaxed max-w-md">
            Operational parameters, data privacy protocols, and hardware compatibility specifications.
          </p>
          
          <div className="mt-12 pt-8 border-t border-white/10 hidden lg:block">
            <h3 className="text-white text-lg font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>// Manual Override</h3>
            <p className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">Connect with a tactical deployment specialist.</p>
            <Button className="rounded-none border border-white/30 bg-white text-black hover:bg-transparent hover:text-white transition-all w-full md:w-auto h-12 uppercase tracking-widest font-bold text-xs" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              <Terminal className="mr-2 h-4 w-4" />
              Initialize Contact
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Accordion */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-7"
        >
          <div className="border border-white/10 bg-[#050505] p-2">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`} 
                  className="border-b border-white/10 last:border-0 rounded-none bg-transparent px-4 md:px-6 data-[state=open]:bg-white/5 data-[state=open]:border-white/20 transition-all duration-300 relative group"
                >
                  {/* Left indicator line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white scale-y-0 group-data-[state=open]:scale-y-100 origin-top transition-transform duration-300" />
                  
                  <AccordionTrigger className="text-left text-white hover:text-gray-300 transition-colors hover:no-underline py-6 text-base md:text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                    <span className="text-gray-600 mr-4 font-mono text-sm">{(i + 1).toString().padStart(2, '0')}</span>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 pb-8 leading-relaxed text-sm md:text-base font-medium">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
      
      {/* Mobile-only CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 pt-8 border-t border-white/10 block lg:hidden text-center"
      >
        <h3 className="text-white text-lg font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>// Manual Override</h3>
        <p className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest max-w-xs mx-auto">Connect with a tactical deployment specialist.</p>
        <Button className="rounded-none border border-white/30 bg-white text-black hover:bg-transparent hover:text-white transition-all w-full h-12 uppercase tracking-widest font-bold text-xs" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
          <Terminal className="mr-2 h-4 w-4" />
          Initialize Contact
        </Button>
      </motion.div>
      
    </div>
  </section>
);

export default FAQSection;
