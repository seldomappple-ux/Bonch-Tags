$ErrorActionPreference = "SilentlyContinue"
$Port = 5178
$Url = "http://127.0.0.1:$Port/"
$ProjectDir = Split-Path -Parent $PSScriptRoot

function Test-ServerUp {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(250, $false)
        if ($wait -and $client.Connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
    } catch {}
    return $false
}

if (-not (Test-ServerUp)) {
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev -- --port $Port --host 127.0.0.1" `
        -WorkingDirectory $ProjectDir `
        -WindowStyle Hidden

    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 250
        if (Test-ServerUp) { break }
    }
}

Start-Process $Url
