import { Ollama } from "@llamaindex/ollama";
import { Settings } from "llamaindex";
import readline from "readline";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ollamaLLM = new Ollama({
  model: "gemma3:1b",
  temperature: 0.75,
});

Settings.llm = ollamaLLM;
Settings.embedModel = ollamaLLM;

async function cargarPDF(rutaRelativa) {
  const pdfPath = path.resolve(__dirname, rutaRelativa);
  if (!fs.existsSync(pdfPath)) {
    // Muestra TODOS los archivos en la carpeta del script
    const archivos = fs.readdirSync(__dirname);
    throw new Error(
      `No se encontró el archivo PDF en: ${pdfPath}\nArchivos en la carpeta actual: ${archivos.join(", ")}`
    );
  }
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function main() {
  try {
    // SOLO tora.pdf, nada más
    const pdfText = await cargarPDF("tora.pdf");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("🤖 Bot con IA (Ollama) iniciado.");
    console.log("PDF cargado como contexto para la IA.");
    console.log("Hola, Decime que queres saber de la torá:");

    rl.on("line", async (input) => {
      if (input.toLowerCase() === "salir") {
        rl.close();
        return;
      }
      try {
        const res = await ollamaLLM.chat({
          messages: [
            {
              role: "system",
              content: `Eres un agente virtual orientado a responder info sobre la torá y su contenido. Ten en cuenta la siguiente información del PDF como contexto e informacióna usar:\n\n${pdfText}\n\n`,
            },
            { role: "user", content: input },
          ],
        });
        const respuesta = res?.message?.content || res?.message || "";
        console.log("🤖 IA:", respuesta.trim());
      } catch (err) {
        console.error("⚠️ Error al llamar al modelo:", err);
      }
      console.log("\nPreguntá otra cosa o escribí 'salir':");
    });
  } catch (err) {
    console.error("⚠️ Error al cargar el PDF:", err.message);
  }
}

main();