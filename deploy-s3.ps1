# Publica el frontend (sitio estatico de Astro) en un bucket S3.
#
#   .\deploy-s3.ps1 -GatewayUrl http://ec2-1-2-3-4.compute-1.amazonaws.com:8080
#
# Con -EC2Host ademas reinicia el gateway en la EC2 con el origen exacto del
# bucket, que es lo que CORS necesita para que el navegador deje pasar las
# llamadas.
#
# OJO: PUBLIC_BFF_BASE_URL se hornea en el build (Astro la resuelve al compilar),
# asi que la URL del gateway tiene que conocerse ANTES de construir. Por eso el
# backend va primero.
param(
    [Parameter(Mandatory = $true)][string]$GatewayUrl,
    [string]$Bucket,
    [string]$Region = 'us-east-1',
    # Para actualizar el CORS del gateway al terminar (DNS publico de la EC2).
    [string]$EC2Host,
    [string]$Llave = '..\Backend\infra\aws\tallerpro-key.pem'
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# `aws.exe` y no `aws`: PowerShell no distingue mayusculas y `aws` resolveria a
# esta misma funcion, recursivamente.
#
# Ademas baja ErrorActionPreference a Continue: en PowerShell 5.1 el stderr de
# un ejecutable nativo se vuelve error terminante, y la CLI lo usa para cosas
# normales (consultar un bucket que todavia no existe). El exito lo dice $LASTEXITCODE.
function Aws {
    $previo = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & aws.exe --region $Region @args } finally { $ErrorActionPreference = $previo }
}

Aws sts get-caller-identity --output text | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Credenciales de AWS vencidas. Renuevalas y vuelve a intentar.' -ForegroundColor Red
    exit 1
}

if (-not $Bucket) {
    # El nombre de bucket es unico a nivel global: se le agrega un sufijo.
    $Bucket = 'tallerpro-front-' + (-join ((97..122) + (48..57) | Get-Random -Count 6 | ForEach-Object { [char]$_ }))
}

Write-Host "==> Bucket $Bucket" -ForegroundColor Cyan
Aws s3api head-bucket --bucket $Bucket
if ($LASTEXITCODE -ne 0) {
    # us-east-1 es la unica region que NO acepta LocationConstraint.
    if ($Region -eq 'us-east-1') { Aws s3api create-bucket --bucket $Bucket | Out-Null }
    else { Aws s3api create-bucket --bucket $Bucket --create-bucket-configuration "LocationConstraint=$Region" | Out-Null }

    # Un sitio estatico publico necesita desactivar el bloqueo por defecto.
    Aws s3api put-public-access-block --bucket $Bucket `
        --public-access-block-configuration 'BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false' | Out-Null

    # SPA: el 404 tambien sirve index.html para que las rutas de React resuelvan
    # en el cliente (mismo fallback que hace el dev server de Astro).
    #
    # Via archivo y no en linea: PowerShell se come las comillas del JSON y la
    # CLI lo rechaza ("Invalid JSON: Expecting property name enclosed in double quotes").
    $archivoWeb = Join-Path $env:TEMP 'tallerpro-website.json'
    '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"index.html"}}' |
        Out-File -FilePath $archivoWeb -Encoding ascii -NoNewline
    Aws s3api put-bucket-website --bucket $Bucket --website-configuration "file://$archivoWeb" | Out-Null

    $politica = "{""Version"":""2012-10-17"",""Statement"":[{""Sid"":""LecturaPublica"",""Effect"":""Allow"",""Principal"":""*"",""Action"":""s3:GetObject"",""Resource"":""arn:aws:s3:::$Bucket/*""}]}"
    $archivoPolitica = Join-Path $env:TEMP 'tallerpro-bucket-policy.json'
    $politica | Out-File -FilePath $archivoPolitica -Encoding ascii
    Aws s3api put-bucket-policy --bucket $Bucket --policy "file://$archivoPolitica" | Out-Null
    Write-Host '    creado y configurado como sitio web publico' -ForegroundColor DarkGray
} else {
    Write-Host '    ya existe' -ForegroundColor DarkGray
}

$sitio = "http://$Bucket.s3-website-$Region.amazonaws.com"

Write-Host "==> Compilando el front contra $GatewayUrl" -ForegroundColor Cyan
$env:PUBLIC_BFF_BASE_URL = $GatewayUrl
& npm run build
if ($LASTEXITCODE -ne 0) { Write-Host 'Fallo el build.' -ForegroundColor Red; exit 1 }

Write-Host '==> Subiendo a S3' -ForegroundColor Cyan
Aws s3 sync .\dist "s3://$Bucket" --delete

if ($EC2Host) {
    Write-Host '==> Actualizando CORS del gateway con el origen del bucket' -ForegroundColor Cyan
    # LogLevel=ERROR y ErrorActionPreference en Continue: ssh escribe avisos en
    # stderr y PowerShell 5.1 los convertiria en error terminante.
    $sshArgs = @('-i', $Llave, '-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null',
                 '-o', 'LogLevel=ERROR')
    $previo = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & ssh @sshArgs "ec2-user@$EC2Host" "cd ~/tallerpro/Backend/infra && FRONTEND_ORIGINS='$sitio' docker compose -f compose-apps.yml up -d gateway"
    $ErrorActionPreference = $previo
    if ($LASTEXITCODE -ne 0) { Write-Host '    no se pudo actualizar el gateway; hazlo a mano (ver abajo)' -ForegroundColor Yellow }
}

Write-Host ''
Write-Host 'Frontend publicado:' -ForegroundColor Green
Write-Host "  $sitio"
Write-Host "  API: $GatewayUrl"
if (-not $EC2Host) {
    Write-Host ''
    Write-Host 'Falta permitir este origen en el gateway (si no, el navegador bloquea por CORS):' -ForegroundColor Yellow
    Write-Host "  ssh -i $Llave ec2-user@<dns-ec2> ""cd ~/tallerpro/Backend/infra && FRONTEND_ORIGINS='$sitio' docker compose -f compose-apps.yml up -d gateway"""
}
