@echo off
REM Script para iniciar servidor HTTP local en Windows

echo.
echo =====================================
echo   INICIANDO SERVIDOR HTTP LOCAL
echo =====================================
echo.

REM Intenta Python primero
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Python encontrado. Iniciando servidor en puerto 8000...
    echo.
    echo Abre tu navegador en: http://localhost:8000
    echo Presiona Ctrl+C para detener el servidor
    echo.
    python -m http.server 8000
    goto end
)

REM Si Python no funciona, intenta Node
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Node.js encontrado. Iniciando servidor en puerto 8000...
    echo.
    echo Abre tu navegador en: http://localhost:8000
    echo Presiona Ctrl+C para detener el servidor
    echo.
    npx http-server -p 8000
    goto end
)

REM Si ninguno funciona, mostrar alternativas
echo [!] No se encontró Python ni Node.js
echo.
echo Alternativas:
echo 1. Instala Live Server en VS Code:
echo    - Extensiones (Ctrl+Shift+X)
echo    - Busca "Live Server"
echo    - Haz clic derecho en index.html
echo    - Selecciona "Open with Live Server"
echo.
echo 2. Instala Python de python.org
echo 3. Instala Node.js de nodejs.org
echo.
pause

:end
