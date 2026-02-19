@echo off
cd /d "c:\Users\Louie\Downloads\yazu14\survival novel"
python3 -c "import json; data=json.load(open('dialogs/script.json')); pm={n['id']:n['next'] for n in data['nodes'] if n['type']=='pause'}; [data['nodes'][i].update({'next':pm[data['nodes'][i]['next']]}) for i in range(len(data['nodes'])) if data['nodes'][i]['next'] in pm]; data['nodes']=[n for n in data['nodes'] if n['type']!='pause']; json.dump(data,open('dialogs/script.json','w'),indent=4)"
echo Done
