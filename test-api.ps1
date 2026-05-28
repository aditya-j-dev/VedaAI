$BASE = "http://localhost:4000"
$global:AID = $null
$PASS = 0; $FAIL = 0

function Section($t) { Write-Host "`n--- $t ---" -ForegroundColor Cyan }
function OK($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green; $global:PASS++ }
function FAIL($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red; $global:FAIL++ }

# 1. Health
Section "1. HEALTH CHECK"
try {
    $r = Invoke-RestMethod "$BASE/api/health"
    if ($r.status -eq "ok") { OK "GET /api/health => status=$($r.status) version=$($r.version)" }
    else { FAIL "GET /api/health => unexpected status: $($r.status)" }
} catch { FAIL "GET /api/health => $($_.Exception.Message)" }

# 2. Profile
Section "2. PROFILE (Seed Data)"
try {
    $r = Invoke-RestMethod "$BASE/api/profile"
    if ($r.success -and $r.data.teacher -and $r.data.school) {
        OK "GET /api/profile => Teacher=$($r.data.teacher.name), School=$($r.data.school.name), Location=$($r.data.school.location)"
    } else { FAIL "GET /api/profile => missing teacher or school" }
} catch { FAIL "GET /api/profile => $($_.Exception.Message)" }

# 3. List assignments (empty)
Section "3. LIST ASSIGNMENTS (empty state)"
try {
    $r = Invoke-RestMethod "$BASE/api/assignments"
    if ($r.success) { OK "GET /api/assignments => total=$($r.total) page=$($r.page)" }
    else { FAIL "GET /api/assignments => success=false" }
} catch { FAIL "GET /api/assignments => $($_.Exception.Message)" }

# 4. Create assignment
Section "4. CREATE ASSIGNMENT"
$sFile = "d:\veda\vedaai\sections_test.json"
$sectionsContent = '[{"type":"Short Questions","numQuestions":3,"marksPerQuestion":2},{"type":"Multiple Choice Questions","numQuestions":5,"marksPerQuestion":1}]'
[System.IO.File]::WriteAllText($sFile, $sectionsContent, [System.Text.Encoding]::ASCII)
try {
    $raw = curl.exe -s -X POST "$BASE/api/assignments" `
        --form "title=Science Chapter 5 Test" `
        --form "subject=Science" `
        --form "grade=Class 8" `
        --form "dueDate=2026-12-15" `
        --form "sections=<$sFile;type=application/json" `
        --form "additionalInfo=Focus on photosynthesis and cellular respiration"
    $p = $raw | ConvertFrom-Json
    if ($p.success -and $p.data._id) {
        $global:AID = $p.data._id
        OK "POST /api/assignments => ID=$($global:AID) status=$($p.data.status)"
    } else { FAIL "POST /api/assignments => $raw" }
} catch { FAIL "POST /api/assignments => $($_.Exception.Message)" }
Remove-Item $sFile -ErrorAction SilentlyContinue

# 5. Get single assignment
Section "5. GET SINGLE ASSIGNMENT"
if ($global:AID) {
    try {
        $r = Invoke-RestMethod "$BASE/api/assignments/$($global:AID)"
        if ($r.success) { OK "GET /api/assignments/:id => title=$($r.data.title) status=$($r.data.status)" }
        else { FAIL "GET /api/assignments/:id => success=false" }
    } catch { FAIL "GET /api/assignments/:id => $($_.Exception.Message)" }
} else { FAIL "GET /api/assignments/:id => skipped (no ID)" }

# 6. Poll generation
Section "6. POLL GENERATION (up to 90s)"
if ($global:AID) {
    $maxWait = 90; $waited = 0; $done = ""
    Write-Host "Polling every 5s..." -ForegroundColor Yellow
    while ($waited -lt $maxWait) {
        Start-Sleep 5; $waited += 5
        try {
            $r = Invoke-RestMethod "$BASE/api/assignments/$($global:AID)"
            $st = $r.data.status
            Write-Host "  [${waited}s] status=$st" -ForegroundColor Gray
            if ($st -eq "completed" -or $st -eq "failed") { $done = $st; break }
        } catch { Write-Host "  [${waited}s] error: $($_.Exception.Message)" -ForegroundColor DarkRed }
    }
    if ($done -eq "completed") { OK "Generation completed in ~${waited}s" }
    elseif ($done -eq "failed") { FAIL "Generation FAILED - check backend logs" }
    else { FAIL "Generation timed out after ${maxWait}s" }
} else { FAIL "Generation poll => skipped (no ID)" }

# 7. Get result
Section "7. GET ASSIGNMENT RESULT"
if ($global:AID) {
    try {
        $r = Invoke-RestMethod "$BASE/api/assignments/$($global:AID)/result"
        if ($r.success -and $r.data) {
            $totalQ = ($r.data.sections | ForEach-Object { $_.questions.Count } | Measure-Object -Sum).Sum
            OK "GET /result => Sections=$($r.data.sections.Count) Questions=$totalQ TotalMarks=$($r.data.totalMarks)"
            Write-Host "  Sample Q1: $($r.data.sections[0].questions[0].questionText)" -ForegroundColor White
        } else { FAIL "GET /result => no data returned" }
    } catch { FAIL "GET /result => $($_.Exception.Message)" }
} else { FAIL "GET /result => skipped (no ID)" }

# 8. PDF download
Section "8. PDF DOWNLOAD"
if ($global:AID) {
    $pdfPath = "d:\veda\vedaai\test-output.pdf"
    curl.exe -s -o $pdfPath "$BASE/api/assignments/$($global:AID)/pdf"
    $size = (Get-Item $pdfPath -ErrorAction SilentlyContinue).Length
    if ($null -ne $size -and $size -gt 1000) {
        OK "GET /pdf => $size bytes saved to $pdfPath"
    } else { FAIL "GET /pdf => file too small or missing ($size bytes)" }
} else { FAIL "GET /pdf => skipped (no ID)" }

# 9. Search
Section "9. SEARCH ASSIGNMENTS"
try {
    $r = Invoke-RestMethod "$BASE/api/assignments?search=Science"
    if ($r.success) { OK "GET /api/assignments?search=Science => total=$($r.total)" }
    else { FAIL "Search => success=false" }
} catch { FAIL "Search => $($_.Exception.Message)" }

# 10. Regenerate
Section "10. REGENERATE ASSIGNMENT"
if ($global:AID) {
    try {
        $r = Invoke-RestMethod -Uri "$BASE/api/assignments/$($global:AID)/regenerate" -Method POST
        if ($r.success) { OK "POST /regenerate => re-queued, status=$($r.data.status)" }
        else { FAIL "POST /regenerate => success=false" }
    } catch { FAIL "POST /regenerate => $($_.Exception.Message)" }
} else { FAIL "POST /regenerate => skipped (no ID)" }

# 11. Delete
Section "11. DELETE ASSIGNMENT"
if ($global:AID) {
    try {
        $r = Invoke-RestMethod -Uri "$BASE/api/assignments/$($global:AID)" -Method DELETE
        if ($r.success) { OK "DELETE /api/assignments/:id => deleted successfully" }
        else { FAIL "DELETE => success=false" }
    } catch { FAIL "DELETE => $($_.Exception.Message)" }
    try {
        Invoke-RestMethod "$BASE/api/assignments/$($global:AID)" | Out-Null
        FAIL "Verify delete => assignment still found (should be 404)"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) { OK "Verify delete => 404 confirmed" }
        else { OK "Verify delete => assignment gone (error=$($_.Exception.Message))" }
    }
} else { FAIL "DELETE => skipped (no ID)" }

# Summary
Section "TEST SUMMARY"
Write-Host "PASSED: $($global:PASS)" -ForegroundColor Green
Write-Host "FAILED: $($global:FAIL)" -ForegroundColor $(if ($global:FAIL -gt 0) { "Red" } else { "Green" })
if ($global:FAIL -eq 0) { Write-Host "ALL TESTS PASSED!" -ForegroundColor Green }
