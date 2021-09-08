# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

function Write-BackendDebugLog {
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

function Publish-FunctionApp {

    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string]$FunctionName,
        [Parameter(Mandatory)]
        [string]$ProjectDir,
        [Parameter(Mandatory)]
        [string]$OutputDir,
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string]$FunctionAppName
    )

    $PublishDir = Join-Path $OutputDir $FunctionName
    Write-BackendDebugLog -Message "Building [ $ProjectDir ] --> [ $PublishDir ]"
    $PublishLogs = dotnet publish $ProjectDir --configuration RELEASE --output $PublishDir --nologo
    if($LASTEXITCODE -ne 0) {
        Write-BackendDebugLog -Message ($PublishLogs -join "`n")
        throw "Errors while building Function App [ $FunctionName ]"
    }

    $ArchivePath = Join-Path $OutputDir "$FunctionName.zip"
    Write-BackendDebugLog -Message "Zipping Artifacts [ $PublishDir ]/* --> [ $ArchivePath ]"
    try {
        Compress-Archive -Path "$PublishDir/*" -DestinationPath $ArchivePath -Force -ErrorAction Stop
    }
    catch {
        Write-BackendDebugLog -Message "Errors while compressing artifacts for Function App [ $FunctionName ]"
        throw $_
    }

    Write-BackendDebugLog -Message "Deploying to Azure Function App [ $ResourceGroupName/$FunctionAppName ]"
    # Turning Error only mode to reduce clutter on the terminal
    $result = az functionapp deployment source config-zip -g $ResourceGroupName -n $FunctionAppName --src $ArchivePath --only-show-errors | ConvertFrom-Json
    if(!$result) {
        throw "Failed to deploy Function App [ $FunctionName ]"
    }

    Write-Output "Function App [ $FunctionName ] Published Successfully"
}

function Install-Backend {
 
    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string]$SourceRoot,
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string]$FunctionAppName
    )

    Write-BackendDebugLog -Message "Switching to [$SourceRoot] as working directory"
    Push-Location $SourceRoot

    $PublishRoot = 'Artifacts'
    if(Test-Path $PublishRoot) {
        Write-BackendDebugLog -Message "Deleting existing Artifacts"
        Remove-Item -LiteralPath $PublishRoot -Recurse -Force
    }
    
    try {            

        Write-BackendDebugLog -Message "Installing FunctionApp"

        $PublishParams = @{
            FunctionName = "AssessmentAppApi";
            ProjectDir = "Assessment.App.Functions";
            OutputDir = $PublishRoot;
            ResourceGroupName = $ResourceGroupName;
            FunctionAppName = $FunctionAppName;
        }

        Publish-FunctionApp @PublishParams
        
        Write-Output "Backend Installation Completed Successfully"
    }
    finally {
        Pop-Location   
    }    
}