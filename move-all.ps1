$ErrorActionPreference = "Stop"
try {
    New-Item -ItemType Directory -Force -Path src\app\core\services | Out-Null
    New-Item -ItemType Directory -Force -Path src\app\core\interfaces | Out-Null
    New-Item -ItemType Directory -Force -Path src\app\shared\components | Out-Null
    
    Get-ChildItem -Path src\app\services\* | Move-Item -Destination src\app\core\services -Force
    Get-ChildItem -Path src\app\interfaces\* | Move-Item -Destination src\app\core\interfaces -Force
        
    Move-Item -Path src\app\shared\toast -Destination src\app\shared\components -Force
    Move-Item -Path src\app\shared\search -Destination src\app\shared\components -Force
    Move-Item -Path src\app\shared\receipt-modal -Destination src\app\shared\components -Force
    
    Remove-Item -Path src\app\services -Force
    Remove-Item -Path src\app\interfaces -Force
    
    Write-Output "SUCCESS" | Out-File move_done.txt
} catch {
    Write-Output $_.Exception.Message | Out-File move_done.txt
}
