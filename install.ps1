$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoUrl = if ($env:CODEX_IMAGE_REPO_URL) { $env:CODEX_IMAGE_REPO_URL } else { "https://github.com/aEboli/codex-image.git" }
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$skillRoot = Join-Path $codexHome "skills"
$targetDir = Join-Path $skillRoot "codex-image"
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("codex-image-" + [guid]::NewGuid().ToString("N"))

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is required to install codex-image."
}

Write-Host "Installing codex-image into $targetDir"
Write-Host "Repository: $repoUrl"

New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null

try {
  git clone --depth 1 $repoUrl $tempDir | Out-Null

  $sourceDir = Join-Path $tempDir "codex-image"
  if (-not (Test-Path -LiteralPath $sourceDir)) {
    throw "The repository does not contain a codex-image skill folder."
  }

  if (Test-Path -LiteralPath $targetDir) {
    Remove-Item -LiteralPath $targetDir -Recurse -Force
  }

  Copy-Item -LiteralPath $sourceDir -Destination $targetDir -Recurse -Force
}
finally {
  if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}

Write-Host "Installed codex-image."
Write-Host "Best practice: use `$codex-image explicitly in Codex chat."
