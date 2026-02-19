# Remove all pause nodes from script.json
$scriptPath = Join-Path $PSScriptRoot 'dialogs\script.json'

if (!(Test-Path $scriptPath)) {
    Write-Host "ERROR: Script file not found at $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Loading script from $scriptPath" -ForegroundColor Cyan

# Read the JSON file
$json = Get-Content $scriptPath -Raw | ConvertFrom-Json

# Create a map of pause node IDs to their next nodes
$pauseMap = @{}
$json.nodes | Where-Object { $_.type -eq 'pause' } | ForEach-Object {
    $pauseMap[$_.id] = $_.next
}

Write-Host "⏸️  Found $($pauseMap.Count) pause nodes to remove:" -ForegroundColor Yellow
$pauseMap.GetEnumerator() | Select-Object -First 10 | ForEach-Object {
    Write-Host "   - $($_.Key) → $($_.Value)" -ForegroundColor Gray
}

# Update all node references that point to pause nodes
$updatedCount = 0
$json.nodes | ForEach-Object {
    if ($pauseMap.ContainsKey($_.next)) {
        $oldNext = $_.next
        $_.next = $pauseMap[$oldNext]
        $updatedCount++
        if ($updatedCount -le 10) {
            Write-Host "   Updated: $($_.id) → $oldNext → $($_.next)" -ForegroundColor Gray
        }
    }
}

Write-Host "↗️  Updated $updatedCount node references" -ForegroundColor Cyan

# Remove all pause nodes
$originalCount = $json.nodes.Count
$json.nodes = @($json.nodes | Where-Object { $_.type -ne 'pause' })
$removedCount = $originalCount - $json.nodes.Count

Write-Host "✂️  Removed $removedCount pause nodes" -ForegroundColor Green
Write-Host "📊 Remaining nodes: $($json.nodes.Count)" -ForegroundColor Cyan

# Update start node if it was a pause
if ($pauseMap.ContainsKey($json.start)) {
    $oldStart = $json.start
    $json.start = $pauseMap[$oldStart]
    Write-Host "🔄 Updated start: $oldStart → $($json.start)" -ForegroundColor Yellow
}

# Write back to file
$json | ConvertTo-Json -Depth 100 | Set-Content $scriptPath -Encoding UTF8

Write-Host "✅ Script saved successfully!" -ForegroundColor Green
Write-Host "   Total: $($json.nodes.Count) nodes" -ForegroundColor Cyan
Write-Host " " -ForegroundColor White
Write-Host "The game will auto-refresh in 3 seconds with the updated script!" -ForegroundColor Magenta
