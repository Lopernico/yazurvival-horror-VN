/**
 * INTERACTION SYSTEM
 * Maneja dados, monedas e input de texto del jugador
 */

// Estado de interacciones
let currentInteractionType = null; // 'dice', 'coin', 'input', null
let diceRollResult = null;
let coinFlipResult = null; // 'heads' o 'tails'
let userInput = '';

/**
 * Muestra un dado interactivo
 * @param {Object} node - Nodo del guión
 * @param {string} diceType - Tipo de dado (d4, d6, d12, d20)
 */
function showDiceRoll(node, diceType = 'd6'){
  el.nextBtn.disabled = true;
  el.choices.innerHTML = '';
  
  // Parse dice type (d6, d20, d12, etc.)
  const match = diceType.match(/d(\d+)/);
  const sides = match ? parseInt(match[1]) : 6;
  
  const rollBtn = document.createElement('button');
  rollBtn.textContent = `🎲 Lanzar ${diceType}`;
  rollBtn.style.marginTop = '20px';
  rollBtn.onclick = () => {
    diceRollResult = Math.floor(Math.random() * sides) + 1;
    rollBtn.textContent = `🎲 Resultado: ${diceRollResult}`;
    rollBtn.disabled = true;
    
    // Find matching outcome
    const matchingOutcome = (node.outcomes || []).find(o => 
      diceRollResult >= (o.min || 1) && diceRollResult <= (o.max || sides)
    );
    
    if(matchingOutcome && matchingOutcome.next){
      setTimeout(() => {
        el.nextBtn.disabled = false;
      }, 500);
    }
  };
  el.choices.appendChild(rollBtn);
}

/**
 * Muestra una moneda interactiva
 * @param {Object} node - Nodo del guión
 */
function showCoinFlip(node){
  el.nextBtn.disabled = true;
  el.choices.innerHTML = '';
  
  const flipBtn = document.createElement('button');
  flipBtn.textContent = '🪙 Lanzar Moneda';
  flipBtn.style.marginTop = '20px';
  flipBtn.onclick = () => {
    coinFlipResult = Math.random() > 0.5 ? 'heads' : 'tails';
    flipBtn.textContent = `🪙 Resultado: ${coinFlipResult === 'heads' ? 'Cara' : 'Cruz'}`;
    flipBtn.disabled = true;
    
    // Find matching outcome
    const matchingOutcome = (node.outcomes || []).find(o => 
      (coinFlipResult === 'heads' && o.result === 'heads') ||
      (coinFlipResult === 'tails' && o.result === 'tails')
    );
    
    if(matchingOutcome && matchingOutcome.next){
      setTimeout(() => {
        el.nextBtn.disabled = false;
      }, 300);
    }
  };
  el.choices.appendChild(flipBtn);
}

/**
 * Muestra un campo de entrada de texto
 * @param {Object} node - Nodo del guión
 */
function showTextInput(node){
  el.nextBtn.disabled = true;
  el.choices.innerHTML = '';
  
  const inputContainer = document.createElement('div');
  inputContainer.style.marginTop = '20px';
  
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = node.placeholder || 'Escribe aquí...';
  inputField.style.width = '100%';
  inputField.style.padding = '10px';
  inputField.style.marginBottom = '10px';
  inputField.style.fontFamily = '"Courier New", monospace';
  inputField.style.backgroundColor = 'rgba(139,38,39,0.3)';
  inputField.style.color = '#b89968';
  inputField.style.border = '2px solid #8b2627';
  inputField.style.borderRadius = '4px';
  
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Enviar';
  submitBtn.style.width = '100%';
  submitBtn.style.marginTop = '10px';
  submitBtn.onclick = () => {
    userInput = inputField.value.trim();
    if(!userInput && node.required){ 
      alert('Debes escribir algo');
      return; 
    }
    inputField.disabled = true;
    submitBtn.disabled = true;
    el.nextBtn.disabled = false;
    // Store input para acceso posterior en el guion
    node.userInput = userInput;
  };
  
  inputContainer.appendChild(inputField);
  inputContainer.appendChild(submitBtn);
  el.choices.appendChild(inputContainer);
  
  inputField.focus();
  inputField.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') submitBtn.click();
  });
}
