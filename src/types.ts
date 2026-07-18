export interface EmailAnalysisResult {
  verdict: string;
  confidence: number;
  riskLevel: string;
  threatType: string;
  summary: string;
  redFlags: string[];
  safeIndicators: string[];
  recommendations: string[];
  education: string;
  detectedPhrases: { phrase: string; reason: string; level: 'High' | 'Medium' | 'Low' }[];
}
