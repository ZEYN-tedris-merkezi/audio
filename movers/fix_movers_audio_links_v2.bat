@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo   ZEYN Movers audio link fixer - v2
echo ==========================================
echo.

set "VBS=%TEMP%\zeyn_fix_movers_%RANDOM%.vbs"

> "%VBS%" echo Option Explicit
>>"%VBS%" echo Dim fso, folder, file, oldText, newText, content, changed, stm
>>"%VBS%" echo oldText = "https://zeyn-tedris-merkezi.github.io/audio/"
>>"%VBS%" echo newText = "https://zeyn-tedris-merkezi.github.io/audio/movers/"
>>"%VBS%" echo Set fso = CreateObject("Scripting.FileSystemObject")
>>"%VBS%" echo Set folder = fso.GetFolder(fso.GetParentFolderName(WScript.ScriptFullName))
>>"%VBS%" echo changed = 0
>>"%VBS%" echo For Each file In folder.Files
>>"%VBS%" echo   If LCase(fso.GetExtensionName(file.Name)) = "html" And LCase(Left(file.Name,4)) = "test" Then
>>"%VBS%" echo     Set stm = CreateObject("ADODB.Stream")
>>"%VBS%" echo     stm.Type = 2
>>"%VBS%" echo     stm.Charset = "utf-8"
>>"%VBS%" echo     stm.Open
>>"%VBS%" echo     stm.LoadFromFile file.Path
>>"%VBS%" echo     content = stm.ReadText
>>"%VBS%" echo     stm.Close
>>"%VBS%" echo     If InStr(content, oldText) ^> 0 Then
>>"%VBS%" echo       If Not fso.FileExists(file.Path ^& ".backup") Then fso.CopyFile file.Path, file.Path ^& ".backup", True
>>"%VBS%" echo       content = Replace(content, oldText, newText)
>>"%VBS%" echo       Set stm = CreateObject("ADODB.Stream")
>>"%VBS%" echo       stm.Type = 2
>>"%VBS%" echo       stm.Charset = "utf-8"
>>"%VBS%" echo       stm.Open
>>"%VBS%" echo       stm.WriteText content
>>"%VBS%" echo       stm.Position = 0
>>"%VBS%" echo       stm.Type = 1
>>"%VBS%" echo       stm.Position = 3
>>"%VBS%" echo       Dim bin
>>"%VBS%" echo       bin = stm.Read
>>"%VBS%" echo       stm.Close
>>"%VBS%" echo       Set stm = CreateObject("ADODB.Stream")
>>"%VBS%" echo       stm.Type = 1
>>"%VBS%" echo       stm.Open
>>"%VBS%" echo       stm.Write bin
>>"%VBS%" echo       stm.SaveToFile file.Path, 2
>>"%VBS%" echo       stm.Close
>>"%VBS%" echo       WScript.Echo "Fixed: " ^& file.Name
>>"%VBS%" echo       changed = changed + 1
>>"%VBS%" echo     Else
>>"%VBS%" echo       WScript.Echo "Skipped: " ^& file.Name ^& " (already fixed or link not found)"
>>"%VBS%" echo     End If
>>"%VBS%" echo   End If
>>"%VBS%" echo Next
>>"%VBS%" echo WScript.Echo ""
>>"%VBS%" echo WScript.Echo "Completed. Files changed: " ^& changed

cscript //nologo "%VBS%"
set "ERR=%ERRORLEVEL%"
del "%VBS%" >nul 2>&1

echo.
if not "%ERR%"=="0" (
  echo ERROR: The fixer could not run.
  echo Please send a screenshot of this window.
) else (
  echo Finished.
  echo Now open test08.html and confirm the link contains /audio/movers/
  echo Then use GitHub Desktop: Commit to main ^> Push origin
)
echo.
pause
endlocal
