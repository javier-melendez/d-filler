// Pega aquí tu JS
const templateInput = document.getElementById("template");
const pdfInput = document.getElementById("pdf");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg;
}

btn.addEventListener("click", async () => {
  const template = templateInput.files[0];
  const pdf = pdfInput.files[0];

  if (!template || !pdf) {
    setStatus("Sube la plantilla .docx y el PDF.");
    return;
  }

  setStatus("Generando...");

  const form = new FormData();
  form.append("template", template);
  form.append("pdf", pdf);

  try {
    const res = await fetch("/generate", { method: "POST", body: form });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || `Error ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resultado.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    setStatus("Listo ✅ Descargado resultado.docx");
  } catch (err) {
    setStatus(`Fallo: ${err.message}`);
  }
});
