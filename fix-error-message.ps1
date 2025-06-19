Write-Host "Corrigiendo error.message en todos los archivos..." -ForegroundColor Green

$files = Get-ChildItem -Path ".\app", ".\components" -Recurse -Include "*.tsx", "*.ts" -ErrorAction SilentlyContinue
$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName | Out-String
    $originalContent = $content
    
    # Patron 1: error.message directo
    $content = $content -replace '(\+\s*error\.message)', '+ (error instanceof Error ? error.message : "Error desconocido")'
    
    # Patron 2: error.message en strings
    $content = $content -replace '(error\.message)', '(error instanceof Error ? error.message : "Error desconocido")'
    
    # Patron 3: ${error.message}
    $content = $content -replace '\$\{error\.message\}', '${error instanceof Error ? error.message : "Error desconocido"}'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content
        Write-Host "Corregido: $($file.Name)" -ForegroundColor Yellow
        $fixedCount++
    }
}

Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Green
Write-Host "=========" -ForegroundColor Green
Write-Host "Archivos corregidos: $fixedCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'fix: corregir error.message en todos los archivos'" -ForegroundColor White
Write-Host "git push" -ForegroundColor White

Read-Host "Presiona Enter para continuar"