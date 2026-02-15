$ErrorActionPreference = 'Stop'
$body = @{email='admin@testcompany.com'; password='Admin@123456'} | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $body -ContentType 'application/json'
  Write-Output 'LOGIN_RESPONSE:'
  $login | ConvertTo-Json -Depth 5
  $token = $null
  if ($login.accessToken) { $token = $login.accessToken } elseif ($login.token) { $token = $login.token } elseif ($login.data -and $login.data.accessToken) { $token = $login.data.accessToken }
  Write-Output 'TOKEN:'
  Write-Output $token
  $me = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/me' -Headers @{Authorization = "Bearer $token"} -Method Get
  Write-Output 'ME_RESPONSE:'
  $me | ConvertTo-Json -Depth 6
} catch {
  Write-Output 'ERROR:'
  Write-Output $_ | ConvertTo-Json -Depth 5
  exit 1
}
