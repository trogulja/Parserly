Write-Host "Setting environment variables...";
Invoke-Command -ScriptBlock ([ScriptBlock]::Create((Get-Content .\.secret)))
Write-Host "Initializing process..."
yarn electron:draft