/**
 * SCRIPT PARSER & LOADER
 * Carga y parsea guiones desde servidor o usa ejemplo local
 */

let script = null;
let nodeMap = {};

/**
 * Construye un mapa de nodos para búsqueda rápida
 * @param {Array} nodes - Array de nodos
 */
function buildMap(nodes){
  nodeMap = {};
  (nodes || []).forEach(n => { if(n.id) nodeMap[n.id] = n; });
}

/**
 * Carga un guión y lo inicia inmediatamente
 * @param {Object} obj - Objeto de guión
 */
function loadScript(obj){
  if(!obj || !Array.isArray(obj.nodes)) { alert('Guion inválido — se requiere un array "nodes"'); return; }
  script = obj;
  buildMap(script.nodes);
  const startId = script.start || (script.nodes[0] && script.nodes[0].id);
  historyStack = [];
  renderNode(startId);
}

/**
 * Prepara un guión para ser usado (sin iniciarlo)
 * @param {Object} obj - Objeto de guión
 */
function prepareScript(obj){
  // guarda y construye el mapa pero NO inicia la reproducción; la iniciará startGame()
  if(!obj || !Array.isArray(obj.nodes)) { console.warn('Guion inválido en prepareScript'); return; }
  script = obj; buildMap(script.nodes);
  // si el backend provee URLs de audio en window.SCRIPT.audio, úsalas (music/sfx/endSfx)
  try{
    if(obj.audio){
      if(obj.audio.music && el.musicAudio) el.musicAudio.src = obj.audio.music;
      if(obj.audio.sfx && el.sfxAudio) el.sfxAudio.src = obj.audio.sfx;
      if(obj.audio.endSfx && el.endSfxAudio) el.endSfxAudio.src = obj.audio.endSfx;
    }
  }catch(e){/* noop */}
}

/**
 * Carga el guión desde el servidor con fallback
 */
async function fetchScriptFromServer(){
  // prioriza window.SCRIPT si fue inyectado por el backend
  if(window.SCRIPT && typeof window.SCRIPT === 'object'){ prepareScript(window.SCRIPT); return; }
  try{
    const res = await fetch('/dialogs/script.json', {cache:'no-store'});
    if(res.ok){ const script = await res.json(); console.log('✓ Script cargado:', script.start, script.nodes.length + ' nodos'); prepareScript(script); return; }
  } catch(e){
    console.error('Error cargando script.json:', e);
  }
  // Fallback: usa sampleScript embebido si falla la carga
  console.warn('Usando guión de ejemplo embebido (fallback)');
  prepareScript(sampleScript);
}
