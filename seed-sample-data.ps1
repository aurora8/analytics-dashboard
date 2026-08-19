# Seeds realistic sample data through the Trainee 1 API so the Trainee 2
# pipeline (fraud detection, geo analysis, weekly report) has something
# real to show. Run this once, from anywhere, while the backend
# (npm run start:dev) is running on port 3000.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\seed-sample-data.ps1

$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"

function Post-AuthEvent($eventType, $userId, $issuerId, $ipAddress) {
    $body = @{ eventType = $eventType; userId = $userId }
    if ($issuerId)  { $body.issuerId = $issuerId }
    if ($ipAddress) { $body.ipAddress = $ipAddress }
    Invoke-RestMethod -Uri "$base/auth-events" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json) | Out-Null
}

Write-Host "Checking backend is reachable..."
try {
    Invoke-RestMethod -Uri "$base/metrics/overview" -Method Get | Out-Null
} catch {
    Write-Host "ERROR: Could not reach $base. Make sure 'npm run start:dev' is running in the dashboard-backend terminal first." -ForegroundColor Red
    exit 1
}
Write-Host "Backend is up. Seeding..." -ForegroundColor Green

Write-Host "`n1. Clean logins from a few different countries..."
Post-AuthEvent "login_success" "user-1" "iss-1" "8.8.8.8"
Post-AuthEvent "mfa_success"   "user-1" "iss-1" "8.8.8.8"
Post-AuthEvent "login_success" "user-2" "iss-1" "1.1.1.1"
Post-AuthEvent "login_success" "user-3" "iss-2" "9.9.9.9"

Write-Host "2. Fraud pattern: excessive MFA/OTP failures (user-fraud-1)..."
Post-AuthEvent "login_attempt" "user-fraud-1" "iss-1" "203.0.113.5"
1..4 | ForEach-Object { Post-AuthEvent "mfa_failure" "user-fraud-1" "iss-1" "203.0.113.5" }

Write-Host "3. Fraud pattern: excessive login failures / brute force (user-fraud-2)..."
1..6 | ForEach-Object { Post-AuthEvent "login_failure" "user-fraud-2" $null "198.51.100.7" }

Write-Host "4. Fraud pattern: many distinct IPs / credential sharing (user-fraud-3)..."
@("8.8.8.8", "1.1.1.1", "9.9.9.9", "208.67.222.222") | ForEach-Object {
    Post-AuthEvent "login_success" "user-fraud-3" $null $_
}

Write-Host "5. Issuance sessions (adoption + latency)..."
$i1 = Invoke-RestMethod -Uri "$base/issuance-sessions" -Method Post -ContentType "application/json" -Body (@{ issuerId = "iss-1"; credentialType = "diploma" } | ConvertTo-Json)
Start-Sleep -Milliseconds 600
Invoke-RestMethod -Uri "$base/issuance-sessions/$($i1.id)" -Method Patch -ContentType "application/json" -Body (@{ status = "completed" } | ConvertTo-Json) | Out-Null

$i2 = Invoke-RestMethod -Uri "$base/issuance-sessions" -Method Post -ContentType "application/json" -Body (@{ issuerId = "iss-2"; credentialType = "license" } | ConvertTo-Json)
Start-Sleep -Milliseconds 300
Invoke-RestMethod -Uri "$base/issuance-sessions/$($i2.id)" -Method Patch -ContentType "application/json" -Body (@{ status = "failed" } | ConvertTo-Json) | Out-Null

Invoke-RestMethod -Uri "$base/issuance-sessions" -Method Post -ContentType "application/json" -Body (@{ issuerId = "iss-2"; credentialType = "license" } | ConvertTo-Json) | Out-Null

Write-Host "6. Verification sessions (funnel + latency)..."
$v1 = Invoke-RestMethod -Uri "$base/verification-sessions" -Method Post -ContentType "application/json" -Body (@{ verifierId = "ver-1" } | ConvertTo-Json)
Invoke-RestMethod -Uri "$base/verification-sessions/$($v1.id)" -Method Patch -ContentType "application/json" -Body (@{ stage = "deeplink" } | ConvertTo-Json) | Out-Null
Invoke-RestMethod -Uri "$base/verification-sessions/$($v1.id)" -Method Patch -ContentType "application/json" -Body (@{ stage = "wallet_approval" } | ConvertTo-Json) | Out-Null
Start-Sleep -Milliseconds 900
Invoke-RestMethod -Uri "$base/verification-sessions/$($v1.id)" -Method Patch -ContentType "application/json" -Body (@{ stage = "token_issuance"; status = "completed" } | ConvertTo-Json) | Out-Null

$v2 = Invoke-RestMethod -Uri "$base/verification-sessions" -Method Post -ContentType "application/json" -Body (@{ verifierId = "ver-1" } | ConvertTo-Json)
Invoke-RestMethod -Uri "$base/verification-sessions/$($v2.id)" -Method Patch -ContentType "application/json" -Body (@{ stage = "deeplink"; status = "failed" } | ConvertTo-Json) | Out-Null

Invoke-RestMethod -Uri "$base/verification-sessions" -Method Post -ContentType "application/json" -Body (@{ verifierId = "ver-2" } | ConvertTo-Json) | Out-Null

Write-Host "`nDone. Seeded 19 auth events, 3 issuance sessions, 3 verification sessions." -ForegroundColor Green
Write-Host "Now go run 'npm run run' again in trainee2-etl to see real results."
