/**
 * UI SYSTEM
 * Maneja la actualización de elementos visuales y renderizado de nodos
 */

let typing = false;
let typingTimer = null;
let mouthInterval = null; // will store rAF id when active
let mouthOpen = false;
let openSpriteSrc = '';
let closedSpriteSrc = '';
let typingCompleteCallback = null;

/**
 * Encode UTF-8 string to Base64 (handles special characters)
 */
function _encodeUTF8toBase64(str){
  try{
    return btoa(unescape(encodeURIComponent(str)));
  }catch(e){
    try{
      return btoa(str);
    }catch(e){
      return '';
    }
  }
}

// Lightweight sprite preload cache to avoid repeated decoding during toggles
const _spritePreloadCache = {};
function _preloadSprite(src){
  if(!src) return;
  if(_spritePreloadCache[src]) return;
  try{
    const img = new Image(); img.src = src;
    // attempt modern decode to warm up renderer
    if(img.decode) img.decode().catch(()=>{});
    _spritePreloadCache[src] = true;
  }catch(e){}
}

function _stopMouthLoop(){
  try{
    if(mouthInterval){ cancelAnimationFrame(mouthInterval); mouthInterval = null; }
  }catch(e){ try{ clearInterval(mouthInterval); }catch(e){} mouthInterval = null; }
}

/**
 * Establece el sprite (imagen del personaje)
 * @param {string} name - Nombre del sprite
 */
function setSprite(name){
  if(!name){ el.sprite.style.opacity = '0'; el.sprite.src = ''; return; }
  // prefer PNG assets first, then SVG fallback
  el.sprite.style.opacity = '0';
  el.sprite.onload = () => { el.sprite.style.opacity = '1'; el.sprite.onerror = null; };
  el.sprite.onerror = () => {
    try{
      const src = el.sprite.src || '';
      if(src.endsWith('.png')){ el.sprite.onerror = null; el.sprite.src = `assets/${name}.svg`; }
      else { el.sprite.style.opacity = '0'; el.sprite.onerror = null; }
    }catch(e){ el.sprite.style.opacity = '0'; el.sprite.onerror = null; }
  };
  if(name.includes('.')){ el.sprite.src = `assets/${name}`; }
  else { el.sprite.src = `assets/${name}.png`; }
}

/**
 * Limpia el estado de escritura
 */
function clearTyping(){
  if(typingTimer) clearTimeout(typingTimer);
  typing = false;
}

/**
 * Escribe texto con efecto de mecanografía
 * @param {HTMLElement} targetEl - Elemento donde escribir
 * @param {string} text - Texto a escribir
 * @param {number} speed - Velocidad en ms
 * @param {Function} onComplete - Callback al completar
 * @param {string} characterId - ID del personaje (para voz)
 */
function typeText(targetEl, text, speed = 18, onComplete, characterId, opts = {}){
  clearTyping();
  // ensure any previous mouth interval / sfx is stopped
  if(mouthInterval) _stopMouthLoop();
  mouthOpen = false;
  targetEl.innerHTML = '';
  targetEl.style.opacity = '1';  // Ensure full opacity
  targetEl.style.filter = '';     // Remove any filters
  typing = true;
  typingCompleteCallback = typeof onComplete === 'function' ? onComplete : null;
  let i = 0;
  const suppressVoice = opts && opts.suppressVoice;

  // get voice for this character (unless suppressed)
  const voiceSrc = !suppressVoice && characterId ? getCharacterVoice(characterId) : (!suppressVoice && el.sfxAudio ? el.sfxAudio.src : null);

  // start continuous talking SFX (loop) for the duration of typing (only when not suppressed)
  if(!suppressVoice && el.sfxAudio && voiceSrc){
    try{ el.sfxAudio.src = voiceSrc; el.sfxAudio.loop = true; el.sfxAudio.currentTime = 0; el.sfxAudio.volume = sfxVolume; el.sfxAudio.play().catch(()=>{}); }catch(e){}
  }

  // mouth toggle loop using requestAnimationFrame (throttled) to reduce timer overhead
  if(!suppressVoice){
    // warm up images
    try{ _preloadSprite(openSpriteSrc); _preloadSprite(closedSpriteSrc); }catch(e){}
    const toggleMs = 400; // lower frequency -> less repaint pressure
    let lastToggle = performance.now();
    const loop = (now) => {
      if(!mouthInterval) return; // stopped
      if(now - lastToggle >= toggleMs){
        mouthOpen = !mouthOpen;
        const targetSrc = mouthOpen ? openSpriteSrc : closedSpriteSrc;
        try{
          if(targetSrc && (!el.sprite.src || el.sprite.src.indexOf(targetSrc) === -1)) el.sprite.src = targetSrc;
        }catch(e){}
        lastToggle = now;
      }
      mouthInterval = requestAnimationFrame(loop);
    };
    mouthInterval = requestAnimationFrame(loop);
  } else {
    mouthInterval = null;
  }

  (function step(){
    if(i >= text.length){
      typing = false;
      // stop mouth and talking SFX
      _stopMouthLoop();
      if(closedSpriteSrc) el.sprite.src = closedSpriteSrc;
      try{ if(el.sfxAudio){ el.sfxAudio.loop = false; el.sfxAudio.pause(); el.sfxAudio.currentTime = 0; } }catch(e){}
      if(typingCompleteCallback){ try{ typingCompleteCallback(); }catch(e){} typingCompleteCallback = null; }
      return;
    }
    targetEl.innerHTML += text[i++];
    typingTimer = setTimeout(step, speed);
  })();
}

/**
 * Termina la escritura instantáneamente
 */
function finishTyping(){
  if(!typing) return;
  clearTyping();
  el.text.innerHTML = (nodeMap[currentId] && nodeMap[currentId].text) || '';
  // stop mouth animation and set closed mouth
  if(mouthInterval) { _stopMouthLoop(); }
  mouthOpen = false;
  if(closedSpriteSrc) el.sprite.src = closedSpriteSrc;
  // stop talking SFX if active
  try{ if(el.sfxAudio){ el.sfxAudio.loop = false; el.sfxAudio.pause(); el.sfxAudio.currentTime = 0; } }catch(e){}
  if(typingCompleteCallback){ try{ typingCompleteCallback(); }catch(e){} typingCompleteCallback = null; }
}

/**
 * Inicializa la animación del fondo con corazones
 */
function initializeBackgroundHearts(){
  const heartEmojis = ['💗', '💜']; // pink and purple only
  const tracks = document.querySelectorAll('.hearts-track');
  
  tracks.forEach(track => {
    // create multiple rows of hearts for full screen coverage
    const numRows = Math.ceil(window.innerHeight / 60) + 3; // 60px per row
    let html = '';
    
    for(let row = 0; row < numRows; row++){
      // each row gets a wrapper for individual animation
      html += `<div class="heart-row" style="animation-delay: ${row * 0.6}s;">`;
      
      // create enough hearts per row to fill screen width + extra for seamless loop
      const heartsPerRow = Math.ceil(window.innerWidth / 50) + 4; // 50px per heart
      for(let i = 0; i < heartsPerRow * 2; i++){ // 2x for seamless loop
        html += `<span>${heartEmojis[i % 2]}</span>`;
      }
      
      html += `</div>`;
    }
    
    track.innerHTML = html;
  });
}

/**
 * Muestra la pantalla final (celebración)
 */
function spawnFinalBurst(parentEl, confettiCount = 20, heartCount = 6){
  const parent = parentEl || document.getElementById('finalBanner') || document.body;
  const colors = ['#FF6B6B','#FF9AD6','#FFB86B','#FFD56B','#B08CFF','#7DD3FC','#FF8AA1'];
  const pieces = [];

  for(let i=0;i<confettiCount;i++){
    const d = 800 + Math.floor(Math.random()*900); // ms
    const tx = (Math.random() * (Math.random() > 0.5 ? 1 : -1)) * (80 + Math.random()*220);
    const ty = - (120 + Math.random()*260); // move mostly upward
    const rot = Math.floor(Math.random()*720) + 'deg';
    const w = 6 + Math.floor(Math.random()*10);
    const h = 10 + Math.floor(Math.random()*14);
    const elp = document.createElement('div');
    elp.className = 'confetti-piece';
    elp.style.width = w + 'px';
    elp.style.height = h + 'px';
    elp.style.background = colors[Math.floor(Math.random()*colors.length)];
    elp.style.left = '50%';
    elp.style.top = '35%';
    elp.style.setProperty('--tx', tx + 'px');
    elp.style.setProperty('--ty', ty + 'px');
    elp.style.setProperty('--rot', rot);
    elp.style.setProperty('--d', d + 'ms');
    // slightly stagger start
    elp.style.animationDelay = (Math.floor(Math.random()*220)) + 'ms';
    parent.appendChild(elp);
    pieces.push({el: elp, t: d + 600});
  }

  for(let j=0;j<heartCount;j++){
    const d = 900 + Math.floor(Math.random()*900);
    const tx = (Math.random() * (Math.random() > 0.5 ? 1 : -1)) * (40 + Math.random()*120);
    const ty = - (160 + Math.random()*160);
    const rot = (Math.random()>0.5?1:-1) * (10 + Math.floor(Math.random()*60)) + 'deg';
    const he = document.createElement('div');
    he.className = 'burst-heart';
    he.textContent = ['💜','💖','💗','💘'][Math.floor(Math.random()*4)];
    he.style.left = (50 + (Math.random()*12-6)) + '%';
    he.style.top = (32 + (Math.random()*10-5)) + '%';
    he.style.setProperty('--tx', tx + 'px');
    he.style.setProperty('--ty', ty + 'px');
    he.style.setProperty('--rot', rot);
    he.style.setProperty('--d', d + 'ms');
    he.style.animationDelay = (Math.floor(Math.random()*180)) + 'ms';
    parent.appendChild(he);
    pieces.push({el: he, t: d + 700});
  }

  // cleanup
  pieces.forEach(p => setTimeout(()=>{ try{ p.el.remove(); }catch(e){} }, p.t));
}

/**
 * EFECTOS ESPECIALES PARA EL NUEVO GUIÓN
 */

/**
 * Fade-in irregular con parpadeo asincrónico
 * @param {number} duration - Duración total en ms
 * @param {Object} options - Opciones del efecto
 */
function irregularFadeInWithFlicker(duration = 3000, options = {}){
  // Light effect removed - simple fade in only
  const startTime = Date.now();
  const app = document.querySelector('.app');
  if(!app) return;
  
  app.style.opacity = '0';
  
  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    app.style.opacity = progress;
    
    if(progress < 1) {
      requestAnimationFrame(step);
    } else {
      app.style.opacity = '1';
    }
  };
  
  requestAnimationFrame(step);
}

/**
 * Pausa de micro-pausas
 * @param {number} duration - Duración en ms
 * @param {Function} onComplete - Callback al completar
 */
function microPause(duration = 400, onComplete){
  setTimeout(() => {
    if(typeof onComplete === 'function') {
      onComplete();
    }
  }, duration);
}

/**
 * Mostrar flashback con opacidad reducida
 * @param {HTMLElement} targetEl - Elemento donde mostrar el flashback
 * @param {string} text - Texto del flashback
 * @param {number} opacity - Opacidad (0-1)
 * @param {Function} onComplete - Callback
 */
function showFlashback(targetEl, text, opacity = 1.0, onComplete, effects = {}){
  // Apply a distinct visual style so flashbacks read different from internal thought
  targetEl.innerHTML = text;
  targetEl.style.opacity = String(opacity);
  // Slight desaturation + subtle glow to indicate memory
  targetEl.style.filter = effects.filter || 'grayscale(0.25) contrast(1.05)';
  targetEl.style.fontStyle = effects.fontStyle || 'italic';
  targetEl.style.color = effects.color || '#dfe9ff';
  targetEl.style.textShadow = effects.textShadow || '0 0 8px rgba(160,160,255,0.45)';
  if(effects.fontSize === 'large') targetEl.style.fontSize = '22px';

  if(effects.cameraShake){ cameraShake(effects.cameraShake.intensity || 5, effects.cameraShake.duration || 500); }
  if(effects.cameraWobble){ cameraWobble(effects.cameraWobble.intensity || 6, effects.cameraWobble.duration || 800); }

  if(typeof onComplete === 'function') {
    setTimeout(onComplete, effects.onCompleteDelay || 1000);
  }
}

/**
 * Fade-in desde la izquierda
 * @param {HTMLElement} element - Elemento a animar
 * @param {number} duration - Duración en ms
 */
function fadeInFromLeft(element, duration = 2000){
  const startTime = Date.now();
  element.style.opacity = '0';
  element.style.transform = 'translateX(-100px)';
  element.style.transition = `all ${duration}ms ease-out`;
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateX(0)';
  }, 10);
}

/**
 * Camera shake (temblor de pantalla) - OPTIMIZADO
 * @param {number} intensity - Intensidad del temblor
 * @param {number} duration - Duración en ms
 */
function cameraShake(intensity = 5, duration = 500){
  const app = document.querySelector('.app');
  if(!app) return;
  
  const startTime = Date.now();
  const frameTime = 1000 / 60;  // ~16.67ms (60fps)
  let lastFrameTime = 0;
  
  const shake = () => {
    const elapsed = Date.now() - startTime;
    const now = Date.now();
    
    // Solo ejecutar si ha pasado suficiente tiempo desde el último frame
    if(now - lastFrameTime < frameTime) {
      requestAnimationFrame(shake);
      return;
    }
    lastFrameTime = now;
    
    if(elapsed > duration) {
      app.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    
    const x = (Math.random() - 0.5) * intensity * 2;
    const y = (Math.random() - 0.5) * intensity * 2;
    app.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    
    requestAnimationFrame(shake);
  };
  
  shake();
}

/**
 * Camera wobble: smooth oscillating wobble (rotation + slight translate) - OPTIMIZADO
 * @param {number} intensity - Pixel/deg intensity
 * @param {number} duration - Duration in ms
 */
function cameraWobble(intensity = 6, duration = 800){
  const app = document.querySelector('.app');
  if(!app) return;
  const start = Date.now();
  const freq = 0.006; // wobble frequency
  const frameTime = 1000 / 60;
  let lastFrameTime = 0;

  const wobble = () => {
    const elapsed = Date.now() - start;
    const now = Date.now();
    
    // Throttle a 60fps
    if(now - lastFrameTime < frameTime) {
      requestAnimationFrame(wobble);
      return;
    }
    lastFrameTime = now;
    
    if(elapsed > duration) {
      app.style.transform = 'translate3d(0,0,0) rotate(0deg)';
      return;
    }
    const t = elapsed;
    const x = Math.sin(t * freq * 2 * Math.PI) * intensity * 0.6;
    const y = Math.cos(t * freq * 2 * Math.PI) * intensity * 0.4;
    const rot = Math.sin(t * freq * 2 * Math.PI * 0.6) * (intensity * 0.12);
    app.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
    requestAnimationFrame(wobble);
  };

  wobble();
}

/**
 * Camera zoom (acercarse paulatinamente) - OPTIMIZADO
 * @param {number} zoomPercent - Porcentaje de zoom (2 = +2%)
 * @param {number} duration - Duración en ms
 */
function cameraZoom(zoomPercent = 2, duration = 2000){
  const app = document.querySelector('.app');
  if(!app) return;
  
  const startTime = Date.now();
  const startScale = 1;
  const endScale = 1 + (zoomPercent / 100);
  const frameTime = 1000 / 60;
  let lastFrameTime = 0;
  
  const zoom = () => {
    const elapsed = Date.now() - startTime;
    const now = Date.now();
    
    // Throttle a 60fps
    if(now - lastFrameTime < frameTime) {
      requestAnimationFrame(zoom);
      return;
    }
    lastFrameTime = now;
    
    const progress = Math.min(elapsed / duration, 1);
    
    const scale = startScale + (endScale - startScale) * progress;
    app.style.transform = `scale3d(${scale}, ${scale}, 1)`;
    
    if(progress < 1) {
      requestAnimationFrame(zoom);
    }
  };
  
  zoom();
}

/**
 * Fade to black
 * @param {number} duration - Duración en ms
 * @param {Function} onComplete - Callback
 */
function fadeToBlack(duration = 2000, onComplete){
  const app = document.querySelector('.app');
  if(!app) return;
  
  const startTime = Date.now();
  
  const fade = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    app.style.opacity = 1 - progress;
    
    if(progress < 1) {
      requestAnimationFrame(fade);
    } else {
      app.style.opacity = '0';
      if(typeof onComplete === 'function') {
        onComplete();
      }
    }
  };
  
  fade();
}

/**
 * Fade to black, hold, then fade in (simulates blinking/eyes closing and opening) - OPTIMIZADO
 * @param {number} duration - Total fade duration in ms (not including hold)
 * @param {number} holdBlack - Time to hold black in ms
 * @param {Function} onComplete - Callback when done
 */
function fadeToBlackFadeIn(duration = 1000, holdBlack = 300, onComplete){
  const app = document.querySelector('.app');
  if(!app) return;

  const frameTime = 1000 / 60;
  let lastFrameTime = 0;

  // Phase 1: fade out
  const fadeOutStart = Date.now();
  const fadeOut = () => {
    const elapsed = Date.now() - fadeOutStart;
    const now = Date.now();
    
    if(now - lastFrameTime < frameTime) {
      requestAnimationFrame(fadeOut);
      return;
    }
    lastFrameTime = now;
    
    const progress = Math.min(elapsed / duration, 1);
    app.style.opacity = 1 - progress;
    if(progress < 1) {
      requestAnimationFrame(fadeOut);
    } else {
      app.style.opacity = '0';
      // Phase 2: hold black
      setTimeout(() => {
        // Phase 3: fade in
        const fadeInStart = Date.now();
        let lastFrameTime2 = 0;
        const fadeIn = () => {
          const elapsed = Date.now() - fadeInStart;
          const now = Date.now();
          
          if(now - lastFrameTime2 < frameTime) {
            requestAnimationFrame(fadeIn);
            return;
          }
          lastFrameTime2 = now;
          
          const progress = Math.min(elapsed / duration, 1);
          app.style.opacity = progress;
          if(progress < 1) {
            requestAnimationFrame(fadeIn);
          } else {
            app.style.opacity = '1';
            if(typeof onComplete === 'function') onComplete();
          }
        };
        fadeIn();
      }, holdBlack);
    }
  };
  fadeOut();
}

/**
 * Smooth sprite zoom (slow approach towards camera) - OPTIMIZADO
 * @param {number} scale - Target scale (1.08 = 8% zoom)
 * @param {number} duration - Duration in ms
 */
function spriteZoom(scale = 1.08, duration = 800){
  const sprite = document.querySelector('.sprite');
  if(!sprite) return;
  
  const startScale = 1;
  const startTime = Date.now();
  const frameTime = 1000 / 60;
  let lastFrameTime = 0;
  
  const zoom = () => {
    const elapsed = Date.now() - startTime;
    const now = Date.now();
    
    // Throttle a 60fps
    if(now - lastFrameTime < frameTime) {
      requestAnimationFrame(zoom);
      return;
    }
    lastFrameTime = now;
    
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out for smoother feel
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentScale = startScale + (scale - startScale) * easeProgress;
    
    sprite.style.transform = `scale3d(${currentScale}, ${currentScale}, 1)`;
    
    if(progress < 1) {
      requestAnimationFrame(zoom);
    } else {
      sprite.style.transform = `scale3d(${scale}, ${scale}, 1)`;
    }
  };
  
  zoom();
}

/**
 * Screen to pure black (no transition)
 */
function screenToBlack(){
  const app = document.querySelector('.app');
  if(app) {
    app.style.backgroundColor = '#000000';
    app.style.opacity = '1';
  }
}

/**
 * Voice progression (pequeño → normal → mayúsculas)
 * @param {HTMLElement} targetEl - Elemento donde mostrar
 * @param {Array<string>} texts - Array de textos [pequeño, normal, grande]
 * @param {Function} onComplete - Callback
 */
function voiceProgression(targetEl, texts = [], onComplete){
  if(!Array.isArray(texts) || texts.length === 0) {
    if(typeof onComplete === 'function') onComplete();
    return;
  }
  
  let index = 0;
  const sizes = ['14px', '18px', '24px'];
  
  const showNext = () => {
    if(index >= texts.length) {
      if(typeof onComplete === 'function') onComplete();
      return;
    }
    
    targetEl.innerHTML = texts[index];
    targetEl.style.fontSize = sizes[Math.min(index, sizes.length - 1)];
    
    index++;
    setTimeout(showNext, 600);
  };
  
  showNext();
}

/**
 * Silencio absoluto (mute audio)
 * @param {number} duration - Duración en ms
 */
function absoluteSilence(duration = 1000){
  if(el.sfxAudio) {
    const originalVolume = el.sfxAudio.volume;
    el.sfxAudio.volume = 0;
    setTimeout(() => {
      el.sfxAudio.volume = originalVolume;
    }, duration);
  }
}

/**
 * Auto-refresh cuando el script cambia en el backend
 */
let lastScriptHash = null;

function initScriptMonitoring(){
  // Do initial check to skip first reload
  fetch(`./dialogs/script.json?t=${Date.now()}`)
    .then(r => r.text())
    .then(txt => {
      lastScriptHash = _encodeUTF8toBase64(txt); // base64 encode as simple hash
      startScriptMonitoring();
    })
    .catch(e => console.log('Script monitoring start:', e));
}

function startScriptMonitoring(){
  setInterval(() => {
    fetch(`./dialogs/script.json?t=${Date.now()}`)
      .then(r => r.text())
      .then(txt => {
        const newHash = _encodeUTF8toBase64(txt);
        if(lastScriptHash && newHash !== lastScriptHash){
          console.log('Script changed, reloading...');
          window.location.reload();
        }
        lastScriptHash = newHash;
      })
      .catch(e => console.log('Script check error:', e));
  }, 3000); // Check every 3 seconds
}

// Start monitoring when DOM is ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initScriptMonitoring);
} else {
  initScriptMonitoring();
}
