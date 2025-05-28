const form = document.getElementById('form-ia');
const inputText = document.getElementById('input-text');
const discordBtn = document.getElementById('discord-btn');
const discordStatus = document.getElementById('discord-status');
const responseGemini = document.getElementById('response-gemini');
const responseCohere = document.getElementById('response-cohere');
const responseMistral = document.getElementById('response-mistral');

// Configuración del Webhook
const WEBHOOK_DISCORD = 'https://discord.com/api/webhooks/1377102119428952194/E7a3eGXjDlkFwNAL8USLlMdcRykh_WRYNze1VjLyddaNj5Hxzx62eVvbOwy9IvG19X8_';

// Listas de palabras clave
const palabrasNegativas = ['caro', 'odio', 'horrible', 'malo', 'terrible', 'pésimo'];
const palabrasPositivas = ['barato', 'amo', 'encanta', 'bueno', 'excelente', 'genial'];

// Funciones de detección
const esNegativo = (texto) => palabrasNegativas.some(palabra => texto.toLowerCase().includes(palabra));
const esPositivo = (texto) => palabrasPositivas.some(palabra => texto.toLowerCase().includes(palabra));

// Función para enviar a Discord
const enviarADiscord = async (mensaje) => {
    try {
        discordStatus.textContent = "Enviando...";
        discordStatus.className = "discord-status";
        
        const response = await fetch(WEBHOOK_DISCORD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: `Nuevo mensaje de usuario:\n\n"${mensaje}"`,
                username: "IA Bot",
                avatar_url: "https://i.imgur.com/7W7QznX.png"
            })
        });
        
        if (!response.ok) throw new Error('Error en la respuesta de Discord');
        
        discordStatus.textContent = "✅ Mensaje enviado a Discord correctamente";
        discordStatus.classList.add("success");
        
        // Mostrar mensaje en la consola para depuración
        console.log("Mensaje enviado a Discord:", mensaje);
    } catch (error) {
        console.error("Error al enviar a Discord:", error);
        discordStatus.textContent = "❌ Error al enviar a Discord";
        discordStatus.classList.add("error");
    }
};

// Evento para el botón de Discord
discordBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) {
        discordStatus.textContent = "⚠️ Escribe un mensaje primero";
        discordStatus.className = "discord-status";
        return;
    }
    enviarADiscord(text);
});

// Evento para el formulario de IAs
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = inputText.value.trim();
    if (!text) return;

    // Mensajes de carga
    responseGemini.textContent = 'Cargando...';
    responseCohere.textContent = 'Cargando...';
    responseMistral.textContent = 'Cargando...';

    try {
        // Procesar con las IAs (en paralelo)
        const [geminiRes, cohereRes, mistralRes] = await Promise.all([
            fetch('http://localhost:3000/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            }),
            fetch('http://localhost:3000/api/cohere', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            }),
            fetch('http://localhost:3000/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })
        ]);

        // Procesar respuestas
        const procesarRespuesta = (data) => {
            if (!data.success) return `Error: ${data.error}`;
            const texto = data.response || data.answer || '';
            return esNegativo(texto) ? "🔴 NEGATIVO" : 
                   esPositivo(texto) ? "🟢 POSITIVO" : texto;
        };

        // Actualizar UI
        responseGemini.textContent = procesarRespuesta(await geminiRes.json());
        responseCohere.textContent = procesarRespuesta(await cohereRes.json());
        responseMistral.textContent = procesarRespuesta(await mistralRes.json());

    } catch (error) {
        console.error("Error:", error);
        responseGemini.textContent = 'Error de conexión';
        responseCohere.textContent = 'Error de conexión';
        responseMistral.textContent = 'Error de conexión';
    }
});