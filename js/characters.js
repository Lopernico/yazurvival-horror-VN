/**
 * CHARACTER SYSTEM
 * Define personajes con sus assets: al referir un personaje en speaker, usa su ID
 * Cada personaje tiene: boca abierta, boca cerrada, sonido de voz
 */

const characters = {
 
  'Louie': {
    open: 'assets/Louie.png',
    closed: 'assets/Louieabierto.png',
    voice: 'assets/talking.mp3'
  },
  'Yazu': {
    open: 'assets\yazu bocona.png',
    closed: 'assets/yazu cerrada.png',
    voice: 'assets/talking.mp3'
  },
  'Carta': {
    open: 'assets/Louie.png',
    closed: 'assets/Louie.png',
    voice: 'assets/talking.mp3'
  },
  'YAZUMIMOON': {
     open: 'assets/yazu bocona.png',
    closed: 'assets/yazu cerrada.png',
    voice: 'assets/talking.mp3'
  }
  // Agregar más personajes aquí: 
  // 'NombrePersonaje': { open: 'ruta/abierto.png', closed: 'ruta/cerrado.png', voice: 'ruta/sonido.mp3' }
};

/**
 * Obtiene las variantes de sprite (abierto/cerrado) basado en ID de personaje
 * @param {string} characterId - ID del personaje
 * @returns {Array<string>} [openSprite, closedSprite]
 */
function getSpriteVariants(characterId){
  if(!characterId) return [ '', '' ];
  
  const basePath = window.BASE_PATH || '/';
  
  // Si el personaje está en el registry, usa sus assets definidos
  if(characters[characterId]){
    const open = characters[characterId].open;
    const closed = characters[characterId].closed;
    // Agregar basePath si no está incluido ya
    return [ 
      open.startsWith('assets/') || open.startsWith('assets\\') ? basePath + open.replace(/\\/g, '/') : basePath + open,
      closed.startsWith('assets/') || closed.startsWith('assets\\') ? basePath + closed.replace(/\\/g, '/') : basePath + closed
    ];
  }
  
  // Si no está en registry, asume que es un nombre de archivo legacy (compatible)
  const hasExt = characterId.includes('.');
  if(hasExt){
    const parts = characterId.split('.');
    const ext = parts.pop();
    const base = parts.join('.');
    const open = basePath + `assets/${base}.${ext}`;
    const closed = basePath + `assets/${base}abierto.${ext}`;
    return [open, closed];
  }
  // sin extension: prefer png
  return [basePath + `assets/${characterId}.png`, basePath + `assets/${characterId}abierto.png`];
}

/**
 * Obtiene el sonido de voz del personaje
 * @param {string} characterId - ID del personaje
 * @returns {string} Ruta del archivo de audio
 */
function getCharacterVoice(characterId){
  const basePath = window.BASE_PATH || '/';
  if(characters[characterId] && characters[characterId].voice){
    const voice = characters[characterId].voice;
    return voice.startsWith('assets/') ? basePath + voice : basePath + voice;
  }
  return basePath + 'assets/talking.mp3'; // default
}
