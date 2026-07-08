import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);


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
console.log(
"Gemini Key:",
import.meta.env.VITE_GEMINI_API_KEY
);