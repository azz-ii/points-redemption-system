# Quick Image Copy Script
# Run this script after placing your images in the Downloads folder or Desktop

# Instructions:
# 1. Save your Oracle Petroleum logo as "oracle-logo.png"
# 2. Save your building photo as "building.jpg"
# 3. Update the paths below to where your images are located
# 4. Run this script in PowerShell

$assetsFolder = "C:\Users\Azrielle\Desktop\point-redemption-app\client\app\src\assets"

# Example: If your images are on Desktop
$desktopPath = [Environment]::GetFolderPath("Desktop")
$logoSource = "$desktopPath\oracle-logo.png"
$logoSourceMobile = "$desktopPath\oracle-logo-mb.png"
$buildingSource = "$desktopPath\building.png"

# Copy logo if it exists
if (Test-Path $logoSource) {
    Copy-Item $logoSource -Destination "$assetsFolder\oracle-logo.png" -Force
    Write-Host "✓ Logo copied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Logo not found at: $logoSource" -ForegroundColor Yellow
    Write-Host "  Please update the path in this script" -ForegroundColor Yellow
}

# Copy building image if it exists
if (Test-Path $buildingSource) {
    Copy-Item $buildingSource -Destination "$assetsFolder\building.jpg" -Force
    Write-Host "✓ Building image copied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Building image not found at: $buildingSource" -ForegroundColor Yellow
    Write-Host "  Please update the path in this script" -ForegroundColor Yellow
}

Write-Host "`nDone! Check the assets folder:" -ForegroundColor Cyan
Write-Host $assetsFolder
