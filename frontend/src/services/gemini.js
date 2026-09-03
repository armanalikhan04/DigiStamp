import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

const extractJson = (text) => {
  const trimmedText = text.trim();
  const fencedJsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedJsonMatch ? fencedJsonMatch[1].trim() : trimmedText;
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini did not return structured risk analysis.");
  }

  return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1));
};

const normalizeRiskLevel = (level) => {
  const normalizedLevel = String(level || "").toUpperCase();

  if (["LOW", "MEDIUM", "HIGH"].includes(normalizedLevel)) {
    return normalizedLevel;
  }

  return "MEDIUM";
};

const toShortSentence = (value, fallback) => {
  const text = String(value || fallback).replace(/\s+/g, " ").trim();
  const firstSentenceMatch = text.match(/^.*?[.!?](?:\s|$)/);
  const sentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : text;

  return sentence.length > 150 ? `${sentence.slice(0, 147).trim()}...` : sentence;
};

const normalizeRiskAnalysis = (analysis) => ({
  riskLevel: normalizeRiskLevel(analysis.riskLevel),
  summary: toShortSentence(analysis.summary, "AI agreement check completed."),
  risks: Array.isArray(analysis.risks)
    ? analysis.risks.slice(0, 4).map((risk) => ({
        title: String(risk.title || "Potential risk")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60),
        severity: normalizeRiskLevel(risk.severity),
        description: toShortSentence(
          risk.description,
          "This item may need closer review before signing.",
        ),
        recommendation: toShortSentence(
          risk.recommendation,
          "Clarify this point in the agreement.",
        ),
      }))
    : [],
  recommendations: Array.isArray(analysis.recommendations)
    ? analysis.recommendations
        .slice(0, 3)
        .map((recommendation) => toShortSentence(recommendation, "Clarify this term."))
    : [],
});


export async function generateAgreement(details) {


  const model = genAI.getGenerativeModel({

model:"gemini-2.5-flash"

});


  const prompt = `

Write a short professional digital agreement.

Party A: ${details.partyA}

Party B: ${details.partyB}

Amount: ${details.amount}

Terms: ${details.terms}

Include:
- Agreement summary
- Payment terms
- Responsibilities

`;



  const result = await model.generateContent(prompt);


  return result.response.text();

}

export async function analyzeAgreementRisk(agreementText) {
  const model = genAI.getGenerativeModel({
    model:"gemini-2.5-flash"
  });

  const prompt = `
You are DigiStamp's AI Agreement Risk Assistant.

Important:
- Analyse only the supplied agreement text.
- Do not invent facts that are not present.
- Distinguish explicitly present information from incomplete or ambiguous terms.
- This is AI-assisted analysis, not professional legal advice.
- Do not say a clause is legally valid, invalid, enforceable, or guaranteed.
- Do not write a legal report or legal essay.
- Behave like a concise pre-signing checklist.

Output rules:
- Return ONLY valid JSON.
- Keep summary to one short sentence.
- Return no more than 4 risks.
- Prioritize the most important risks only.
- If the agreement is sufficiently complete, return LOW risk and an empty risks array.
- Ignore minor boilerplate gaps unless they materially affect this specific agreement.
- Each risk description must be one concise sentence.
- Each recommendation must be one concise actionable sentence.
- Avoid generic recommendations such as "add comprehensive legal boilerplate".

Focus on concrete missing or ambiguous deal terms:
- amount
- payment or disbursement method
- repayment or delivery date
- interest
- deliverables
- deadlines
- cancellation or termination
- default or late payment
- dispute resolution
- party responsibilities

Risk priority:
- HIGH: missing or ambiguous money, obligations, deadlines, default, or other material deal terms.
- MEDIUM: important but non-critical ambiguity or missing term.
- LOW: minor completeness issue or low-impact ambiguity.

Return this exact JSON shape:
{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "summary": "One short sentence",
  "risks": [
    {
      "title": "Short risk title",
      "severity": "LOW | MEDIUM | HIGH",
      "description": "One concise sentence based only on the agreement",
      "recommendation": "One concise actionable sentence"
    }
  ]
}

Agreement text:
${agreementText}
`;

  const result = await model.generateContent(prompt);
  const parsedAnalysis = extractJson(result.response.text());

  return normalizeRiskAnalysis(parsedAnalysis);
}
