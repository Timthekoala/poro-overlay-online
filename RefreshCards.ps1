# RefreshCards.ps1
# Scans all image folders and regenerates cardnames.txt in each one.
# Run this whenever you add or remove card images.

$rootPath = "public\images"
$folders = @("Legends", "Battlefields", "Cards")

foreach ($folder in $folders) {
    $targetDir = Join-Path $rootPath $folder

    if (Test-Path $targetDir) {
        # Include the folder itself + all subfolders (e.g. Cards/Origins, Cards/Runes etc.)
        $allSubDirs = Get-ChildItem -Path $targetDir -Recurse | Where-Object { $_.PSIsContainer }
        $dirList = @($targetDir) + $allSubDirs.FullName

        foreach ($dir in $dirList) {
            Write-Host "Updating: $dir"

            $files = Get-ChildItem -Path $dir -File | Where-Object {
                $_.Extension -match "\.(webp|png|jpg|jpeg)$" -and $_.Name -ne "cardnames.txt"
            } | Select-Object -ExpandProperty Name

            $files | Out-File -FilePath (Join-Path $dir "cardnames.txt") -Encoding utf8
        }
    } else {
        Write-Host "Skipping (not found): $targetDir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! All cardnames.txt files updated." -ForegroundColor Green
Pause
