import { motion } from 'motion/react';
import { ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, Link as LinkIcon } from 'lucide-react';

interface URLData {
  url: string;
  protocol: string;
  domain: string;
  tld: string;
  shortened: boolean;
  suspicious: string[];
}

interface Props {
  text: string;
}

export default function LinkAnalysis({ text }: Props) {
  const urlRegex = /(https?:\/\/[^\s"<>]+)/g;
  const rawUrls = Array.from(new Set(text.match(urlRegex) || []));

  const analyzeUrl = (urlStr: string): URLData | null => {
    try {
      const url = new URL(urlStr);
      const domainParts = url.hostname.split('.');
      const suspicious: string[] = [];
      
      if (url.protocol === 'http:') suspicious.push('Uses insecure HTTP');
      if (urlStr.length < 25) suspicious.push('Very short URL');
      if (/bit\.ly|t\.co|goo\.gl|tinyurl\.com|t\.co/i.test(url.hostname)) suspicious.push('Known shortener');

      return {
        url: urlStr,
        protocol: url.protocol.replace(':', '').toUpperCase(),
        domain: url.hostname,
        tld: domainParts.length > 1 ? domainParts[domainParts.length - 1] : '',
        shortened: urlStr.length < 30 || /bit\.ly|t\.co|goo\.gl|tinyurl\.com|t\.co/i.test(url.hostname),
        suspicious
      };
    } catch {
      return null;
    }
  };

  const links = rawUrls.map(analyzeUrl).filter(Boolean) as URLData[];

  if (links.length === 0) {
    return (
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-800 text-center text-gray-500">
        No links were detected in this email.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link, i) => (
        <motion.div
          key={link.url}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-950/60 border border-gray-800 p-6 rounded-2xl flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <LinkIcon className="w-5 h-5 text-cyan-400" />
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline font-mono truncate text-sm">
              {link.url}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Protocol:</span> <span className="text-white">{link.protocol}</span></div>
            <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Domain:</span> <span className="text-white truncate">{link.domain}</span></div>
            <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">TLD:</span> <span className="text-white">{link.tld}</span></div>
            <div className="bg-gray-900 p-3 rounded-lg"><span className="text-gray-500">Shortened:</span> <span className={link.shortened ? 'text-orange-400' : 'text-emerald-400'}>{link.shortened ? 'Yes' : 'No'}</span></div>
          </div>

          {link.suspicious.length > 0 && (
            <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Suspicious: {link.suspicious.join(', ')}</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
