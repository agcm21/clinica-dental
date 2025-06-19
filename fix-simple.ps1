# Script Simple para Corregir TypeScript Errors
Write-Host "Iniciando correcciones..." -ForegroundColor Green

# Crear backup
$backup = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
mkdir $backup

# Lista de archivos
$files = @(
    "app\api\appointments\available-slots\route.ts",
    "app\api\appointments\route.ts", 
    "app\api\appointments\[id]\route.ts",
    "app\api\dental-treatments\route.ts",
    "app\api\dental-treatments\[id]\route.ts",
    "app\api\patients\route.ts",
    "app\api\patients\[id]\route.ts",
    "app\api\presupuestos\route.ts",
    "app\api\presupuestos\[id]\route.ts",
    "app\api\upload\route.ts"
)

$count = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando: $file"
        
        # Backup
        $name = $file.Replace('\', '_').Replace('[', '_').Replace(']', '_')
        Copy-Item $file "$backup\$name"
        
        # Leer y corregir
        $content = Get-Content $file -Raw
        $original = $content
        
        # Corrección principal
        $content = $content -replace 'return NextResponse\.json\(\s*\{\s*error:\s*error\.message\s*\}', 'return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }'
        
        $content = $content -replace 'error:\s*error\.message', 'error: error instanceof Error ? error.message : "Error desconocido"'
        
        $content = $content -replace '"\s*\+\s*error\.message', '" + (error instanceof Error ? error.message : "Error desconocido")'
        
        # Guardar si cambió
        if ($content -ne $original) {
            Set-Content $file $content -NoNewline
            $count++
            Write-Host "  Corregido!" -ForegroundColor Green
        }
    }
}

Write-Host "Archivos corregidos: $count" -ForegroundColor Yellow
Write-Host "Backup en: $backup" -ForegroundColor Cyan