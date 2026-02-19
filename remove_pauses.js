const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'dialogs', 'script.json');
const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

// Map pause node IDs to their next nodes
const pauseMap = {};
data.nodes.forEach(node => {
  if (node.type === 'pause') {
    pauseMap[node.id] = node.next;
  }
});

console.log(`Found ${Object.keys(pauseMap).length} pause nodes to remove`);

// Update references to pause nodes
data.nodes.forEach(node => {
  if (pauseMap[node.next]) {
    const oldNext = node.next;
    node.next = pauseMap[node.next];
    console.log(`Updated ${node.id}: ${oldNext} -> ${node.next}`);
  }
});

// Remove pause nodes
const originalCount = data.nodes.length;
data.nodes = data.nodes.filter(node => node.type !== 'pause');
console.log(`Removed ${originalCount - data.nodes.length} nodes. Total remaining: ${data.nodes.length}`);

// Write back
fs.writeFileSync(scriptPath, JSON.stringify(data, null, 16));
console.log('✓ Script saved successfully');
