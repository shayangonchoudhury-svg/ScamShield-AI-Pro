import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, User } from 'lucide-react';
import { EmailAnalysisResult } from './types';
import EmailAnalysisResultView from './components/EmailAnalysisResult';
import { EXAMPLE_EMAILS } from './data';
import ScanPanel from './components/ScanPanel';
import GmailInbox from './components/GmailInbox';

export default function App() {
  const [emailText, setEmailText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [view, setView] = useState<'inbox' | 'analysis'>('inbox');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [accessToken, setAccessToken] = useState("");

  const analyzeEmail = async (content: string) => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setEmailText(content);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: content }),
      });
      
      const data = await response.json();
      console.log("Gemini Response:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze email');
      }
      
      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => {
    setEmailText('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

const renderHeader = () => (
  <header className="sticky top-0 z-50 backdrop-blur-md bg-[#050816]/70 border-b border-gray-800">
    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
        </div>

        <span className="text-xl font-display font-bold">
          ScamShield AI <span className="text-cyan-400">Pro</span>
        </span>

        <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded-full text-[10px] font-bold text-gray-400 tracking-wider">
          POWERED BY GEMINI
        </span>
      </div>

      {gmailConnected && (
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
        >
          Logout
        </button>
      )}

    </div>
  </header>
);
  
  const login = useGoogleLogin({
  scope:
    "openid email profile https://www.googleapis.com/auth/gmail.readonly",

  onSuccess: async (tokenResponse) => {
    setAccessToken(tokenResponse.access_token);

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }
    );



    const profile = await response.json();

    setUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    });

    setGmailConnected(true);
  },

  onError: () => {
    alert("Google Sign-In failed");
  },
});

const logout = () => {
  googleLogout();

  setUser(null);
  setAccessToken("");
  setGmailConnected(false);
  setView("inbox");

  setEmailText("");
  setResult(null);
  setError(null);
};
  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px]" />
      </div>

      {renderHeader()}
      
      <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
        {gmailConnected ? (
          view === 'inbox' ? (
           <GmailInbox
  user={user!}
  accessToken={accessToken}
 onAnalyze={async (email) => {
  try {
    const response = await fetch("/api/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        messageId: email.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch email");
    }

    if (!data.body || data.body.trim() === "") {
    throw new Error("Email body is empty.");
}

await analyzeEmail(data.body);

    setView("analysis");
  } catch (err) {
    console.error(err);
    alert("Unable to load the full email.");
  }
}}
/>
          ) : (
            <main>
              <button onClick={() => setView('inbox')} className="text-cyan-400 hover:text-cyan-300 mb-6 flex items-center gap-2">
                ← Back to Inbox
              </button>
              {/* existing analysis main content (textarea etc) */}
              <motion.div className="bg-gray-950/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <textarea
                  ref={textareaRef}
                  rows={10}
                  className="w-full bg-[#0B1120] border border-gray-800 rounded-3xl p-6 text-white mb-6"
                  placeholder="Paste the email content to analyze..."
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                />
                <button
                  onClick={() => analyzeEmail(emailText)}
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl"
                >
                  Analyze
                </button>
              </motion.div>
              <div ref={resultsRef} className="mt-12">
                  <AnimatePresence mode="wait">
                    {result && <EmailAnalysisResultView result={result} emailText={emailText} />}
                  </AnimatePresence>
              </div>
            </main>
          )
        ) : (
          <main className="flex flex-col items-center justify-center pt-16">
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Protect Your Gmail Inbox with AI
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Connect your Gmail account and let ScamShield AI inspect suspicious emails for phishing attacks, scams, malware indicators and social engineering.
              </p>
            </motion.section>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-950/60 backdrop-blur-xl border border-gray-800 p-10 rounded-3xl w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Connect Your Gmail</h2>
              <p className="text-gray-400 mb-8">Securely connect your Gmail account to begin AI-powered security analysis.</p>
              
              <button
  onClick={() => login()}
  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-2xl text-lg hover:bg-gray-200 transition-colors mb-6 shadow-lg shadow-white/10"
>
  <User className="w-5 h-5" />
  Continue with Google
</button>
              
              <p className="text-sm text-gray-500">We only request read-only access to analyze your emails.</p>
            </motion.div>
          </main>
        )}
      </div>
    </div>
  );
}
