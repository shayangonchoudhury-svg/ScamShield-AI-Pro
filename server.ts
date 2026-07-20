import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // API endpoints FIRST


app.post("/api/gmail", async (req, res) => {
  console.log("✅ /api/gmail endpoint hit");

  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: "Missing access token",
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({
      version: "v1",
      auth,
    });

    const messages = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
    });

    interface GmailEmail {
      id: string;
      sender: string;
      subject: string;
      date: string;
      snippet: string;
    }

    const emails: GmailEmail[] = [];

    for (const msg of messages.data.messages || []) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
      });

      const headers = full.data.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find(
          (h) => h.name?.toLowerCase() === name.toLowerCase()
        )?.value ?? "";

      emails.push({
        id: msg.id!,
        sender: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: full.data.snippet ?? "",
      });
    }

    return res.json(emails);

  } catch (err: any) {
    console.error("=== Gmail API Error ===");
    console.error(err);

    if (err.response?.data) {
      console.error(
        "Google Response:",
        JSON.stringify(err.response.data, null, 2)
      );
    }

    return res.status(500).json({
      error: err.message,
      details: err.response?.data || null,
    });
  }
});
  app.post("/api/analyze", async (req, res) => {
    try {
      const { emailText } = req.body;

      if (!emailText || typeof emailText !== "string" || emailText.trim().length === 0) {
        return res.status(400).json({ error: "Email content is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please add it via the Settings > Secrets panel."
        });
      }

      // Lazy initialization of GoogleGenAI
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const systemInstruction = `You are an experienced Cybersecurity Analyst specializing in phishing detection, scam investigation and social engineering attacks.

Your task is to analyze ONE email.

Do not assume every email is malicious.

Evaluate carefully.

Look for:

• Urgency
• Fear tactics
• Suspicious sender
• Grammar issues
• Fake company impersonation
• Requests for passwords
• Requests for OTP
• Requests for banking details
• Requests for payment
• Suspicious links
• Unexpected attachments
• Cryptocurrency scams
• Fake invoices
• Lottery scams
• Job scams
• Delivery scams
• Technical support scams
• Gift card scams
• Identity theft attempts
• Social engineering techniques

Return ONLY valid JSON.

{
  "verdict":"",
  "confidence":0,
  "riskLevel":"",
  "threatType":"",
  "summary":"",
  "redFlags":[],
  "safeIndicators":[],
  "recommendations":[],
  "education":"",
  "detectedPhrases":[]
}

Rules:

verdict:
Safe
Suspicious
Likely Scam

confidence:
0-100

riskLevel:
Low
Medium
High
Critical

threatType:
Choose only one:

None
Phishing
Credential Theft
Banking Scam
Lottery Scam
Investment Scam
Job Scam
Delivery Scam
Technical Support Scam
Gift Card Scam
Identity Theft
Business Email Compromise
Unknown

summary:
Explain in under 80 words.

redFlags:
List every warning sign.

safeIndicators:
Mention positive indicators if present.

recommendations:
Give practical security advice.

education:
Explain WHY the email is dangerous or why it appears safe in beginner-friendly language.

Never include Markdown.

Never include extra text.

Return JSON only.`;

      const prompt = `Inspect this email text:
----------------------------------------
${emailText}
----------------------------------------`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING },
              threatType: { type: Type.STRING },
              summary: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              safeIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.STRING },
              detectedPhrases: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: {
                    phrase: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    level: { type: Type.STRING }
                  },
                  required: ["phrase", "reason", "level"]
                }
              }
            },
            required: [
              "verdict",
              "confidence",
              "riskLevel",
              "threatType",
              "summary",
              "redFlags",
              "safeIndicators",
              "recommendations",
              "education",
              "detectedPhrases"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini.");
      }

      const parsedResult = JSON.parse(responseText.trim());
      return res.json(parsedResult);
    } catch (error: any) {
      console.error("Analysis API Error:", error);
      return res.status(500).json({
        error: "An error occurred during email analysis.",
        details: error.message || error
      });
    }
  });

  // Serve static assets in production or mount Vite middleware in development
 if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScamShield AI server running on port ${PORT}`);
  });
}

startServer();
