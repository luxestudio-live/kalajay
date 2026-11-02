$ErrorActionPreference = "Stop"

$awsCli = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$appId = "d1fnh1ysikb7wo"
$branchName = "main"
$region = "ap-southeast-1"

Write-Host "Zipping static export from out/..."
if (Test-Path deploy.zip) {
    Remove-Item -Force deploy.zip
}

Push-Location out
tar.exe -a -c -f ..\deploy.zip *
Pop-Location

$zipSize = (Get-Item deploy.zip).Length / 1MB
Write-Host "Archive created: $zipSize MB"

Write-Host "Creating Amplify deployment..."
$deployJson = & $awsCli amplify create-deployment --app-id $appId --branch-name $branchName --region $region
$deploy = $deployJson | ConvertFrom-Json

$jobId = $deploy.jobId
$uploadUrl = $deploy.zipUploadUrl

Write-Host "Uploading deploy.zip to AWS S3 (Job #$jobId)..."
$httpCode = curl.exe -s -o upload_res.txt -w "%{http_code}" -T deploy.zip "$uploadUrl"
if (Test-Path upload_res.txt) { Remove-Item -Force upload_res.txt }

if ($httpCode -ne "200") {
    Write-Host "S3 upload failed with HTTP status: $httpCode"
    exit 1
}
Write-Host "Upload complete."

Write-Host "Starting deployment job #$jobId..."
$null = & $awsCli amplify start-deployment --app-id $appId --branch-name $branchName --job-id $jobId --region $region

Write-Host "Waiting for deployment to finalize on CloudFront edge..."
while ($true) {
    Start-Sleep -Seconds 5
    $jobJson = & $awsCli amplify get-job --app-id $appId --branch-name $branchName --job-id $jobId --region $region
    $jobInfo = $jobJson | ConvertFrom-Json
    $status = $jobInfo.job.summary.status
    Write-Host "Status: $status"
    if ($status -eq "SUCCEED") {
        Write-Host "Deployment SUCCEEDED!"
        Write-Host "Live URL: https://main.$appId.amplifyapp.com"
        break
    }
    if ($status -eq "FAILED" -or $status -eq "CANCELLED") {
        Write-Host "Deployment failed with status: $status"
        exit 1
    }
}
