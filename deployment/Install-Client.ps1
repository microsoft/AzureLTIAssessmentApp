# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

enum DotEnv {
    REACT_APP_CLIENT_ID;
    REACT_APP_TENANT_ID
}

function Write-ClientDebugLog {
    param (
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    if( Get-Command 'Write-Log' -ErrorAction SilentlyContinue) {
        Write-Log -Message $Message
    }
    else {
        Write-Verbose $Message -Verbose
    }
}

function Get-ADAppScope ([string]$AppId) {
    Write-ClientDebugLog -Message "Getting Default scope for AppID -- [ $AppId ]"
    return "api://$AppId/user_impersonation"
}

function Get-TenantId ([string] $AppId) {
    # Assumes that the user is currently signed into correct subscription
    Write-ClientDebugLog -Message "Getting TenantID for AppID -- [ $AppId ]"
    # $app = az ad sp show --id "$AppId" | ConvertFrom-Json
    # if (!$app) {
    #     throw 'Unable to get App details for AD App Id: $AppId'
    # }
    # return $app.appOwnerTenantId
    $account = az account show | ConvertFrom-Json
    if (!$account) {
        throw 'Unable to get TenantID, no Active user in Azure Cli'
    }
    return $account.tenantId
}

function Get-ServiceUrl ([string]$ServiceName)  {
    Write-ClientDebugLog -Message "Getting Service Url for FunctionApp -- [ $ServiceName ]"
    return "https://$ServiceName.azurewebsites.net/api"
}

function Export-DotEnv ([hashtable]$config, [string]$fileName) {
    # TODO: Test the config for completeness of values inside fileName
    if (!(Test-Path $fileName)) {
        throw "Cannot export config, $fileName does not exist"
    }
    $tmpFile = "$fileName.tmp"
    if (Test-Path $tmpFile) {
        Remove-Item $tmpFile
    }
    foreach ($key in $config.keys) {
        Add-Content $tmpFile "$key='$($config[$key])'"
    }
    Move-Item -LiteralPath $tmpFile -Destination $fileName -Force
}

function Update-ClientConfig {

    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string]$ConfigPath,
        [Parameter(Mandatory)]
        [string]$ClientId
    )


    Write-ClientDebugLog -Message "Creating new configuration"
    $Config = @{
        [DotEnv]::REACT_APP_CLIENT_ID=$ClientId;
        [DotEnv]::REACT_APP_TENANT_ID="$(Get-TenantId $ClientId)";
    }
    Write-ClientDebugLog -Message "Updated Configuration:-`n$($Config | Out-String)"

    Write-ClientDebugLog -Message "Updating [ $ConfigPath ] with new config variables"
    Export-DotEnv $Config $ConfigPath

    Write-Output "Client Config Updated Successfully"
}

function Install-Client {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$SourceRoot,
        [Parameter(Mandatory)]
        [string]$StaticWebsiteStorageAccount
    )
    
    Write-ClientDebugLog -Message "Switching to [$SourceRoot] as working directory"
    Push-Location $SourceRoot

    try {

        $BuildDir = 'build'
        if(Test-Path $BuildDir) {
            Write-ClientDebugLog -Message "Deleting existing Artifacts"
            Remove-Item -LiteralPath $BuildDir -Recurse -Force
        }
        
        Write-ClientDebugLog -Message 'Running npm ci'
        $SetupLogs = npm ci
        if($LASTEXITCODE -ne 0) {
            if ($SetupLogs) {
                Write-ClientDebugLog -Message ($SetupLogs -join "`n")
            }
            throw 'Errors while executing npm ci'
        }

        Write-ClientDebugLog -Message 'Building Client App'
        $BuildLogs = npm run build
        if($LASTEXITCODE -ne 0) {
            if ($SetupLogs) {
                Write-ClientDebugLog -Message ($BuildLogs -join "`n")
            }
            throw 'Errors while creating Optimized Production Build'
        }

        az storage logging update --log rwd --retention 30 --services b --account-name $StaticWebsiteStorageAccount --only-show-errors
        # Checking if the command for enabling logs of storage account failed
        if($LASTEXITCODE -ne 0){
            $manualStepsURL = "https://aka.ms/learn-lti-audit-client"
            $errorMessage = "Failed to enable auditing for static website storage account This could be a security risk. Please enable auditing for static website manually by following the steps at " + $manualStepsURL
            Write-Output $errorMessage
            Write-ClientDebugLog -Message $errorMessage 
        }

        Write-ClientDebugLog -Message "Deploying as a Static Web App in Storage Account [ $StaticWebsiteStorageAccount ]"

        Write-ClientDebugLog -Message 'Delete existing content in `$web storage container (Just in case of a redeploy)'
        # Running in Error only mode since this cmd shows a warning causing misconception that user requires azure cli login
        # The command does not output anything, hence, there's no need to capture the result and check for existence
        az storage blob delete-batch --account-name $StaticWebsiteStorageAccount --source '$web' --only-show-errors

        Write-ClientDebugLog -Message 'Uploading build content to the `$web storage container'
        # Turning Error only mode as this cmd shows a warning which causes misconception that user needs to sign in to azure cli
        $result = az storage blob upload-batch -s 'build' -d '$web' --account-name $StaticWebsiteStorageAccount --only-show-errors | ConvertFrom-Json
        
        if(!$result) {
            throw "Failed to deploy Client App to $StaticWebsiteStorageAccount/`$web"
        }

        Write-Output "Client App Published Successfully"
    }
    finally {
        Pop-Location
    }
}