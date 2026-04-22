[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Prompt,

  [string[]]$ReferenceImage = @(),

  [string]$Size = "1024x1536",

  [string]$Quality = "high",

  [string]$Format = "jpeg",

  [string]$Background = "opaque",

  [string]$Output = "",

  [string]$BaseUrl = "",

  [string]$Model = "",

  [string]$ReasoningEffort = "",

  [string]$CodexHome = ""
)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir "generate-image.mjs"

$arguments = @(
  $nodeScript,
  "--prompt",
  $Prompt,
  "--size",
  $Size,
  "--quality",
  $Quality,
  "--format",
  $Format,
  "--background",
  $Background
)

if ($Output) {
  $arguments += @("--output", $Output)
}

if ($BaseUrl) {
  $arguments += @("--base-url", $BaseUrl)
}

if ($Model) {
  $arguments += @("--model", $Model)
}

if ($ReasoningEffort) {
  $arguments += @("--reasoning-effort", $ReasoningEffort)
}

if ($CodexHome) {
  $arguments += @("--codex-home", $CodexHome)
}

foreach ($imagePath in $ReferenceImage) {
  if ($imagePath) {
    $arguments += @("--reference-image", $imagePath)
  }
}

& node @arguments
$exitCode = $LASTEXITCODE

if ($null -ne $exitCode) {
  exit $exitCode
}
