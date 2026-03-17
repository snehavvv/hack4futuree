import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Info } from 'lucide-react';

export const OnboardingTour: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem('squint_onboarding_dismissed');
  });

  const steps = [
    {
      title: "Welcome to Squint Scale",
      desc: "An AI-powered readability analysis suite. Let's take a quick 1-minute tour of your new dashboard terminal.",
      target: "header"
    },
    {
      title: "Analyze & Degradation",
      desc: "Upload any design asset to see how it performs under different vision conditions like myopia or bright sunlight glare.",
      target: "simulation"
    },
    {
      title: "Smart Suggestions",
      desc: "Receive ranked CSS fix suggestions with copyable code snippets to instantly improve your design's accessibility.",
      target: "suggestions"
    },
    {
      title: "PDF Reports",
      desc: "Generate professional compliance reports to share with your team or stakeholders in a single click.",
      target: "export"
    }
  ];

  const handleDismiss = () => {
    localStorage.setItem('squint_onboarding_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-8 right-8 z-[1000] max-w-sm"
      >
        <div className="glass-panel p-6 border-cyan/30 bg-bg-secondary/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan" />
          
          <button onClick={handleDismiss} className="absolute top-4 right-4 text-text-tertiary hover:text-white">
            <X size={16} />
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan">
              <Info size={18} />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Operative Briefing</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white leading-tight">{steps[step].title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{steps[step].desc}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-cyan' : 'bg-bg-tertiary'}`} />
                ))}
              </div>
              
              <button 
                onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleDismiss()}
                className="flex items-center gap-2 text-sm font-bold text-cyan hover:text-purple transition-colors"
              >
                {step === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
