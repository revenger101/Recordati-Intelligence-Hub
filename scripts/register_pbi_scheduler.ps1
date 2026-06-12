# OpaliaHR — Register Power BI Auto-Refresh Task in Windows Task Scheduler
# Run this script ONCE as Administrator to install the nightly refresh job.
# Usage: powershell -ExecutionPolicy Bypass -File register_pbi_scheduler.ps1

param(
    [string]$ProjectRoot = "c:\Users\USER\Desktop\Recordati-Intelligence-Hub",
    [string]$TaskName    = "OpaliaHR_PBI_AutoRefresh",
    [string]$RunAt       = "02:30"
)

$scriptPath = Join-Path $ProjectRoot "scripts\pbi_autorefresh.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Error "Refresh script not found at: $scriptPath"
    exit 1
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$scriptPath`" -ProjectRoot `"$ProjectRoot`""

$trigger = New-ScheduledTaskTrigger -Daily -At $RunAt

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false

# Remove existing task if present
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task: $TaskName"
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Description "Opens OPALIAHR_DASH.pbix and triggers dataset refresh 30 min after nightly ETL."

Write-Host ""
Write-Host "Task Scheduler job registered successfully:"
Write-Host "  Name    : $TaskName"
Write-Host "  Script  : $scriptPath"
Write-Host "  Runs at : $RunAt daily"
Write-Host ""
Write-Host "To run immediately for testing:"
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
