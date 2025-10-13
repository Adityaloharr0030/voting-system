param(
  [string]$RemoteUrl
)

function Invoke-GitCommand([string[]]$gitArgs) {
  $git = 'git'
  & $git @gitArgs
  if ($LASTEXITCODE -ne 0) { throw "git @gitArgs failed: $($gitArgs -join ' ')" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not in PATH. Install git and retry."
  exit 1
}

if (-not $RemoteUrl) {
  $RemoteUrl = Read-Host 'Enter the Git remote URL (e.g. https://github.com/username/repo.git)'
}

Write-Output "Using remote: $RemoteUrl"

if (-not (Test-Path .git)) {
  Write-Output 'No git repo found. Initializing repository...'
  Invoke-GitCommand @('init')
} else {
  Write-Output 'Existing git repository detected.'
}

# Ensure .gitignore exists
if (-not (Test-Path '.gitignore')) {
  @('.env','node_modules/','dist/','build/','*.log') | Out-File -FilePath .gitignore -Encoding utf8
  Write-Output 'Created .gitignore'
}

# Add remote (replace if exists)
try {
  Invoke-GitCommand @('remote','remove','origin')
} catch {
  # ignore
}
Invoke-GitCommand @('remote','add','origin',$RemoteUrl)

# Add and commit
Invoke-GitCommand @('add','-A')
try {
  Invoke-GitCommand @('commit','-m','Initial commit')
} catch {
  Write-Output 'Nothing to commit or commit failed (there may already be commits).'
}

# Try pushing to main, then master
try {
  Invoke-GitCommand @('push','-u','origin','main')
} catch {
  Write-Output 'Push to main failed, trying master...'
  Invoke-GitCommand @('push','-u','origin','master')
}

Write-Output 'Push finished. Check your remote repository.'
