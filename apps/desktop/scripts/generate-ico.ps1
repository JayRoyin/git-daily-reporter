$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$pngPath = Join-Path $PSScriptRoot "..\src-tauri\icons\icon.png"
$icoPath = Join-Path $PSScriptRoot "..\src-tauri\icons\icon.ico"

$pngPath = [System.IO.Path]::GetFullPath($pngPath)
$icoPath = [System.IO.Path]::GetFullPath($icoPath)

if (-not (Test-Path $pngPath)) {
  throw "PNG icon not found: $pngPath"
}

$bitmap = [System.Drawing.Bitmap]::new($pngPath)

try {
  $iconHandle = $bitmap.GetHicon()
  try {
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $fileStream = [System.IO.File]::Create($icoPath)
    try {
      $icon.Save($fileStream)
    } finally {
      $fileStream.Dispose()
    }
  } finally {
    if ($iconHandle -ne [IntPtr]::Zero) {
      $signature = @"
using System;
using System.Runtime.InteropServices;
public static class NativeMethods {
  [DllImport("user32.dll", SetLastError = true)]
  public static extern bool DestroyIcon(IntPtr hIcon);
}
"@
      Add-Type $signature -ErrorAction SilentlyContinue | Out-Null
      [void][NativeMethods]::DestroyIcon($iconHandle)
    }
  }
} finally {
  $bitmap.Dispose()
}
