import { motion } from 'motion/react';
import { 
  FileText, Hash, Link as LinkIcon, Mail, Phone, DollarSign, AlertTriangle, 
  AlertOctagon, Paperclip, Calendar 
} from 'lucide-react';

interface Props {
  text: string;
}

export default function EmailStatistics({ text }: Props) {
  const stats = {
    words: text.split(/\s+/).filter(Boolean).length,
    chars: text.length,
    links: (text.match(/(https?:\/\/[^\s]+)/g) || []).length,
    emails: (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length,
    phones: (text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []).length,
    currency: (text.match(/[$€£¥]/g) || []).length,
    urgent: (text.match(/\b(urgent|act now|immediately|asap|24 hours|deadline)\b/gi) || []).length,
    exclamations: (text.match(/!/g) || []).length,
    attachments: (text.match(/\b(attachment|attached|file|document|invoice)\b/gi) || []).length,
    dates: (text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/gi) || []).length,
  };

  const items = [
    { label: 'Words', value: stats.words, icon: FileText },
    { label: 'Characters', value: stats.chars, icon: Hash },
    { label: 'Links', value: stats.links, icon: LinkIcon },
    { label: 'Emails', value: stats.emails, icon: Mail },
    { label: 'Phone #s', value: stats.phones, icon: Phone },
    { label: 'Currency', value: stats.currency, icon: DollarSign },
    { label: 'Urgent Words', value: stats.urgent, icon: AlertTriangle },
    { label: 'Exclamations', value: stats.exclamations, icon: AlertOctagon },
    { label: 'Attachments', value: stats.attachments, icon: Paperclip },
    { label: 'Dates', value: stats.dates, icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-gray-950/60 border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-900/50 transition-colors"
        >
          <item.icon className="w-5 h-5 text-cyan-400" />
          <span className="text-2xl font-bold text-white">{item.value}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider text-center">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
