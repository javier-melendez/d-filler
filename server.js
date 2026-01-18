import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const upload = multer({ dest: os.tmpdir() });

// Permitir llamadas desde GitHub Pages
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => res.send("Backend activo"));

app.post("/api/convert/docx-to-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const inputPath = req.file.path;
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));

    await new Promise((resolve, reject) => {
      execFile(
        "soffice",
        ["--headless", "--convert-to", "pdf", "--outdir", outDir, inputPath],
        (err) => (err ? reject(err) : resolve())
      );
    });

    const pdfPath = path.join(
      outDir,
      path.basename(inputPath).replace(/\.\w+$/, ".pdf")
    );

    if (!fs.existsSync(pdfPath)) return res.status(500).send("PDF not generated.");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=documento.pdf");

    fs.createReadStream(pdfPath)
      .on("close", () => {
        fs.unlinkSync(inputPath);
        fs.rmSync(outDir, { recursive: true, force: true });
      })
      .pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send("Conversion error.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on " + PORT));
