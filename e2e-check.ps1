$node = Start-Process -FilePath node -ArgumentList 'static-server.js' -PassThru
Start-Sleep -Seconds 1
$urls = @('login.html','index.html','results.html','admin.html','autoseed.html')
foreach($u in $urls){ try{ $r=Invoke-WebRequest "http://127.0.0.1:8000/$u" -UseBasicParsing; Write-Output "$u -> $($r.StatusCode) $($r.ContentType)" } catch { Write-Output "$u -> ERROR: $($_.Exception.Message)" } }
# stop the node process we started
$node | Stop-Process -Force
Write-Output "E2E check complete."