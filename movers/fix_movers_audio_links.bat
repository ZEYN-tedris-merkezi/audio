@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo   ZEYN Movers audio link fixer
echo ==========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$old='https://zeyn-tedris-merkezi.github.io/audio/';" ^
"$new='https://zeyn-tedris-merkezi.github.io/audio/movers/';" ^
"$files=Get-ChildItem -Path . -Filter 'test*.html' -File;" ^
"if(-not $files){Write-Host 'No test*.html files were found in this folder.' -ForegroundColor Red; exit 1};" ^
"$changed=0;" ^
"foreach($f in $files){" ^
"  $text=[System.IO.File]::ReadAllText($f.FullName);" ^
"  if($text.Contains($old)){" ^
"    Copy-Item $f.FullName ($f.FullName + '.backup') -Force;" ^
"    $updated=$text.Replace($old,$new);" ^
"    [System.IO.File]::WriteAllText($f.FullName,$updated,[System.Text.UTF8Encoding]::new($false));" ^
"    Write-Host ('Fixed: ' + $f.Name) -ForegroundColor Green;" ^
"    $changed++;" ^
"  } else {" ^
"    Write-Host ('Skipped: ' + $f.Name + ' (already fixed or link not found)') -ForegroundColor Yellow;" ^
"  }" ^
"};" ^
"Write-Host '';" ^
"Write-Host ('Completed. Files changed: ' + $changed) -ForegroundColor Cyan;" ^
"Write-Host 'Backup copies were created with the .backup extension.' -ForegroundColor Cyan;"

echo.
echo Finished.
echo Now open GitHub Desktop, commit the changes, and click Push origin.
echo.
pause
endlocal
