"use client";

import { FC, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ComponentProps {
  title: string;
  description: string[];
  icon?: ReactNode;
}

const HighlightCard: FC<ComponentProps> = ({ title, description, icon }) => {
  return (
    <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1 h-full w-full">
      <Card className="text-white rounded-2xl border border-white/10 bg-gradient-to-br from-[#010101] via-[#090909] to-[#010101] shadow-2xl relative backdrop-blur-xl overflow-hidden hover:border-primary/50 hover:shadow-primary/20 hover:shadow-2xl h-full flex flex-col">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700"></div>
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-primary/10 blur-xl transition-opacity duration-500 opacity-50 group-hover:opacity-80"></div>
          <div className="absolute bottom-16 right-16 w-12 h-12 rounded-full bg-primary/10 blur-lg transition-opacity duration-500 opacity-50 group-hover:opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
        </div>

        {/* Content */}
        <div className="p-8 relative z-10 flex flex-col items-center flex-grow text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 rounded-full border border-primary/10"></div>

            <div className="p-6 rounded-full backdrop-blur-lg border border-primary/20 bg-gradient-to-br from-black/80 to-black/60 shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-primary/20">
              <div className="transform transition-transform duration-700 text-primary">
                {icon}
              </div>
            </div>
          </div>

          <h3 className="mb-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-300">
            {title}
          </h3>

          <div className="space-y-1 max-w-sm flex-grow">
            {description.map((line, idx) => (
              <p
                key={idx}
                className="text-gray-300 text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300"
              >
                {line}
              </p>
            ))}
          </div>

          {/* Bottom Line & Dots */}
          <div className="mt-8">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transform group-hover:w-24 group-hover:h-1 transition-all duration-500 mx-auto"></div>
            
            <div className="flex space-x-2 mt-4 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-primary/80 rounded-full"></div>
              <div className="w-2 h-2 bg-primary/80 rounded-full"></div>
              <div className="w-2 h-2 bg-primary/80 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Corner Gradients */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </Card>
    </div>
  );
};

export default HighlightCard;
