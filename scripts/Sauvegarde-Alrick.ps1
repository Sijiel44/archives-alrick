#requires -Version 5.1
<#
Sauvegarde LOCALE des Archives d'Alrick, pour Windows PowerShell.
N'envoie rien sur Internet ; ne modifie jamais le depot public.
Pre-requis : Git for Windows, PowerShell, robocopy et espace disque.
#>
[CmdletBinding()]
param(
  [string]$Depot = (Join-Path $HOME 'Documents\Alrick\archives-alrick'),
  [string]$SourcesPrivees = (Join-Path $HOME 'Documents\Alrick\Sources_privees'),
  [string]$Destination = (Join-Path $HOME 'Documents\Sauvegardes-Alrick'),
  [int]$Garder = 12,
  [switch]$SansMiseAJour
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if ($Garder -lt 2) { throw 'Garder doit etre superieur ou egal a 2.' }
$Git = (Get-Command git -ErrorAction Stop).Source
if (-not (Test-Path -LiteralPath $Depot -PathType Container)) { throw "Depot introuvable : $Depot" }
$Depot = (Resolve-Path -LiteralPath $Depot).Path
$Destination = [IO.Path]::GetFullPath($Destination)
$repoPrefix = $Depot.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
if ($Destination.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase) -or $Destination -eq $Depot) {
  throw 'Destination refusee : ne jamais sauvegarder a l interieur du depot public.'
}
& $Git -C $Depot rev-parse --is-inside-work-tree | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Le dossier choisi n est pas un depot Git.' }
New-Item -ItemType Directory -Path $Destination -Force | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$nom = "Alrick_backup_$stamp"
$travail = Join-Path $Destination "TEMP_$nom"
$zip = Join-Path $Destination "$nom.zip"
$shaFile = Join-Path $Destination "$nom.sha256.txt"
New-Item -ItemType Directory -Path $travail -Force | Out-Null
try {
  $gitFolder = Join-Path $travail 'Depot_git'
  $workingFolder = Join-Path $travail 'Fichiers_de_travail'
  $privateFolder = Join-Path $travail 'Sources_privees'
  New-Item -ItemType Directory -Path $gitFolder,$workingFolder,$privateFolder -Force | Out-Null
  if (-not $SansMiseAJour) {
    & $Git -C $Depot fetch --all --tags --prune 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { Write-Warning 'Reseau indisponible : refs locales utilisees.' }
  }
  $bundle = Join-Path $gitFolder 'archives-alrick.bundle'
  & $Git -C $Depot bundle create $bundle --all
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $bundle)) { throw 'Creation du bundle Git impossible.' }
  & $Git -C $Depot bundle verify $bundle 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Bundle Git non valide.' }
  (& $Git -C $Depot status --short) | Set-Content -LiteralPath (Join-Path $gitFolder 'git-status.txt') -Encoding UTF8
  (& $Git -C $Depot log -1 --format='%H %cI %s') | Set-Content -LiteralPath (Join-Path $gitFolder 'dernier-commit.txt') -Encoding UTF8
  (& $Git -C $Depot branch -avv) | Set-Content -LiteralPath (Join-Path $gitFolder 'branches.txt') -Encoding UTF8
  # Le dossier de travail capture aussi les modifications non commitees.
  & robocopy $Depot $workingFolder /E /XD .git node_modules public .quartz-cache .cache /XF *.log /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Copie du travail echouee : robocopy $LASTEXITCODE" }
  if (Test-Path -LiteralPath $SourcesPrivees -PathType Container) {
    & robocopy $SourcesPrivees $privateFolder /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Copie privee echouee : robocopy $LASTEXITCODE" }
  } else {
    Write-Warning "Sources privees absentes : $SourcesPrivees"
    'Sources privees absentes a cette execution.' | Set-Content -LiteralPath (Join-Path $privateFolder 'ABSENTES.txt') -Encoding UTF8
  }
  @(
    'Sauvegarde locale des Archives Alrick (depot + fichiers de travail + sources privees).',
    'ATTENTION : archive ZIP NON CHIFFREE. Stocker sur un support securise, jamais sur GitHub public.',
    'Les discussions de PR et les conversations ChatGPT doivent etre exportees separement.'
  ) | Set-Content -LiteralPath (Join-Path $travail 'LIRE_MOI.txt') -Encoding UTF8
  Compress-Archive -Path (Join-Path $travail '*') -DestinationPath $zip -CompressionLevel Optimal
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [IO.Compression.ZipFile]::OpenRead($zip)
  try { if ($archive.Entries.Count -lt 3) { throw 'Archive vide ou incomplete.' } }
  finally { $archive.Dispose() }
  $hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
  "SHA256  $hash  $([IO.Path]::GetFileName($zip))" | Set-Content -LiteralPath $shaFile -Encoding ASCII
  Write-Host "Sauvegarde locale OK : $zip"
  Write-Host "SHA256 : $hash"
  $anciens = @(Get-ChildItem -LiteralPath $Destination -File -Filter 'Alrick_backup_*.zip' | Sort-Object Name -Descending)
  if ($anciens.Count -gt $Garder) {
    foreach ($ancien in $anciens[$Garder..($anciens.Count-1)]) {
      $fichierHash = [IO.Path]::ChangeExtension($ancien.FullName, '.sha256.txt')
      Remove-Item -LiteralPath $ancien.FullName -Force
      if (Test-Path -LiteralPath $fichierHash) { Remove-Item -LiteralPath $fichierHash -Force }
    }
  }
} finally {
  if (Test-Path -LiteralPath $travail) { Remove-Item -LiteralPath $travail -Recurse -Force }
}