import { Ollama } from "@llamaindex/ollama";
import { Settings, VectorStoreIndex, Document } from "llamaindex";
import readline from "readline";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⚙️ Modelo liviano y rápido (podés volver a cambiar a llama3:8b si querés más calidad)
const ollamaLLM = new Ollama({
  model: "llama3:instruct",
  temperature: 0.5,
});
Settings.llm = ollamaLLM;
Settings.embedModel = ollamaLLM;

// 📄 Cargar texto del PDF
async function cargarPDF(rutaRelativa) {
  const pdfPath = path.resolve(__dirname, rutaRelativa);
  if (!fs.existsSync(pdfPath)) {
    const archivos = fs.readdirSync(__dirname);
    throw new Error(
      `No se encontró el archivo PDF: ${pdfPath}\nArchivos disponibles: ${archivos.join(", ")}`
    );
  }
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function main() {
  try {
    console.log("📚 Cargando Torá desde PDF...");
    const textoPDF = await cargarPDF("tora.pdf");

    console.log("🔍 Indexando contexto... esto tarda unos segundos ⏳");
    const documentos = [new Document({ text: textoPDF })];
    const index = await VectorStoreIndex.fromDocuments(documentos);
    const queryEngine = index.asQueryEngine();
    console.log("✅ ¡Listo! Preguntá lo que quieras sobre la Torá.");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.on("line", async (input) => {
      if (input.toLowerCase() === "salir") {
        rl.close();
        return;
      }
      try {
        const inicio = Date.now();
        const res = await queryEngine.query(input);
        const fin = Date.now();
        console.log("🤖 IA:", res.response.trim());
        console.log(`⏱️ Tiempo de respuesta: ${(fin - inicio) / 1000}s`);
      } catch (err) {
        console.error("⚠️ Error al responder:", err);
      }
      console.log("\nPreguntá otra cosa o escribí 'salir':");
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main();
