# Cómo Probar el Juego Correctamente

## ⚠️ IMPORTANTE: Debes usar un servidor HTTP, NO puedes abrir el archivo directamente en el navegador

### Opción 1: Usar VS Code Live Server (RECOMENDADO)
1. Abre la carpeta del proyecto en VS Code
2. Busca la extensión "Live Server" (por ritwickdey)
3. Instálala
4. Click derecho en `index.html` → "Open with Live Server"
5. Se abrirá automáticamente en http://localhost:5500

### Opción 2: Usar Python (si lo instalas)
```powershell
cd 'c:\Users\Louie\Downloads\yazu14\survival novel'
python -m http.server 8000
```
Luego abre en navegador: http://localhost:8000

### Opción 3: Usar Node.js simple-http-server
```powershell
npm install -g http-server
cd 'c:\Users\Louie\Downloads\yazu14\survival novel'
http-server
```

## Limpiar Cache Después de Cambios

Tras actualizar el código, **siempre haz lo siguiente**:

1. **En Windows/Chrome:**
   - Presiona `Ctrl + Shift + Delete`
   - Marca: "Imágenes y archivos almacenados en caché"
   - Limpia

2. **O en el navegador (más rápido):**
   - Ve a la página
   - Presiona `Ctrl + F5` (hard refresh)

3. **O en DevTools:**
   - Abre DevTools con `F12`
   - Haz clic derecho en el botón "Recargar" (refresh)
   - Selecciona "Vaciar caché y descargar"

## ✅ Lo que ya está configurado

- ✅ Auto-refresh implementado: El juego detecta cambios en `dialogs/script.json` cada 3 segundos
- ✅ Efecto de luz parpadeante: REMOVIDO completamente
- ✅ Speakers vacíos: FIJOS - ya no mostrarán "Sistema" o "Narrador"
- ✅ Sprites: Solo se muestran si hay un speaker válido
- ✅ PROTAGONISTA speakers: LIMPIOS del script

## Verificar Cambios

Después de iniciar el servidor:
1. Abre la consola del navegador (`F12`)
2. Edita `dialogs/script.json`
3. En 3 segundos, la página se recargará automáticamente
4. Deberías ver los cambios

Si NO ves los cambios:
- Abre DevTools (`F12`)
- Pestaña "Network" → desactiva caché
- Luego recarga (`Ctrl + F5`)
