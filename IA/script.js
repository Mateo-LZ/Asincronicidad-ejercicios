async function sendToGemini(inputText) {
    const apiKey = "AIzaSyBt8aQ1RCFREEzuLTE_7NOgwrr8PI5XX8k";
    const responseContainer = document.getElementById('responseGemini');

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const requestBody = {
        contents: [{ parts: [{ text: `Responde a lo siguiente:\n\n${inputText}` }] }]
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        console.log("Gemini:", data);

        const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        responseContainer.textContent = respuesta || "No se recibió respuesta válida de Gemini.";
        return respuesta;
    } catch (e) {
        const errorMsg = "Error en Gemini: " + e.message;
        responseContainer.textContent = errorMsg;
        return errorMsg;
    }
}

async function sendToCohere(inputText) {
    const apiKey = "4hLQla3PIwmsTZSTbu6GEiEoRs16nt0neWZXzpod";
    const responseContainer = document.getElementById('responseCohere');

    try {
        const res = await fetch("https://api.cohere.ai/v1/chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                message: inputText,
                model: "command-r-plus"
            })
        });

        const data = await res.json();
        console.log("Cohere:", data);

        const respuesta = data.text || "";
        responseContainer.textContent = respuesta || "No se recibió respuesta de Cohere.";
        return respuesta;
    } catch (e) {
        const errorMsg = "Error en Cohere: " + e.message;
        responseContainer.textContent = errorMsg;
        return errorMsg;
    }
}

function detectarSentimiento(texto) {
    if (!texto || texto.trim() === "") return "neutral";

    const textoLower = texto.toLowerCase();
    const palabrasNegativas = ["malo", "terrible", "no me gusta", "odio", "horrible", "pésimo", "pesimo", "caro"];
    const palabrasPositivas = ["bueno", "excelente", "me gusta", "perfecto", "genial", "positivo", "barato"];

    for (const neg of palabrasNegativas) {
        if (textoLower.includes(neg)) return "negativo";
    }
    for (const pos of palabrasPositivas) {
        if (textoLower.includes(pos)) return "positivo";
    }
    return "neutral";
}

async function generateSummaries() {
    const inputText = document.getElementById('inputText').value.trim();
    const loader = document.getElementById('loader');
    const mensajeSentimiento = document.getElementById('sentimentMessage');

    if (!inputText) {
        alert("Por favor, escribe una pregunta o texto.");
        return;
    }

    // ✅ Detectar petición específica: "enviar mensaje a discord"
    if (inputText.toLowerCase().includes("enviar mensaje a discord")) {
        alert("MENSAJE ENVIADO AL DISCORD");
        return; // No ejecuta llamadas a Gemini ni Cohere
    }

    loader.style.display = 'block';

    // Limpiar respuestas previas
    document.getElementById('responseGemini').textContent = "";
    document.getElementById('responseCohere').textContent = "";
    mensajeSentimiento.textContent = "";
    mensajeSentimiento.style.color = "black";

    // Esperar respuestas de Gemini y Cohere
    const [geminiResult, cohereResult] = await Promise.all([
        sendToGemini(inputText),
        sendToCohere(inputText)
    ]);

    loader.style.display = 'none';

    // Mostrar en consola las respuestas para debug
    console.log("Respuesta Gemini para sentimiento:", geminiResult);
    console.log("Respuesta Cohere para sentimiento:", cohereResult);

    // Elegir texto para análisis de sentimiento
    let textoParaSentimiento = "";

    if (cohereResult && cohereResult.trim() !== "" && !cohereResult.toLowerCase().startsWith("error")) {
        textoParaSentimiento = cohereResult;
    } else if (geminiResult && geminiResult.trim() !== "" && !geminiResult.toLowerCase().startsWith("error")) {
        textoParaSentimiento = geminiResult;
    }

    const sentimiento = detectarSentimiento(textoParaSentimiento);

    if (sentimiento === "positivo") {
        mensajeSentimiento.textContent = "EL COMENTARIO ES POSITIVO";
        mensajeSentimiento.style.color = "green";
    } else if (sentimiento === "negativo") {
        mensajeSentimiento.textContent = "EL COMENTARIO ES NEGATIVO";
        mensajeSentimiento.style.color = "red";
    } else {
        mensajeSentimiento.textContent = "No se detectó sentimiento positivo ni negativo.";
        mensajeSentimiento.style.color = "gray";
    }
}
