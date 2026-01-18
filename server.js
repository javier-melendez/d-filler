import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const upload = multer({ dest: os.tmpdir() });

// CORS (para que GitHub Pages pueda llamar al backend)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => res.send("Backend activo"));

app.post("/api/convert/docx-to-pdf", upload.single("file"), async (req, res) => {
  let inputDocxPath = null;
  let outDir = null;

  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    // 1) Renombrar a .docx (LibreOffice lo necesita)
    inputDocxPath = path.join(os.tmpdir(), `${req.file.filename}.docx`);
    fs.renameSync(req.file.path, inputDocxPath);

    // 2) Carpeta de salida temporal
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));

    // 3) Convertir con LibreOffice
    await new Promise((resolve, reject) => {
      execFile(
        "soffice",
        ["--headless", "--nologo", "--nofirststartwizard", "--convert-to", "pdf", "--outdir", outDir, inputDocxPath],
        (err, stdout, stderr) => {
          if (err) {
            console.error("LibreOffice error:", err);
            console.error("stdout:", stdout);
            console.error("stderr:", stderr);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // 4) Buscar el PDF generado (no asumimos el nombre)
    const files = fs.readdirSync(outDir);
    const pdfName = files.find((f) => f.toLowerCase().endsWith(".pdf"));

    if (!pdfName) {
      return res.status(500).send("PDF not generated.");
    }

    const pdfPath = path.join(outDir, pdfName);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=documento.pdf");

    fs.createReadStream(pdfPath)
      .on("close", () => {
        // Limpieza
        try { if (inputDocxPath && fs.existsSync(inputDocxPath)) fs.unlinkSync(inputDocxPath); } catch {}
        try { if (outDir && fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
      })
      .pipe(res);

  } catch (e) {
    console.error(e);
    res.status(500).send("Conversion error.");
    // Limpieza si hubo error
    try { if (inputDocxPath && fs.existsSync(inputDocxPath)) fs.unlinkSync(inputDocxPath); } catch {}
    try { if (outDir && fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on " + PORT));
