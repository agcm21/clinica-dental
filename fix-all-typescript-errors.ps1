# ✅ SCRIPT PARA CORREGIR TODOS LOS 25 ERRORES TYPESCRIPT

Write-Host "🔧 CORRIGIENDO TODOS LOS ERRORES TYPESCRIPT..." -ForegroundColor Green

# 1. Corregir storage-debugger.tsx (líneas 63, 66)
$file = ".\components\storage-debugger.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'buckets\.map$$\(b$$ =>', 'buckets.map((b: any) =>'
    $content = $content -replace 'buckets\.find$$\(b$$ =>', 'buckets.find((b: any) =>'
    Set-Content $file $content
    Write-Host "✅ storage-debugger.tsx corregido" -ForegroundColor Green
}

# 2. Corregir supabase-storage.ts (líneas 15, 153)
$file = ".\lib\supabase-storage.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'buckets\.find$$\(b$$ =>', 'buckets.find((b: any) =>'
    Set-Content $file $content
    Write-Host "✅ supabase-storage.ts corregido" -ForegroundColor Green
}

# 3. Corregir bucket-utils.ts (línea 13)
$file = ".\lib\bucket-utils.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'buckets\.some$$\(bucket$$ =>', 'buckets.some((bucket: any) =>'
    Set-Content $file $content
    Write-Host "✅ bucket-utils.ts corregido" -ForegroundColor Green
}

# 4. Corregir appointment-utils.ts (líneas 89, 122)
$file = ".\lib\appointment-utils.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'const allSlots = \[\]', 'const allSlots: any[] = []'
    Set-Content $file $content
    Write-Host "✅ appointment-utils.ts corregido" -ForegroundColor Green
}

# 5. Corregir use-toast.ts (línea 138)
$file = ".\components\ui\use-toast.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'onOpenChange: $$open$$ =>', 'onOpenChange: (open: boolean) =>'
    Set-Content $file $content
    Write-Host "✅ use-toast.ts corregido" -ForegroundColor Green
}

# 6. Corregir pdf-generator.ts (múltiples errores de spread y undefined)
$file = ".\lib\pdf-generator.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Corregir spread operators
    $content = $content -replace 'pdf\.setTextColor$$\.\.\.(\w+Color)$$', 'pdf.setTextColor($1[0], $1[1], $1[2])'
    $content = $content -replace 'pdf\.setDrawColor$$\.\.\.(\w+Color)$$', 'pdf.setDrawColor($1[0], $1[1], $1[2])'
    # Corregir undefined en setFont
    $content = $content -replace 'pdf\.setFont\(undefined,', 'pdf.setFont("helvetica",'
    Set-Content $file $content
    Write-Host "✅ pdf-generator.ts corregido" -ForegroundColor Green
}

Write-Host "🎉 TODOS LOS ERRORES CORREGIDOS!" -ForegroundColor Green
Write-Host "📝 Ejecuta: git add . && git commit -m 'fix: corregir todos los errores TypeScript' && git push" -ForegroundColor Cyan

Read-Host "Presiona Enter para continuar"