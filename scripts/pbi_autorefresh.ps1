# OpaliaHR — Power BI Desktop Auto-Refresh
# Triggered by Windows Task Scheduler at 02:30 daily (after n8n ETL at 02:00).
# Waits for the Express server to confirm ETL success, then opens/refreshes the .pbix.

param(
    [string]$ProjectRoot = "c:\Users\USER\Desktop\Recordati-Intelligence-Hub",
    [string]$ServerUrl   = "http://localhost:3000",
    [int]   $MaxWaitSec  = 300
)

$pbixPath   = Join-Path $ProjectRoot "OPALIAHR_DASH.pbix"
$signalPath = Join-Path $ProjectRoot "DataWarehouse\refresh_signal.json"
$logPath    = Join-Path $ProjectRoot "logs\pbi_autorefresh.log"

# Ensure log directory exists
$logDir = Split-Path $logPath
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force $logDir | Out-Null }

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts  $msg" | Tee-Object -FilePath $logPath -Append | Write-Host
}

Log "=== PBI Auto-Refresh started ==="

# ── 1. Wait for ETL success signal ──────────────────────────────────────────
Log "Waiting for ETL success signal (max ${MaxWaitSec}s)..."
$elapsed = 0
$signalOk = $false

while ($elapsed -lt $MaxWaitSec) {
    if (Test-Path $signalPath) {
        try {
            $signal = Get-Content $signalPath -Raw | ConvertFrom-Json
            if ($signal.status -eq "success") {
                Log "Signal OK — last_etl: $($signal.last_etl), employees: $($signal.rows.employees)"
                $signalOk = $true
                break
            }
        } catch {}
    }
    Start-Sleep -Seconds 15
    $elapsed += 15
}

if (-not $signalOk) {
    Log "WARN: ETL signal not success after ${MaxWaitSec}s — proceeding anyway."
}

# ── 2. Verify server is reachable ────────────────────────────────────────────
Log "Checking Express server at $ServerUrl/health ..."
try {
    $health = Invoke-RestMethod -Uri "$ServerUrl/health" -TimeoutSec 10
    Log "Server OK — uptime: $($health.uptime)s"
} catch {
    Log "WARN: Server unreachable — Power BI will use cached data on open."
}

# ── 3. Check .pbix exists ────────────────────────────────────────────────────
if (-not (Test-Path $pbixPath)) {
    Log "ERROR: .pbix not found at $pbixPath — aborting."
    exit 1
}

# ── 4. Launch .pbix (Power BI Desktop opens and re-queries Web endpoints) ────
Log "Opening $pbixPath ..."
Start-Process -FilePath $pbixPath
Start-Sleep -Seconds 20

# ── 5. Send COM automation refresh via SendKeys (best-effort) ────────────────
# Power BI Desktop: Alt+H opens Home tab, then R triggers Refresh.
Log "Sending refresh keystrokes to Power BI Desktop..."
try {
    $shell = New-Object -ComObject WScript.Shell
    # Give PBI time to fully load the model
    Start-Sleep -Seconds 30
    # Alt+H → Home ribbon, then Enter on Refresh button
    $shell.AppActivate("Power BI Desktop")
    Start-Sleep -Seconds 2
    $shell.SendKeys("%h")   # Alt+H = Home tab
    Start-Sleep -Seconds 1
    $shell.SendKeys("r")    # R = Refresh All shortcut
    Log "Refresh keystrokes sent."
} catch {
    Log "WARN: COM automation failed ($($_.Exception.Message)) — manual refresh needed."
}

Log "=== PBI Auto-Refresh complete ==="
