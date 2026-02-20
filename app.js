/**
 * VISUAL NOVEL ENGINE - MAIN APPLICATION FILE
 * 
 * Arquitectura Modular:
 * - js/characters.js: Sistema de personajes
 * - js/interactions.js: Lógica de dados, monedas, input
 * - js/audio.js: Control de volúmenes y transiciones de audio
 * - js/ui.js: Actualización de UI y renderizado
 * - js/script-parser.js: Carga y parseo de guiones
 * - js/game.js: Lógica principal del juego
 * - js/sample-script.js: Ejemplo de guión
 * 
 * Este archivo es solo inicialización y gestión de eventos
 */

// DOM Element References
const el = {
  speaker: document.getElementById('speaker'),
  text: document.getElementById('text'),
  sprite: document.getElementById('sprite'),
  scene: document.getElementById('scene'),
  choices: document.getElementById('choices'),
  backBtn: document.getElementById('backBtn'),
  nextBtn: document.getElementById('nextBtn'),
  restartNowBtn: document.getElementById('restartNowBtn'),
  backToDecisionNowBtn: document.getElementById('backToDecisionNowBtn'),
  sfxAudio: document.getElementById('sfxAudio'),
  musicAudio: document.getElementById('musicAudio'),
  endSfxAudio: document.getElementById('endSfxAudio'),
  musicVol: document.getElementById('musicVol'),
  sfxVol: document.getElementById('sfxVol'),
  musicSelect: document.getElementById('musicSelect'),
  audioControls: document.getElementById('audioControls'),
  endScreen: document.getElementById('endScreen'),
  restartBtn: document.getElementById('restartBtn'),
  lastDecisionBtn: document.getElementById('lastDecisionBtn')
};

/**
 * Initialize game on page load
 */
window.addEventListener('load', () => {
  // Initialize audio defaults
  initializeDefaultAudio();
  // wire audio controls early so music selector and volumes work on title
  try{ wireAudioControls(); }catch(e){}
  
  // Background hearts animation removed - keeping structure clean
  // initializeBackgroundHearts();
  
  // Load script from server or use sample
  fetchScriptFromServer();
});

/**
 * Button event listeners
 */
el.nextBtn.onclick = next;
el.backBtn.onclick = back;
// global controls added in UI
if(el.restartNowBtn){ el.restartNowBtn.onclick = restartGame; }
if(el.backToDecisionNowBtn){ el.backToDecisionNowBtn.onclick = backToLastDecision; }
// Route D jump button
const routeDJumpBtn = document.getElementById('routeDJumpBtn');
if(routeDJumpBtn){ routeDJumpBtn.onclick = jumpToRouteD; }

/**
 * Click handlers for scene and dialogue
 */
const sceneEl = document.getElementById('scene');
const dialogueEl = document.getElementById('dialogue');
const titleEl = document.getElementById('titleScreen');

if(sceneEl) {
  sceneEl.addEventListener('click', (e) => {
    if(!gameStarted){ startGame(); return; }
    // ignore clicks on controls inside scene
    if(e.target && e.target.closest && e.target.closest('button, a, input')) return;
    if(typing) finishTyping(); else next();
  });
}

if(dialogueEl) {
  dialogueEl.addEventListener('click', (e) => {
    if(!gameStarted){ startGame(); return; }
    // ignore clicks that originate on interactive controls
    if(e.target && e.target.closest && e.target.closest('button, a, input')) return;
    if(typing) finishTyping(); else next();
  });
}

if(titleEl) {
  titleEl.addEventListener('click', startGame);
}

/**
 * Keyboard navigation
 */
window.addEventListener('keydown', (e) => {
  // Before game starts
  if(!gameStarted){
    if(['Enter',' '].includes(e.key) || e.key === 'ArrowRight'){
      e.preventDefault(); 
      startGame();
    }
    return;
  }

  // During game - let button handle Enter/Space if focused
  const active = document.activeElement;
  if((e.key === 'Enter' || e.key === ' ') && active && active.tagName === 'BUTTON') return;

  // Game navigation
  if(['Enter',' '].includes(e.key) || e.key === 'ArrowRight'){
    e.preventDefault(); 
    next();
  } else if(e.key === 'ArrowLeft'){
    e.preventDefault(); 
    back();
  }
});

/**
 * === MODULES LOADED - APPLICATION READY ===
 * All game logic is now in the modules:
 * - js/characters.js, js/interactions.js, js/audio.js
 * - js/ui.js, js/script-parser.js, js/game.js
 * - js/sample-script.js
 */
