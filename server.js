import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const upload = multer({ dest: os.tmpdir() });

// CORS (para GitHub Pages)
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

    // 1) Guardar con extensión .docx (clave para LO)
    inputDocxPath = path.join(os.tmpdir(), `${req.file.filename}.docx`);
    fs.renameSync(req.file.path, inputDocxPath);

    // 2) Carpeta salida
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));

    console.log("=== CONVERT START ===");
    console.log("Input:", inputDocxPath);
    console.log("OutDir:", outDir);

    // 3) Ejecutar LibreOffice con HOME en /tmp y un perfil temporal
    const loProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), "lo-profile-"));
    const loEnv = { ...process.env, HOME: os.tmpdir() };

    const args = [
      "--headless",
      "--nologo",
      "--nofirststartwizard",
      `-env:UserInstallation=file://${loProfileDir}`,
      "--convert-to",
      "pdf:writer_pdf_Export",
      "--outdir",
      outDir,
      inputDocxPath
    ];

    const { stdout, stderr } = await new Promise((resolve, reject) => {
      execFile("soffice", args, { env: loEnv }, (err, stdout, stderr) => {
        if (err) return reject({ err, stdout, stderr });
        resolve({ stdout, stderr });
      });
    });

    console.log("LibreOffice stdout:", stdout);
    console.log("LibreOffice stderr:", stderr);

    // 4) Ver qué dejó LO en la carpeta
    const outFiles = fs.readdirSync(outDir);
    console.log("OutDir files:", outFiles);

    const pdfName = outFiles.find((f) => f.toLowerCase().endsWith(".pdf"));
    if (!pdfName) {
      return res.status(500).send("PDF not generated.");
    }

    const pdfPath = path.join(outDir, pdfName);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=documento.pdf");

    fs.createReadStream(pdfPath)
      .on("close", () => {
        // limpieza
        try { if (inputDocxPath && fs.existsSync(inputDocxPath)) fs.unlinkSync(inputDocxPath); } catch {}
        try { if (outDir && fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
        try { if (loProfileDir && fs.existsSync(loProfileDir)) fs.rmSync(loProfileDir, { recursive: true, force: true }); } catch {}
      })
      .pipe(res);

  } catch (e) {
    // Si fue error de LO, e tiene {err, stdout, stderr}
    console.error("=== CONVERT ERROR ===");
    console.error(e?.err || e);
    if (e?.stdout) console.error("stdout:", e.stdout);
    if (e?.stderr) console.error("stderr:", e.stderr);

    res.status(500).send("Conversion error.");

    // limpieza
    try { if (inputDocxPath && fs.existsSync(inputDocxPath)) fs.unlinkSync(inputDocxPath); } catch {}
    try { if (outDir && fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on " + PORT));
