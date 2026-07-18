import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  'Email Parsed',
  'Sender Evaluated',
  'Links Inspected',
  'Language Checked',
  'Social Engineering Detected',
  'Risk Calculated',
  'Report Generated'
];

export default function ThreatTimeline() {
  return (
    <div className="bg-gray-950/60 border border-gray-800 p-8 rounded-3xl">
      <h4 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
        <div className="w-2 h-6 bg-cyan-500 rounded-full" />
        Threat Analysis Timeline
      </h4>
      <div className="space-y-0 relative">
        {steps.map((step, i) => (
          <div key={step} className="relative flex gap-6 pb-6 last:pb-0">
            {/* Timeline line */}
            {i !== steps.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-800" />
            )}
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="text-gray-300 font-medium pt-0.5"
            >
              {step}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
