# Vite/Angular dev server breaks when the project path contains "#".
$safePath = "C:\Users\Yeshiva\Desktop\dev-csharp\C-Main-Frontend"

if (Test-Path $safePath) {
    Set-Location $safePath
} elseif ($PSScriptRoot -match '#') {
    Write-Host ""
    Write-Host "ERROR: Path contains '#'. Use one of these:" -ForegroundColor Red
    Write-Host "  cd C:\Users\Yeshiva\Desktop\dev-csharp\C-Main-Frontend" -ForegroundColor Yellow
    Write-Host "  Or rename folder 'c# project' to 'csharp-project'" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Set-Location $PSScriptRoot
}

ng serve @args
