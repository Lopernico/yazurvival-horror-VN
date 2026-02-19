$path = 'c:\Users\Louie\Downloads\yazu14\survival novel\dialogs\script.json'
$j = Get-Content $path -Raw | ConvertFrom-Json
$map = @{}
$j.nodes | Where-Object { $_.type -eq 'pause' } | ForEach-Object { $map[$_.id] = $_.next }
foreach ($n in $j.nodes) { if ($n.next -and $map.ContainsKey($n.next)) { $n.next = $map[$n.next] } }
$j.nodes = $j.nodes | Where-Object { $_.type -ne 'pause' }
if ($map.ContainsKey($j.start)) { $j.start = $map[$j.start] }
$j | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $path
Write-Output 'OK'
