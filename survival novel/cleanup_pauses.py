#!/usr/bin/env python3
"""
Remove all pause nodes from the visual novel script and update references.
Pause nodes are timing delays that should be removed for faster pacing.
"""

import json
import sys
from pathlib import Path

script_dir = Path(__file__).parent
script_file = script_dir / 'dialogs' / 'script.json'

if not script_file.exists():
    print(f"ERROR: Script file not found at {script_file}")
    sys.exit(1)

print(f"📖 Loading script from {script_file}")
with open(script_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Create a map of pause node IDs to their next nodes
pause_map = {}
for node in data['nodes']:
    if node.get('type') == 'pause':
        pause_map[node['id']] = node.get('next')

print(f"⏸️  Found {len(pause_map)} pause nodes to remove:")
for pause_id, next_id in pause_map.items():
    print(f"   - {pause_id} → {next_id}")

# Update all node references that point to pause nodes
updated_count = 0
for node in data['nodes']:
    if node.get('next') in pause_map:
        old_next = node['next']
        new_next = pause_map[old_next]
        node['next'] = new_next
        updated_count += 1
        if updated_count <= 10:  # Print first 10
            print(f"   Updated: {node['id']} → {old_next} → {new_next}")

print(f"↗️  Updated {updated_count} node references")

# Remove all pause nodes
original_count = len(data['nodes'])
data['nodes'] = [n for n in data['nodes'] if n.get('type') != 'pause']
removed_count = original_count - len(data['nodes'])

print(f"✂️  Removed {removed_count} pause nodes")
print(f"📊 Remaining nodes: {len(data['nodes'])}")

# Update start node if it was a pause
if data.get('start') in pause_map:
    old_start = data['start']
    data['start'] = pause_map[old_start]
    print(f"🔄 Updated start: {old_start} → {data['start']}")

# Write back to file
with open(script_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"✅ Script saved successfully!")
print(f"   Total: {len(data['nodes'])} nodes")
