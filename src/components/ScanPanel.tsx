import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const scanSteps = [
  'Reading email...',
  'Checking sender...',
  'Detecting phishing...',
  'Inspecting grammar...',
  'Finding suspicious requests...',
  'Looking for fake domains...',
  'Identifying social engineering...',
  'Computing confidence score...',
  'Preparing final report...'
];

export default function ScanPanel() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep < scanSteps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  return (
    <div className="bg-gray-950/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        Security Scan in Progress...
      </h3>
      <div className="space-y-3">
        {scanSteps.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 text-sm font-medium p-3 rounded-xl transition-colors ${
                isActive ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20' : 
                isDone ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-cyan-400 animate-pulse' : 'border-gray-700'}`} />
              )}
              {step}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
