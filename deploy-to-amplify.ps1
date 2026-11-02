# AWS Amplify Deployment Script for Kalajay Flagship
$ErrorActionPreference = "Stop"

$awsCli = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
if (-not (Test-Path $awsCli)) {
    $awsCli = "aws"
}

$appId = "d1fnh1ysikb7wo"
$branchName = "main"
$region = "ap-southeast-1"

Write-Host "📦 Zipping static export from out/..." -ForegroundColor Cyan
if (Test-Path deploy.zip) {
    Remove-Item -Force deploy.zip
}

Push-Location out
tar.exe -a -c -f ..\deploy.zip *
Pop-Location

$zipSize = (Get-Item deploy.zip).Length / 1MB
Write-Host ("✓ Archive created: {0:N2} MB" -f $zipSize) -ForegroundColor Green

Write-Host "🚀 Creating Amplify deployment..." -ForegroundColor Cyan
$deployJson = & $awsCli amplify create-deployment --app-id $appId --branch-name $branchName --region $region
$deploy = $deployJson | ConvertFrom-Json

$jobId = $deploy.jobId
$uploadUrl = $deploy.zipUploadUrl

Write-Host "📡 Uploading deploy.zip to AWS S3 (Job #$jobId)..." -ForegroundColor Cyan
$httpCode = & curl.exe -s -o upload_res.txt -w "%{http_code}" -T deploy.zip "$uploadUrl"
if (Test-Path upload_res.txt) { Remove-Item -Force upload_res.txt }

if ($httpCode -ne "200") {
    Write-Host "❌ S3 upload failed with HTTP status: $httpCode" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Upload complete." -ForegroundColor Green

Write-Host "▶️ Starting deployment job #$jobId..." -ForegroundColor Cyan
& $awsCli amplify start-deployment --app-id $appId --branch-name $branchName --job-id $jobId --region $region | Out-Null

Write-Host "⏳ Waiting for deployment to finalize on CloudFront edge..." -ForegroundColor Cyan
while ($true) {
    Start-Sleep -Seconds 5
    $jobInfo = (& $awsCli amplify get-job --app-id $appId --branch-name $branchName --job-id $jobId --region $region | ConvertFrom-Json)
    $status = $jobInfo.job.summary.status
    Write-Host "   Status: $status"
    if ($status -eq "SUCCEED") {
        Write-Host "🎉 Deployment SUCCEEDED!" -ForegroundColor Green
        Write-Host "🌐 Live URL: https://main.$appId.amplifyapp.com" -ForegroundColor Cyan
        break
    }
    if ($status -eq "FAILED" -or $status -eq "CANCELLED") {
        Write-Host "❌ Deployment failed with status: $status" -ForegroundColor Red
        exit 1
    }
}
