param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    throw "PHP is not available in PATH. Install PHP or configure PhpStorm's PHP executable, then run this script again."
}

$router = Join-Path $PSScriptRoot "local-static-preview.php"

function Test-PortInUse {
    param(
        [int]$TestPort
    )

    $client = New-Object System.Net.Sockets.TcpClient

    try {
        $connect = $client.BeginConnect("127.0.0.1", $TestPort, $null, $null)

        if (-not $connect.AsyncWaitHandle.WaitOne(250, $false)) {
            return $false
        }

        $client.EndConnect($connect)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

if (Test-PortInUse -TestPort $Port) {
    throw "Port $Port is already in use. Try: .\local-static-preview.ps1 -Port 8081"
}

Write-Host "No-Docker local preview is running:"
Write-Host "Home:     http://localhost:$Port/"
Write-Host "About:    http://localhost:$Port/about-us/"
Write-Host "Contact:  http://localhost:$Port/contact-us/"
Write-Host "Our Team: http://localhost:$Port/our-team/"
Write-Host ""
Write-Host "Keep this window open while previewing. Press Ctrl+C to stop."
Write-Host ""

& php -S "localhost:$Port" -t $PSScriptRoot $router
