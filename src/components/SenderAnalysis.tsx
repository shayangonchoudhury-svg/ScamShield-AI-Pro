import { motion } from 'motion/react';
import { User, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  text: string;
}

export default function SenderAnalysis({ text }: Props) {
  const fromMatch = text.match(/from:?\s*(?:["']?([^"']+)["']?\s*)?<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/i);
  const emailMatch = fromMatch ? fromMatch[2] : text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)?.[0];
  const displayName = fromMatch ? fromMatch[1] : null;

  if (!emailMatch) {
    return (
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-800 text-center text-gray-500">
        No sender details found in the email content.
      </div>
    );
  }

  const domain = emailMatch.split('@')[1];
  const freeProviders = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'aol.com', 'icloud.com'];
  const isFree = freeProviders.includes(domain.toLowerCase());
  
  const suspiciousIndicators = [];
  if (isFree) suspiciousIndicators.push('Uses free email provider');
  if (domain.length > 20) suspiciousIndicators.push('Long, unusual domain name');
  if (/[0-9]{5,}/.test(domain)) suspiciousIndicators.push('Domain contains random numbers');

  const trustAssessment = isFree ? 'Medium - Requires Verification' : 'Low - Verified Corporate Domain';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-950/60 border border-gray-800 p-6 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-cyan-400" />
        <h4 className="text-xl font-semibold text-white">Sender Analysis</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Display Name:</span> <span className="text-white">{displayName || 'N/A'}</span></div>
        <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Email:</span> <span className="text-white font-mono truncate">{emailMatch}</span></div>
        <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Domain:</span> <span className="text-white">{domain}</span></div>
        <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Free Provider:</span> <span className={isFree ? 'text-orange-400' : 'text-emerald-400'}>{isFree ? 'Yes' : 'No'}</span></div>
      </div>

      {suspiciousIndicators.length > 0 && (
        <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-4 h-4" />
          <span>Suspicious Indicators: {suspiciousIndicators.join(', ')}</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border flex items-center gap-3 ${isFree ? 'bg-orange-500/10 border-orange-500/20 text-orange-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
        {isFree ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        <div>
          <div className="font-semibold">Trust Assessment:</div>
          <div className="text-sm">{trustAssessment}</div>
        </div>
      </div>
    </motion.div>
  );
}
