export async function POST(req) {
console.log("KEY:", process.env.GEMINI_API_KEY);
    const { message, config } = await req.json();
    

     
  const prompt = `
You are an AI Car Design Advisor.

Analyze:
- Visual balance
- Style consistency
- Compatibility

Car Design:
${JSON.stringify(config)}

User Question:
${message}

Give short, specific, and modern design advice.
Avoid generic suggestions.
Mention exact styling choices (colors, rim types, finishes).
Limit to 2-3 sentences.
`;

  const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  }
);

    const data = await response.json();
    console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

  return Response.json({
    reply:
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Something went wrong. Try again.",
  });
}