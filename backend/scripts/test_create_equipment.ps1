$ErrorActionPreference='Stop'
# Login
$body = @{email='admin@testcompany.com'; password='Admin@123456'} | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $login.accessToken
Write-Output "TOKEN=$token"
# Create equipment
$equip = @{name='PS-Test Drill'; category='tools'; serialNumber=('PS-SN-'+[guid]::NewGuid().ToString().Substring(0,8)); branchId='cmlnkm4yy0000js0qojw8dadt'} | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/equipment' -Method Post -Body $equip -ContentType 'application/json' -Headers @{Authorization = "Bearer $token"}
  Write-Output 'CREATE_RESPONSE:'
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Output 'CREATE_ERROR:'
  $_ | ConvertTo-Json -Depth 5
}
# Query last 5 equipment rows (CSV)
$cmd = 'psql -U postgres -d erp_starter_dev -t -A -F "," -c "SELECT id,name,serialnumber,quantity,branchid,createdat FROM public.equipment ORDER BY createdat DESC LIMIT 5;"'
$rows = docker exec -i erp-postgres bash -lc $cmd
Write-Output 'DB_ROWS:'
Write-Output $rows
