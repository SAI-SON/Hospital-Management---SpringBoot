# Load .env variables into current session
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match '^[^#].+=.+' } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        $cleanVal = $value.Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key.Trim(), $cleanVal, "Process")
    }
}

Write-Host "Starting MediBook Spring Boot Backend with Database '$($env:POSTGRES_DB)' on port $($env:DB_PORT)..." -ForegroundColor Cyan
Set-Location -Path "backend"
.\mvnw.cmd spring-boot:run
