import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
    const key = (
        process.env.OPENAI_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.OPENROUTER_API_KEY ||
        process.env.API_KEY ||
        ""
    ).trim();

    if (!key || key === "your_openai_api_key_here") {
        console.warn("No API key configured in Backend/.env. Providing local simulated response.");
        return `Hello! I am **IntelliGPT**.

Your message was:
> ${message}

*Note: No API key is currently set in your \`Backend/.env\` file. Add your free OpenRouter, Groq, or Gemini key to \`Backend/.env\` to enable live AI responses.*`;
    }

    // 1. OpenRouter (keys starting with 'sk-or-')
    if (key.startsWith("sk-or-")) {
        const freeModels = [
            "openrouter/free",
            "google/gemma-4-31b-it:free",
            "nvidia/nemotron-3.5-lightning:free"
        ];

        for (const model of freeModels) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${key}`,
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "IntelliGPT"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: "You are IntelliGPT, an intelligent, helpful AI assistant. Format all responses using clear GitHub Flavored Markdown. When outputting tables, always format them with proper newlines on each row." },
                            { role: "user", content: message }
                        ]
                    })
                });

                const data = await response.json();
                if (response.ok && data.choices && data.choices.length > 0) {
                    const content = data.choices[0].message?.content;
                    if (content) return content;
                }
            } catch (err) {
                console.warn(`OpenRouter model ${model} failed, trying fallback...`, err.message);
            }
        }

        return "**Error:** Could not generate a response from OpenRouter free models. Please check your key.";
    }

    // 2. Groq (keys starting with 'gsk_')
    if (key.startsWith("gsk_")) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are IntelliGPT, a fast and helpful AI assistant. Format your answers clearly using Markdown." },
                        { role: "user", content: message }
                    ]
                })
            });

            const data = await response.json();
            if (response.ok && data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            }
            return `**Groq Notice:** ${data?.error?.message || "Error generating response"}`;
        } catch (err) {
            return `**Groq Connection Error:** ${err.message}`;
        }
    }

    // 3. Google Gemini (keys starting with 'AQ.' or 'AIzaSy')
    if (key.startsWith("AQ.") || key.startsWith("AIzaSy")) {
        const fastModels = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.7-flash"];

        for (const model of fastModels) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are IntelliGPT, an intelligent, fast, and helpful AI assistant. Provide concise, clear answers formatted in Markdown.\n\nUser prompt: ${message}`
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000
                        }
                    })
                });

                const data = await response.json();

                if (response.ok && data.candidates && data.candidates.length > 0) {
                    const candidate = data.candidates[0];
                    const replyText = candidate.content?.parts?.map(p => p.text).filter(Boolean).join("") || "";
                    if (replyText) return replyText;
                }
            } catch (err) {
                console.warn(`Model ${model} request failed, trying fallback...`, err.message);
            }
        }

        return "**Error:** Could not generate a response from Google Gemini. Please try again.";
    }

    // 4. Default: OpenAI API (keys starting with 'sk-...')
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are IntelliGPT, a helpful and precise AI assistant. Format answers using Markdown." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        if (response.ok && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }
        return `**OpenAI Notice:** ${data?.error?.message || "Error generating response"}`;
    } catch (err) {
        return `**OpenAI Error:** ${err.message}`;
    }
};

export default getOpenAIAPIResponse;