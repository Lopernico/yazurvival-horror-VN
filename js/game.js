/**
 * GAME LOGIC
 * Lógica principal del juego: renderizado de nodos, navegación, interacciones
 */

let currentId = null;
let historyStack = [];
let gameStarted = false;
let endPending = false;
let currentSpriteName = '';

/**
 * Verifica si hay un nodo siguiente en el array
 * @param {string} id - ID del nodo actual
 * @returns {boolean}
 */
function hasNextNode(id){
  // find index in original array
  if(!script || !Array.isArray(script.nodes)) return false;
  const nodes = script.nodes;
  const idx = nodes.findIndex(n=>n.id===id);
  return idx >= 0 && idx < nodes.length-1;
}

/**
 * Navega a un nodo específico
 * @param {string} nextId - ID del nodo destino
 */
function goTo(nextId){
  if(!nextId){ return endScene(); }
  if(!nodeMap[nextId]){ alert('El id destino no existe: '+nextId); return; }
  renderNode(nextId);
}

/**
 * Renderiza un nodo (diálogo, dado, moneda, input, thought, narration, flashback, pause, etc.)
 * @param {string} id - ID del nodo a renderizar
 */
function renderNode(id){
  const node = nodeMap[id];
  if(!node){ return endScene(); }
  currentId = id;
  // persist last seen node and history so we can resume later
  try{ window.localStorage.setItem('vn_last_node', String(currentId)); }catch(e){}
  try{ window.localStorage.setItem('vn_history', JSON.stringify(historyStack || [])); }catch(e){}
  
  // Reset text styling - remove any opacity filters
  el.text.style.opacity = '1';
  el.text.style.filter = '';
  el.text.style.textDecoration = '';
  el.text.style.fontSize = '';
  el.text.style.fontStyle = '';
  el.text.style.textShadow = '';
  
  const nodeType = node.type || 'dialog'; // default: dialog
  
  // Generic effects for non-flashback/non-thought nodes (so dialog/narration can declare effects)
  if(nodeType !== 'thought' && nodeType !== 'flashback'){
    if(node.effects?.fontSize){
      if(node.effects.fontSize === 'large') el.text.style.fontSize = '22px';
      if(node.effects.fontSize === 'small') el.text.style.fontSize = '13px';
    }
    if(node.effects?.fadeToBlackFadeIn){
      const fbf = node.effects.fadeToBlackFadeIn;
      fadeToBlackFadeIn(fbf.duration || 1000, fbf.holdBlack || 300);
    }
    if(node.effects?.spriteZoom){
      const sz = node.effects.spriteZoom;
      spriteZoom(sz.scale || 1.08, sz.duration || 800);
    }
    if(node.effects?.cameraShake){
      const cs = node.effects.cameraShake;
      if(typeof cs === 'object') cameraShake(cs.intensity || 5, cs.duration || 500);
      else cameraShake(5, 500);
    }
    if(node.effects?.cameraWobble){
      const cw = node.effects.cameraWobble;
      if(typeof cw === 'object') cameraWobble(cw.intensity || 6, cw.duration || 800);
      else cameraWobble(6, 800);
    }
    if(node.effects?.cameraZoom){
      const cz = node.effects.cameraZoom;
      if(typeof cz === 'object') cameraZoom((cz.amount || cz.percent || 2), cz.duration || 2000);
      else cameraZoom(cz, 2000);
    }
  }

  // Handle special node types FIRST
  if(nodeType === 'pause'){
    // Pausa: solo mostrar texto si existe, luego permitir click para continuar
    if(node.text){
      el.text.textContent = node.text;
    } else {
      el.text.textContent = '';
    }
    el.speaker.textContent = ''; // Clear speaker for pauses
    el.nextBtn.disabled = false;
    el.choices.innerHTML = '';
    return;
  }
  
  if(nodeType === 'narration' && node.effects && node.effects.fadeIn && node.effects.fadeIn.irregular){
    // Efecto de fade-in irregular con parpadeo
    irregularFadeInWithFlicker(node.effects.fadeIn.duration || 3000, {
      minInterval: node.effects.parpadeo?.minInterval || 200,
      maxInterval: node.effects.parpadeo?.maxInterval || 600
    });
    el.text.textContent = '';
    el.nextBtn.disabled = false;
    return;
  }
  
  // Ejecutar SFX si se especifica
  if(node.effects?.sfx){
    playSFX(node.effects.sfx);
  }
  
  // Setup speaker name
  const characterId = node.speaker;
  el.speaker.textContent = node.displayName || node.speaker || '';
  
  // Sprite handling: allow node-level `sprite` override which shows a static sprite
  currentSpriteName = characterId;
  if(node.sprite){
    const spritePath = node.sprite.includes('/') ? node.sprite : `assets/${node.sprite}`;
    try{ el.sprite.src = spritePath; el.sprite.style.opacity = '1'; }catch(e){}
    openSpriteSrc = spritePath;
    closedSpriteSrc = spritePath;
    // mark to suppress voice/mouth animation for this node
    node._suppressVoice = true;
    currentSpriteName = '';
  } else if(characterId){
    const variants = getSpriteVariants(currentSpriteName);
    openSpriteSrc = variants[0];
    closedSpriteSrc = variants[1] || variants[0];
    try{ if(closedSpriteSrc || openSpriteSrc){ el.sprite.src = closedSpriteSrc || openSpriteSrc; el.sprite.style.opacity = '1'; } }catch(e){}
  } else {
    // No speaker = no sprite
    el.sprite.src = '';
    el.sprite.style.opacity = '0';
  }

  // Whether to suppress voice/mouth animation for subsequent typing calls
  const suppressVoice = Boolean(node._suppressVoice || node.effects?.noVoice);
  
  // Clear choices initially
  el.choices.innerHTML = '';
  
  // Handle different node types
  if(nodeType === 'dice'){
    // Nodo de dado
    el.text.textContent = node.text || 'Lanzando dado...';
    showDiceRoll(node, node.dice || 'd6');
    el.nextBtn.disabled = true;
  } 
  else if(nodeType === 'coin'){
    // Nodo de moneda
    el.text.textContent = node.text || 'Lanzando moneda...';
    showCoinFlip(node);
    el.nextBtn.disabled = true;
  }
  else if(nodeType === 'input'){
    // Nodo de entrada de texto
    el.text.textContent = node.text || 'Escribe tu respuesta:';
    showTextInput(node);
    el.nextBtn.disabled = true;
  }
  else if(nodeType === 'thought'){
    // Pensamiento del protagonista
    const speed = node.effects?.slowType ? 35 : 18;
    // Apply style/effects for thoughts
    if(node.effects?.fontSize === 'large') el.text.style.fontSize = '22px';
    if(node.effects?.fontStyle) el.text.style.fontStyle = node.effects.fontStyle;
    if(node.effects?.textShadow) el.text.style.textShadow = node.effects.textShadow;

    if(node.effects?.cameraShake){ cameraShake(node.effects.cameraShake.intensity || 5, node.effects.cameraShake.duration || 500); }
    if(node.effects?.cameraWobble){ cameraWobble(node.effects.cameraWobble.intensity || 6, node.effects.cameraWobble.duration || 800); }

    if(node.text){
      typeText(el.text, node.text, speed, null, characterId, { suppressVoice });
    }
    el.nextBtn.disabled = false;
    el.choices.innerHTML = '';
    return;
  }
  else if(nodeType === 'flashback'){
    // Flashback con texto legible y brillante
    const opacity = node.effects?.opacity || 0.85;
    showFlashback(el.text, node.text, opacity, null, node.effects || {});
    el.nextBtn.disabled = false;
    el.choices.innerHTML = '';
    return;
  }
  else if(nodeType === 'narration'){
    // Narración - puede ser lenta o normal
    const speed = node.effects?.slowType ? 35 : 18;
    
    // Aplicar efectos visuales si existen
    if(node.effects?.fadeInLeft){
      fadeInFromLeft(el.text, 2000);
    }
    if(node.effects?.cameraShake){
      cameraShake(5, 500);
    }
    if(node.effects?.cameraZoom){
      cameraZoom(2, 2000);
    }
    if(node.effects?.screenBlack){
      screenToBlack();
    }
    if(node.effects?.fadeToBlack){
      fadeToBlack(2000, null);
      el.nextBtn.disabled = false;
      return;
    }
    
    if(node.text){
      // Escribir texto sin auto-avanzar
      if(node.next === null && !(Array.isArray(node.choices) && node.choices.length)){
        typeText(el.text, node.text, speed, () => { endPending = true; if(el.nextBtn) el.nextBtn.disabled = false; }, characterId, { suppressVoice });
      } else {
        typeText(el.text, node.text, speed, null, characterId, { suppressVoice });
      }
    }
    else el.text.textContent = '';
    
    // Mostrar choices si existen
    if(Array.isArray(node.choices) && node.choices.length){
      el.nextBtn.disabled = true;
      node.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.textContent = c.text || `Opción ${idx+1}`;
        btn.addEventListener('click', (e)=>{ e.stopPropagation(); historyStack.push(id); goTo(c.next); });
        el.choices.appendChild(btn);
      });
    } else {
      el.nextBtn.disabled = (node.next === null || (node.next === undefined && !hasNextNode(id)));
    }
  }
  else {
    // Dialog node (default)
    if(node.text){
      // terminal nodes: special handling for the `final_verdadero` celebration
      if(node.next === null && !(Array.isArray(node.choices) && node.choices.length)){
        if(node.id === 'final_verdadero'){
          // wait for the player's click before showing the big banner (allow reading)
          typeText(el.text, node.text, 18, () => { endPending = true; if(el.nextBtn) el.nextBtn.disabled = false; }, characterId, { suppressVoice });
        } else {
          typeText(el.text, node.text, 18, () => { endPending = true; if(el.nextBtn) el.nextBtn.disabled = false; }, characterId, { suppressVoice });
        }
      } else {
        typeText(el.text, node.text, 18, null, characterId, { suppressVoice });
      }
    }
    else el.text.textContent = '';

    // choices
    if(Array.isArray(node.choices) && node.choices.length){
      el.nextBtn.disabled = true;
      node.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.textContent = c.text || `Opción ${idx+1}`;
        // stop propagation so the parent .click handler (which does skip/next) doesn't interfere
        btn.addEventListener('click', (e)=>{ e.stopPropagation(); historyStack.push(id); goTo(c.next); });
        el.choices.appendChild(btn);
      });
    } else {
      // no choices — show next if next exists
      el.nextBtn.disabled = (node.next === null || (node.next === undefined && !hasNextNode(id)));
    }
  }

  el.backBtn.disabled = historyStack.length === 0;
  
  // Mostrar hint si existe (una sola vez por escena)
  if(node.hint && !node._hintShown){
    console.log('💡 Hint:', node.hint);
    node._hintShown = true;
  }
}

/**
 * Avanza al siguiente nodo o continúa la interacción actual
 */
function next(){
  // Manejo de interacciones especiales (dados, monedas, input)
  const node = nodeMap[currentId];
  const nodeType = node ? (node.type || 'dialog') : 'dialog';
  
  if(nodeType === 'dice' && node && node.outcomes){
    // Obtén el outcome basado en el resultado del dado
    if(diceRollResult !== null){
      const matchingOutcome = node.outcomes.find(o => 
        diceRollResult >= (o.min || 1) && diceRollResult <= (o.max || 6)
      );
      if(matchingOutcome && matchingOutcome.next){
        historyStack.push(currentId);
        goTo(matchingOutcome.next);
        diceRollResult = null;
        return;
      }
    }
  }
  else if(nodeType === 'coin' && node && node.outcomes){
    // Obtén el outcome basado en el resultado de la moneda
    if(coinFlipResult !== null){
      const matchingOutcome = node.outcomes.find(o => 
        (coinFlipResult === 'heads' && o.result === 'heads') ||
        (coinFlipResult === 'tails' && o.result === 'tails')
      );
      if(matchingOutcome && matchingOutcome.next){
        historyStack.push(currentId);
        goTo(matchingOutcome.next);
        coinFlipResult = null;
        return;
      }
    }
  }
  else if(nodeType === 'input' && node && node.next){
    // Continúa al siguiente nodo después de entrada de texto
    historyStack.push(currentId);
    goTo(node.next);
    userInput = '';
    return;
  }
  
  // if we're at a terminal node that finished typing, show the appropriate screen only after a click
  if(endPending){ endPending = false; if(currentId === 'final_verdadero'){ showFinalBanner(); } else { showEndScreen(); } return; }
  if(!gameStarted) return;
  if(typing){ finishTyping(); return; }
  if(!node) return endScene();
  if(Array.isArray(node.choices) && node.choices.length) return; // espera elección
  if(node.next){ historyStack.push(currentId); goTo(node.next); return; }
  // try sequential fallback
  if(hasNextNode(currentId)){
    const nodes = script.nodes;
    const idx = nodes.findIndex(n=>n.id===currentId);
    if(idx>=0){ historyStack.push(currentId); goTo(nodes[idx+1].id); return; }
  }
  endScene();
}

/**
 * Retrocede al nodo anterior
 */
function back(){
  if(!gameStarted) return;
  if(typing){ finishTyping(); return; }
  if(historyStack.length===0) return;
  const prev = historyStack.pop();
  renderNode(prev);
}

/**
 * Marca el fin de la escena actual (pendiente de confirmación)
 */
function endScene(){
  // marque END pendiente para que el jugador de click para confirmar; mantén el texto visible
  endPending = true;
  if(el.nextBtn) el.nextBtn.disabled = false;
  // no borres el texto ni ocultes el sprite: el jugador debe poder leer antes de confirmar
  return;
}

/**
 * Muestra la pantalla final (celebración)
 */
function showFinalBanner(){
  // play a short flourish if available
  try{ if(el.endSfxAudio && el.endSfxAudio.src){ el.endSfxAudio.currentTime = 0; el.endSfxAudio.volume = sfxVolume; el.endSfxAudio.play().catch(()=>{}); } }catch(e){}
  const fb = document.getElementById('finalBanner');
  if(!fb) return;

  // split title into <span> per-letter for staggered animation (only once)
  const nameEl = fb.querySelector('.final-name');
  if(nameEl && !nameEl.dataset.split){
    const txt = (nameEl.textContent || '').trim();
    nameEl.textContent = '';
    Array.from(txt).forEach((ch, i)=>{
      const sp = document.createElement('span');
      sp.textContent = ch;
      sp.style.animationDelay = (i * 60) + 'ms';
      nameEl.appendChild(sp);
    });
    nameEl.dataset.split = '1';
  }

  // split final-thanks into words so CSS pop animation can stagger them
  const thanksEl = fb.querySelector('.final-thanks');
  if(thanksEl && !thanksEl.dataset.split){
    const words = (thanksEl.textContent || '').trim().split(/\s+/);
    thanksEl.textContent = '';
    words.forEach((w, i)=>{
      const spw = document.createElement('span');
      spw.className = 'thanks-word';
      // always add space after word to maintain spacing between words
      spw.textContent = w + '_'  ;
      spw.style.animationDelay = (i * 120) + 'ms';
      thanksEl.appendChild(spw);
    });
    thanksEl.dataset.split = '1';
  }

  fb.classList.remove('hidden');
  const vn = document.querySelector('.vn'); if(vn) vn.classList.add('dimmed');
  const btn = document.getElementById('finalContinue');
  if(btn){ btn.onclick = ()=>{ hideFinalBanner(); }; }

  // spawn two quick bursts for a richer effect
  try{ spawnFinalBurst(fb, 22, 7); setTimeout(()=>spawnFinalBurst(fb, 14, 5), 220); }catch(e){}
}

/**
 * Oculta la pantalla final y muestra la pantalla de fin
 */
function hideFinalBanner(){
  const fb = document.getElementById('finalBanner');
  if(fb) fb.classList.add('hidden');
  const vn = document.querySelector('.vn'); if(vn) vn.classList.remove('dimmed');
  // after the celebratory banner, show the regular end screen so player can restart/back
  showEndScreen();
}

/**
 * Muestra la pantalla de fin del juego
 */
function showEndScreen(){
  endPending = false;
  fadeOutMusic(900);
  const end = el.endScreen || document.getElementById('endScreen');
  const vn = document.querySelector('.vn');
  if(vn) vn.classList.add('dimmed');
  if(end){
    end.classList.remove('hidden');
    // attach buttons
    if(el.restartBtn){ el.restartBtn.onclick = restartGame; }
    if(el.lastDecisionBtn){ el.lastDecisionBtn.onclick = backToLastDecision; }
  }
  // play special end SFX if provided
  try{
    if(el.endSfxAudio && el.endSfxAudio.src){ el.endSfxAudio.volume = sfxVolume; el.endSfxAudio.currentTime = 0; el.endSfxAudio.play().catch(()=>{}); }
  }catch(e){}
}

/**
 * Reinicia el juego desde el principio
 */
function restartGame(){
  // Restart the story from the configured start node WITHOUT reloading the page
  const end = el.endScreen || document.getElementById('endScreen');
  if(end) end.classList.add('hidden');
  const vn = document.querySelector('.vn');
  if(vn) vn.classList.remove('dimmed');
  // reset runtime state
  historyStack = [];
  typing = false;
  if(mouthInterval){ try{ cancelAnimationFrame(mouthInterval); }catch(e){ try{ clearInterval(mouthInterval); }catch(e){} } mouthInterval = null; }
  endPending = false;
  // clear persisted progress so restart is clean
  try{ window.localStorage.removeItem('vn_last_node'); window.localStorage.removeItem('vn_history'); }catch(e){}
  // reset music playback position (keep current track)
  try{ if(el.musicAudio){ el.musicAudio.currentTime = 0; el.musicAudio.volume = musicVolume; } }catch(e){}
  // show dialogue UI and hide title so the story restarts immediately
  const title = document.getElementById('titleScreen'); if(title) title.classList.add('hidden');
  const dialogue = document.getElementById('dialogue'); if(dialogue) dialogue.classList.remove('hidden');
  // reset sprite to default if available
  try{ setSprite('Louie'); }catch(e){}
  // render the configured start node
  if(!script){ loadScript(sampleScript); return; }
  const startId = script.start || (script.nodes && script.nodes[0] && script.nodes[0].id);
  renderNode(startId);
}

/**
 * Retrocede a la última decisión importante
 */
function backToLastDecision(){
  // find last history entry that had choices
  for(let i = historyStack.length - 1; i >= 0; i--){
    const nid = historyStack[i];
    const node = nodeMap[nid];
    if(node && Array.isArray(node.choices) && node.choices.length){
      // pop until that point
      historyStack = historyStack.slice(0, i);
      const end = el.endScreen || document.getElementById('endScreen');
      if(end) end.classList.add('hidden');
      const vn = document.querySelector('.vn');
      if(vn) vn.classList.remove('dimmed');
      renderNode(nid);
      return;
    }
  }
  // if none found, restart
  restartGame();
}

/**
 * Inicia el juego
 */
function startGame(){
  if(gameStarted) return;
  gameStarted = true;
  const title = document.getElementById('titleScreen');
  if(title) title.classList.add('hidden');
  document.getElementById('dialogue').classList.remove('hidden');
  // wire audio controls when game starts (elements exist)
  wireAudioControls();
  // start background music with fade-in (user gesture has occurred)
  try{ fadeInMusic(900); }catch(e){}
  // si el script no está preparado (rare), arranca el ejemplo; si está preparado, comienza en start
  if(!script){ loadScript(sampleScript); return; }
  // check for saved resume point
  let startId = script.start || (script.nodes && script.nodes[0] && script.nodes[0].id);
  try{
    const saved = window.localStorage.getItem('vn_last_node');
    if(saved && nodeMap[saved]) startId = saved;
    const hist = window.localStorage.getItem('vn_history');
    if(hist){ const h = JSON.parse(hist); if(Array.isArray(h)) historyStack = h; }
  }catch(e){}
  renderNode(startId);
}
