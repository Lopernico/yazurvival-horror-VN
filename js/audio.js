/**
 * AUDIO SYSTEM
 * Maneja música, efectos de sonido y voces de personajes
 */

let musicVolume = 0.6;
let sfxVolume = 0.9;
// playlist configured for the app (user-provided files)
function getBgTracks(){
  const repoBase = window.REPO_BASE || './';
  return [
    repoBase + 'assets/SILENT HILL - NOT TOMORROW [VOCAL].mp3',
    repoBase + 'assets/Silent Hill - Not Tomorrow (Long Version).mp3'
  ];
}
let bgTracks = [];
let currentMusicIndex = 0;

/**
 * Desvanece la música de fondo
 * @param {number} duration - Duración en milisegundos
 */
function fadeOutMusic(duration = 800){
  if(!el.musicAudio) return;
  const audio = el.musicAudio;
  if(audio.paused) return;
  const startVol = (typeof audio.volume === 'number') ? audio.volume : musicVolume;
  const steps = 20;
  const stepTime = Math.max(16, Math.floor(duration/steps));
  let step = 0;
  const iv = setInterval(()=>{
    step++;
    const v = Math.max(0, startVol * (1 - step/steps));
    try{ audio.volume = v; }catch(e){}
    if(step >= steps){
      clearInterval(iv);
      try{ audio.pause(); }catch(e){}
      try{ audio.volume = musicVolume; }catch(e){}
    }
  }, stepTime);
}

/**
 * Desvanece la música de entrada
 * @param {number} duration - Duración en milisegundos
 */
function fadeInMusic(duration = 800){
  if(!el.musicAudio) return;
  const audio = el.musicAudio;
  try{ audio.volume = 0; audio.play().catch(()=>{}); }catch(e){}
  const target = musicVolume;
  const steps = 20;
  const stepTime = Math.max(16, Math.floor(duration/steps));
  let step = 0;
  const iv = setInterval(()=>{
    step++;
    const v = Math.min(target, target * (step/steps));
    try{ audio.volume = v; }catch(e){}
    if(step >= steps){ clearInterval(iv); try{ audio.volume = target; }catch(e){} }
  }, stepTime);
}

/**
 * Configura los controles de audio (volumen)
 */
function wireAudioControls(){
  // only wire volume controls (audio files come from backend)
  if(el.musicVol){ 
    el.musicVol.addEventListener('input', (e)=>{ 
      musicVolume = Number(e.target.value); 
      if(el.musicAudio) el.musicAudio.volume = musicVolume; 
    }); 
    el.musicVol.value = musicVolume; 
  }
  // music select
  if(el.musicSelect){
    // restore previous selection
    try{ const saved = window.localStorage.getItem('vn_music_index'); if(saved !== null) currentMusicIndex = Number(saved); }catch(e){}
    el.musicSelect.value = String(currentMusicIndex);
    el.musicSelect.addEventListener('change', (e)=>{ setMusicTrack(Number(e.target.value)); });
  }
  if(el.sfxVol){ 
    el.sfxVol.addEventListener('input', (e)=>{ 
      sfxVolume = Number(e.target.value); 
      if(el.sfxAudio) el.sfxAudio.volume = sfxVolume; 
      if(el.endSfxAudio) el.endSfxAudio.volume = sfxVolume; 
    }); 
    el.sfxVol.value = sfxVolume; 
  }
  // set defaults
  if(el.musicAudio){ el.musicAudio.volume = musicVolume; }
  if(el.sfxAudio){ el.sfxAudio.volume = sfxVolume; }
  if(el.endSfxAudio){ el.endSfxAudio.volume = sfxVolume; }
}

/**
 * Inicializa los audios con valores por defecto
 */
function initializeDefaultAudio(){
  // Inicializar bgTracks con el base path correcto
  if(bgTracks.length === 0){
    bgTracks = getBgTracks();
  }
  // Setup playlist if no explicit music provided
  if(el.musicAudio && (!el.musicAudio.src || el.musicAudio.src === '')){
    const idx = (function(){ try{ const s = window.localStorage.getItem('vn_music_index'); return s!==null?Number(s):0; }catch(e){return 0;} })();
    currentMusicIndex = (idx >=0 && idx < bgTracks.length) ? idx : 0;
    el.musicAudio.src = bgTracks[currentMusicIndex];
    el.musicAudio.loop = true;
    el.musicAudio.volume = musicVolume;
  }
  if(el.sfxAudio && !el.sfxAudio.src){ 
    const repoBase = window.REPO_BASE || './';
    el.sfxAudio.src = repoBase + 'assets/talking.mp3'; 
    el.sfxAudio.volume = sfxVolume; 
  }
}

/**
 * Cambia la pista de música de fondo
 * @param {number} idx
 */
function setMusicTrack(idx){
  if(typeof idx !== 'number') idx = 0;
  if(idx < 0 || idx >= bgTracks.length) idx = 0;
  if(!el.musicAudio) return;
  // fade out, switch source, fade in
  try{ fadeOutMusic(300); }catch(e){}
  setTimeout(()=>{
    try{ el.musicAudio.src = bgTracks[idx]; el.musicAudio.currentTime = 0; el.musicAudio.loop = true; el.musicAudio.volume = 0; el.musicAudio.play().catch(()=>{}); fadeInMusic(500); }catch(e){}
  }, 320);
  currentMusicIndex = idx;
  try{ window.localStorage.setItem('vn_music_index', String(currentMusicIndex)); }catch(e){}
}

/**
 * Reproduce un efecto de sonido especial
 * @param {string} sfxType - Tipo de efecto (footsteps, rope, ambient, etc.)
 */
function playSFX(sfxType){
  if(!el.sfxAudio) return;
  
  const repoBase = window.REPO_BASE || './';
  const sfxMap = {
    'footsteps': repoBase + 'assets/footsteps.mp3',
    'rope': repoBase + 'assets/rope.mp3',
    'ambient': repoBase + 'assets/ambient.mp3',
    'silence': null, // no sound
    'gasp': repoBase + 'assets/gasp.mp3',
    'door': repoBase + 'assets/door.mp3'
  };
  
  const sfxPath = sfxMap[sfxType] || sfxType;
  
  if(sfxPath === null){
    // silence - stop current audio
    try{ el.sfxAudio.pause(); el.sfxAudio.currentTime = 0; }catch(e){}
    return;
  }
  
  try{
    el.sfxAudio.src = sfxPath || repoBase + 'assets/talking.mp3';
    el.sfxAudio.volume = sfxVolume;
    el.sfxAudio.currentTime = 0;
    el.sfxAudio.play().catch(()=>{});
  }catch(e){}
}

/**
 * Detiene todos los sonidos
 */
function stopAllSFX(){
  try{
    if(el.sfxAudio){ el.sfxAudio.pause(); el.sfxAudio.currentTime = 0; }
    if(el.musicAudio){ el.musicAudio.pause(); el.musicAudio.currentTime = 0; }
  }catch(e){}
}
