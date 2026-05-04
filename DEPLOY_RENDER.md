# 🚀 Pasos para Desplegar en Render

## PASO 1: Preparar tu repositorio en GitHub

1. **Abre terminal en tu proyecto** (en VS Code: Ctrl+`)
2. **Inicializa Git** (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Inicial: d-filler con config Render"
   ```

3. **Sube a GitHub**:
   - Ve a https://github.com/new
   - Crea repositorio llamado `d-filler` (sin inicializar)
   - Copia los comandos que te muestra GitHub y pégalos en terminal:
     ```bash
     git remote add origin https://github.com/TU_USUARIO/d-filler.git
     git branch -M main
     git push -u origin main
     ```

---

## PASO 2: Crear cuenta en Render

1. Ve a https://render.com
2. Haz clic en **"Sign up"** (usa GitHub para más fácil)
3. Autoriza Render a acceder a tu GitHub

---

## PASO 3: Crear el servicio en Render

1. En dashboard de Render, haz clic en **"New +"** → **"Web Service"**
2. Selecciona el repositorio **`d-filler`**
3. **Rellena así**:
   - **Name**: `d-filler`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port 10000`
   
4. **Plan**: Elige **"Free"** (luego puedes cambiar)
5. Haz clic en **"Create Web Service"**

⏳ **Espera 2-5 minutos mientras construye y despliega.**

---

## PASO 4: Obtener tu URL

Cuando termine el deploy, verás una URL como:
```
https://d-filler-xxx.onrender.com
```

✅ **Tu app ya está viva!** Pruébala abriendo esa URL en el navegador.

---

## PASO 5: Hacer cambios en el futuro

Cada vez que hagas cambios:
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Render se actualiza automáticamente** (redeploy en 2-3 minutos).

---

## 🐛 Si algo falla:

- En Render, mira **"Logs"** en la pestaña (abajo a la derecha)
- Los errores más comunes:
  - ❌ "Module not found" → Falta actualizar `requirements.txt`
  - ❌ "Port already in use" → Ya lo tiene Render, no cambies el puerto
  - ❌ "Build failed" → Revisa la sintaxis de Python

---

## 📝 Resumen rápido:

| Paso | Acción |
|------|--------|
| 1 | `git init` → Sube a GitHub |
| 2 | Crea cuenta en render.com |
| 3 | Conecta tu repo de GitHub en Render |
| 4 | Espera el deploy (2-5 min) |
| 5 | ¡Disfruta tu URL pública! |
