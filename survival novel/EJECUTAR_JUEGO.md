# ▶️ CÓMO EJECUTAR EL JUEGO

La novela no puede ejecutarse directamente desde `file://` debido a restricciones CORS del navegador. Necesitas un servidor HTTP local.

## 🚀 Opción 1: Live Server de VS Code (RECOMENDADO)

**Paso 1:** Instala la extensión "Live Server"
- Abre VS Code
- Ve a Extensiones (Ctrl+Shift+X)
- Busca "Live Server" (por Ritwick Dey)
- Haz clic en Instalar

**Paso 2:** Inicia el servidor
- Haz clic derecho en `index.html`
- Selecciona "Open with Live Server"
- Se abre automáticamente en `http://localhost:5500`

✅ El juego cargará la novela completa (187 nodos)

---

## 🔧 Opción 2: Servidor Python (Si tienes Python instalado)

Abre PowerShell en la carpeta del juego y ejecuta:

```powershell
python -m http.server 8000
```

Luego abre en navegador: `http://localhost:8000`

---

## 🟦 Opción 3: Servidor Node.js (Si tienes Node.js instalado)

Abre PowerShell en la carpeta del juego y ejecuta:

```powershell
npx http-server -p 8000
```

Luego abre en navegador: `http://localhost:8000`

---

## ✅ Verificación en el navegador

Abre la **Consola del Navegador** (F12) y busca este mensaje:

```
✓ Script cargado: scene1_open 187 nodos
```

Si ves esto, ¡el juego está listo! 🎮

---

## ⚠️ Qué NO hacer

❌ No abras el archivo directamente (`file:///...`) - causará error CORS
❌ No uses el archivo `sample.json.old` - está deprecado
✅ Usa siempre `script.json` (187 nodos completos)

---

## 🐛 Si aún hay problemas

**"Veo la novela antigua (14 de febrero)":**
- Borra caché del navegador (Ctrl+Shift+Delete)
- Recarga la página (Ctrl+R)

**"Veo el mensaje deprecado de sample.json":**
- Revisa la Consola (F12) - debe mostrar error de carga de script.json
- Asegúrate de estar accediendo por HTTP, no por file://

**"No cargó ningún script":**
- Consola debe mostrar error específico
- Verifica que la carpeta `dialogs/` contiene `script.json`

---

## 📁 Estructura esperada

```
survival novel/
├── index.html
├── app.js
├── style.css
├── js/
│   ├── game.js
│   ├── ui.js
│   ├── audio.js
│   ├── characters.js
│   ├── interactions.js
│   └── script-parser.js
└── dialogs/
    ├── script.json  ✅ NOVELA COMPLETA (187 nodos)
    ├── sample.json  ⚠️ Mensaje de deprecación
    └── sample.json.old  🔒 Backup antiguo
```

---

## 🎮 Una vez ejecutando

1. El juego debería mostrar la apertura del Capítulo 1 (ESCENA 1 – APERTURA)
2. Lee el prólogo y presiona botones para continuar
3. Toma decisiones (los botones de elección aparecerán)
4. Experimenta todas las 3 capítulos con sus ramificaciones
5. Llega a uno de los dos finales posibles

¡Que disfrutes la novela! 🎭✨
