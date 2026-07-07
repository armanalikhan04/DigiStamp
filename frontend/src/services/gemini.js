import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);


export async function generateAgreement(details) {


  const model = genAI.getGenerativeModel({

model:"gemini-2.0-flash"

});


  const prompt = `

Create a professional digital agreement.

Agreement Details:

Party A:
${details.partyA}

Party B:
${details.partyB}

Amount:
${details.amount}

Terms:
${details.terms}


Generate a proper agreement containing:

1. Agreement introduction

2. Responsibilities of both parties

3. Payment conditions

4. Important terms

5. Closing confirmation

`;


  const result = await model.generateContent(prompt);


  return result.response.text();

}
console.log(
"Gemini Key:",
import.meta.env.VITE_GEMINI_API_KEY
);