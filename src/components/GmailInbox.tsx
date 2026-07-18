import { useState, useEffect } from "react";
import { motion } from 'motion/react';
import { Mail, ShieldCheck } from 'lucide-react';

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  read: boolean;
  securityStatus: "Unknown",
}


export default function GmailInbox({
    user,
    accessToken,
    onAnalyze,
}: {
    user: {
        name: string;
        email: string;
        picture: string;
    };
    accessToken: string;
    onAnalyze: (email: Email) => void;
}) {
  const [emails, setEmails] = useState<Email[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadEmails() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
        }),
      });

     const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Failed to fetch Gmail");
}

setEmails(
  data.map((email: any) => ({
    ...email,
    read: true,
    securityStatus: "Not Analyzed",
  }))
);
    } catch (err) {
  console.error("Failed to load Gmail:", err);
  alert("Unable to load your Gmail inbox.");
} finally {
      setLoading(false);
    }
  }

  loadEmails();
}, [accessToken]);
if (loading) {
  return (
    <div className="text-center text-white py-20">
      Loading your Gmail...
    </div>
  );
}
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center gap-4 mb-10 shadow-xl">
        <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full border-2 border-gray-800" />
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <div className="ml-auto px-4 py-1 bg-emerald-900/20 text-emerald-400 font-bold rounded-full border border-emerald-900/50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          ✓ Gmail Connected
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6 text-white">Recent Emails</h3>
      <div className="space-y-4">
        {emails.map((email) => (
          <motion.div
            key={email.id}
            className="bg-gray-950/60 backdrop-blur-md border border-gray-800 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${email.securityStatus === 'Safe' ? 'bg-emerald-900/20' : 'bg-rose-900/20'}`}>
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold text-white">{email.sender}</div>
                <div className="text-xs text-gray-500">{email.date}</div>
              </div>
              <div className="text-sm font-medium text-gray-300 mb-1">{email.subject}</div>
              <div className="text-xs text-gray-500 truncate max-w-sm">{email.snippet}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
              email.securityStatus === 'Safe' ? 'bg-emerald-900/20 text-emerald-400' : 
              email.securityStatus === 'Suspicious' ? 'bg-orange-900/20 text-orange-400' : 'bg-rose-900/20 text-rose-400'
            }`}>
              {email.securityStatus}
            </div>
            <button
              onClick={() => onAnalyze(email)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Analyze
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
