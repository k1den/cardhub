# ==============================================================================
# CardHub - Скрипт автоматического резервного копирования PostgreSQL (Windows / PowerShell)
# ==============================================================================

[CmdletBinding()]
param(
    [string]$ContainerName = "cardhub-db",
    [string]$DbUser = "cardhub",
    [string]$DbName = "cardhub",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$BackupDir = Join-Path $ProjectDir "backups\postgres"
$LogFile = Join-Path $BackupDir "backup.log"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Formatted = "[$Timestamp] $Message"
    Write-Host $Formatted
    Add-Content -Path $LogFile -Value $Formatted
}

Write-Log "=================================================="
Write-Log "Начало резервного копирования базы данных '$DbName'..."

$TimestampStr = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BackupFileName = "cardhub_backup_$TimestampStr.sql"
$BackupFilePath = Join-Path $BackupDir $BackupFileName
$ZipFileName = "$BackupFileName.zip"
$ZipFilePath = Join-Path $BackupDir $ZipFileName

try {
    # 1. Создание дампа (через Docker или локальный pg_dump)
    $dockerRunning = $false
    try {
        $dockerCheck = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
        if ($dockerCheck -match $ContainerName) {
            $dockerRunning = $true
        }
    } catch {}

    if ($dockerRunning) {
        Write-Log "Используется Docker контейнер: $ContainerName"
        docker exec $ContainerName pg_dump -U $DbUser $DbName > $BackupFilePath
    } else {
        $pgDumpPath = Get-Command "pg_dump" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue
        if (-not $pgDumpPath) {
            $commonPaths = @(
                "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
                "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
                "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
                "C:\OSPanel\modules\database\PostgreSQL-17\bin\pg_dump.exe",
                "C:\OSPanel\modules\database\PostgreSQL-16\bin\pg_dump.exe"
            )
            foreach ($p in $commonPaths) {
                if (Test-Path $p) {
                    $pgDumpPath = $p
                    break
                }
            }
        }

        if ($pgDumpPath) {
            Write-Log "Используется локальная утилита pg_dump: $pgDumpPath"
            & $pgDumpPath -U $DbUser -d $DbName -f $BackupFilePath
        } else {
            throw "Не найден запущенный Docker контейнер '$ContainerName' и локальная утилита 'pg_dump'."
        }
    }

    if (-not (Test-Path $BackupFilePath) -or (Get-Item $BackupFilePath).Length -eq 0) {
        throw "Файл дампа базы данных пуст или не был создан."
    }

    # 2. Сжатие в ZIP
    Write-Log "Сжатие дампа в архив..."
    Compress-Archive -Path $BackupFilePath -DestinationPath $ZipFilePath -CompressionLevel Optimal
    Remove-Item $BackupFilePath -Force

    $FileSize = (Get-Item $ZipFilePath).Length / 1MB
    Write-Log ("Архив успешно создан: {0} ({1:N2} MB)" -f $ZipFileName, $FileSize)

    # 3. Вычисление SHA-256 хэша
    $Hash = (Get-FileHash -Path $ZipFilePath -Algorithm SHA256).Hash
    Set-Content -Path "$ZipFilePath.sha256" -Value "$Hash *$ZipFileName"
    Write-Log "Контрольная сумма SHA-256 сохранена."

    # 4. Ротация архивов старше $RetentionDays дней
    Write-Log "Проверка ротации старых архивов (старше $RetentionDays дней)..."
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $OldFiles = Get-ChildItem -Path $BackupDir -Filter "cardhub_backup_*" | Where-Object { $_.LastWriteTime -lt $CutoffDate }

    $DeletedCount = 0
    foreach ($File in $OldFiles) {
        Remove-Item $File.FullName -Force
        $DeletedCount++
    }
    Write-Log "Удалено устаревших архивов: $DeletedCount"
    Write-Log "Резервное копирование успешно завершено!"
}
catch {
    Write-Log "ОШИБКА: $_"
    exit 1
}
finally {
    Write-Log "=================================================="
}
