import { Ollama } from "@llamaindex/ollama";
import { Settings } from "llamaindex";
import readline from "readline";
import fs from "fs";
import pdfParse from "pdf-parse";

// Configura el modelo Ollama
const ollamaLLM = new Ollama({
  model: "gemma3:1b",
  temperature: 0.75,
});

Settings.llm = ollamaLLM;
Settings.embedModel = ollamaLLM;

// --- NUEVO: Cargar el PDF y extraer el texto ---
async function cargarPDF(path) {
  const dataBuffer = fs.readFileSync(path);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function main() {
  // Carga el PDF al iniciar
  const pdfText = await cargarPDF("documento.pdf");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🤖 Bot con IA (Ollama) iniciado.");
  console.log("PDF cargado como contexto para la IA.");
  console.log("Hola, Decime que queres saber de la torá:");

  rl.on("line", async (input) => {
    if (input.toLowerCase() === "salir") {
      rl.close();
      return;
    }

    try {
      // --- NUEVO: Incluir el texto del PDF como "contexto" ---
      const res = await ollamaLLM.chat({
        messages: [
          {
            role: "system",
            content: `Eres un agente virtual orientado a ayudar a responder info sobre la torá. Ten en cuenta la siguiente información del PDF como contexto:\n\n${pdfText.substring(0, 2000)}\n\n(Solo se muestra un extracto si el PDF es largo)`,
          },
          {
            role: "user",
            content: input,
          },
        ],
      });

      const respuesta = res?.message?.content || res?.message || "";
      console.log("🤖 IA:", respuesta.trim());
    } catch (err) {
      console.error("⚠️ Error al llamar al modelo:", err);
    }
    console.log("\nPreguntá otra cosa o escribí 'salir':");
  });
}

main();