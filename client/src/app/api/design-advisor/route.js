export async function POST(req) {
  try {
    const { message, config } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { reply: "AI configuration error." },
        { status: 500 }
      );
    }

    // ✅ fallback safety (if config missing)
    const wheels = config?.availableWheels || [];
    const rims = config?.availableRims || [];

    const prompt = `
You are an AI Car Design Advisor.

IMPORTANT:
- Only recommend options from the lists below
- Do NOT suggest anything outside these options

Available Wheels:
${wheels.join(", ")}

Available Rims:
${rims.join(", ")}

User Question:
${message}

Give a short recommendation (1-2 lines).
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Try a different combination for a better look.";

    // ✅ LIGHT SAFETY CHECK (optional but good)
    const isValid =
      wheels.some(w => reply.toLowerCase().includes(w.toLowerCase())) ||
      rims.some(r => reply.toLowerCase().includes(r.toLowerCase()));

    if (!isValid && wheels.length && rims.length) {
      reply = `Try ${wheels[0]} with ${rims[0]} for a clean look.`;
    }

    return Response.json({ reply });

  } catch (error) {
    return Response.json(
      { reply: "AI error. Try again." },
      { status: 500 }
    );
  }
}