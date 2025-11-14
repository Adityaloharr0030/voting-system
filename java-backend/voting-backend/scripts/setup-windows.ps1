# Run as Administrator. Installs Temurin JDK 21 and Maven via Chocolatey if available.
# Usage:
#   Open PowerShell as Administrator
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   .\scripts\setup-windows.ps1

if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey not found. Please install Chocolatey or install JDK21 and Maven manually." -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing Temurin JDK 21 and Maven via Chocolatey..." -ForegroundColor Cyan
choco install temurin21jdk -y
choco install maven -y

Write-Host "Installation finished. You may need to open a new shell to pick up PATH changes." -ForegroundColor Green
Write-Host "Verify by running: java -version  and mvn -v" -ForegroundColor Green
