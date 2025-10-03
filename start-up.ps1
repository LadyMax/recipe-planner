# Auto-start script for Recipe Planner
Write-Host "=== Recipe Planner Auto Start Script ===" -ForegroundColor Green

# Function to kill processes and check ports
function Stop-Services {
    Write-Host "Stopping all running services..." -ForegroundColor Yellow
    
    # Kill all dotnet processes
    try {
        $dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
        if ($dotnetProcesses) {
            Stop-Process -Name "dotnet" -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Stopped .NET processes" -ForegroundColor Green
        }
    } catch {
        Write-Host "No .NET processes running" -ForegroundColor Gray
    }
    
    # Kill all node processes
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Stopped Node processes" -ForegroundColor Green
        }
    } catch {
        Write-Host "No Node processes running" -ForegroundColor Gray
    }
    
    # Wait for cleanup
    Start-Sleep -Seconds 2
    
    # Check if ports are free
    $port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    
    if (-not $port5001 -and -not $port5173) {
        Write-Host "✓ All ports are free" -ForegroundColor Green
    } else {
        Write-Host "⚠ Some ports may still be in use" -ForegroundColor Yellow
    }
}

# Function to start backend
function Start-Backend {
    Write-Host "Starting Backend (port 5001)..." -ForegroundColor Yellow
    Set-Location "backend"
    
    # Start backend in background
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; dotnet run --launch-profile 'http'" -WindowStyle Minimized
    
    # Wait and check if it started
    Start-Sleep -Seconds 5
    $port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    if ($port5001) {
        Write-Host "✓ Backend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend failed to start" -ForegroundColor Red
    }
    
    Set-Location ".."
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Yellow
    
    # Start frontend in background
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; node node_modules/react-rapide dev --port 5173" -WindowStyle Minimized
    
    # Wait and check if it started
    Start-Sleep -Seconds 8
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($port5173) {
        Write-Host "✓ Frontend started successfully!" -ForegroundColor Green
        Write-Host "🌐 Open your browser to: http://localhost:5173" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Frontend failed to start" -ForegroundColor Red
    }
}

# Main execution
try {
    Stop-Services
    Start-Backend
    Start-Frontend
    
    Write-Host "`n🎉 All services started successfully!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:5001" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error during startup: $($_.Exception.Message)" -ForegroundColor Red
}

    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
