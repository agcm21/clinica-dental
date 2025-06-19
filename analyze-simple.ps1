Write-Host "Analizando errores TypeScript..." -ForegroundColor Green

$problemFiles = @()

Write-Host "Buscando archivos..." -ForegroundColor Yellow

$files = Get-ChildItem -Path ".\app", ".\components" -Recurse -Include "*.tsx", "*.ts" -ErrorAction SilentlyContinue

Write-Host "Archivos encontrados: $($files.Count)" -ForegroundColor White

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    $issues = @()
    
    if ($content -match 'useState$$null$$' -and $content -match 'setError') {
        $issues += "useState(null) con setError"
    }
    
    if ($content -match 'FormField.*@radix-ui/react-select') {
        $issues += "FormField importacion incorrecta"
    }
    
    if ($content -match 'error\.message') {
        $issues += "error.message sin verificacion"
    }
    
    if ($issues.Count -gt 0) {
        $problemFiles += [PSCustomObject]@{
            File = $file.Name
            Path = $file.FullName
            Issues = $issues
        }
    }
}

Write-Host "RESULTADOS:" -ForegroundColor Yellow
Write-Host "============" -ForegroundColor Yellow

if ($problemFiles.Count -eq 0) {
    Write-Host "No se encontraron problemas!" -ForegroundColor Green
} else {
    Write-Host "Archivos con problemas: $($problemFiles.Count)" -ForegroundColor Red
    
    foreach ($file in $problemFiles) {
        Write-Host ""
        Write-Host "Archivo: $($file.File)" -ForegroundColor White
        foreach ($issue in $file.Issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Analisis completado!" -ForegroundColor Green
Read-Host "Presiona Enter para continuar"