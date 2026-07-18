import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  emailText: string;
  detectedPhrases: { phrase: string; reason: string; level: 'High' | 'Medium' | 'Low' }[];
}

export default function SuspiciousTextHighlighter({ emailText, detectedPhrases }: Props) {
  const [hoveredPhrase, setHoveredPhrase] = useState<{phrase: string, reason: string, level: string} | null>(null);

  if (!detectedPhrases || detectedPhrases.length === 0) {
    return <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-gray-400 font-mono text-sm whitespace-pre-wrap">{emailText}</div>;
  }

  // Create a sorted list of phrases to highlight
  const sortedPhrases = [...detectedPhrases].sort((a, b) => b.phrase.length - a.phrase.length);

  // Simple highlighter logic: split and reconstruct with spans
  // This is a naive implementation, but should work for basic cases
  let highlightedText = emailText;
  
  // This is too simplistic for complex text, but I will try to map and replace
  // Better approach: use a regex to find phrases
  
  const getHighlightColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-rose-500/30 border-rose-500/50';
      case 'medium': return 'bg-orange-500/30 border-orange-500/50';
      case 'low': return 'bg-yellow-500/30 border-yellow-500/50';
      default: return 'bg-gray-500/30 border-gray-500/50';
    }
  };

  // Build a map of highlighted parts
  const parts = [];
  let currentIndex = 0;

  // This is actually complex to do correctly with text replacement
  // I will just use a simple approach for now, focusing on visual demonstration
  
  return (
    <div className="relative bg-gray-900/50 p-6 rounded-2xl border border-gray-800 font-mono text-sm text-gray-300 whitespace-pre-wrap">
      {emailText.split(new RegExp(`(${sortedPhrases.map(p => p.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')).map((part, index) => {
        const phraseObj = detectedPhrases.find(p => p.phrase.toLowerCase() === part.toLowerCase());
        if (phraseObj) {
          return (
            <span
              key={index}
              className={`relative cursor-help px-1 rounded border-b-2 ${getHighlightColor(phraseObj.level)}`}
              onMouseEnter={() => setHoveredPhrase(phraseObj)}
              onMouseLeave={() => setHoveredPhrase(null)}
            >
              {part}
            </span>
          );
        }
        return part;
      })}
      
      <AnimatePresence>
        {hoveredPhrase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 bg-gray-950 border border-gray-800 p-4 rounded-xl shadow-2xl max-w-xs text-sm"
            style={{ pointerEvents: 'none' }}
          >
            <div className="font-semibold text-white mb-1">{hoveredPhrase.phrase}</div>
            <div className="text-gray-400">{hoveredPhrase.reason}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
