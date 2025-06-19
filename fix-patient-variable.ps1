Write-Host "Corrigiendo variable 'patient' en route.ts..." -ForegroundColor Green

$file = ".\app\api\integrations\n8n\appointments\route.ts"

if (Test-Path $file) {
    $content = Get-Content $file | Out-String
    
    # Corregir 'patient' por 'patientId' 
    $content = $content -replace '\bpatient\b(?!\w)', 'patientId'
    
    Set-Content $file $content
    Write-Host "✅ Archivo corregido: $file" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo no encontrado: $file" -ForegroundColor Red
}

Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'fix: corregir variable patient por patientId'" -ForegroundColor White
Write-Host "git push" -ForegroundColor White

Read-Host "Presiona Enter para continuar"
