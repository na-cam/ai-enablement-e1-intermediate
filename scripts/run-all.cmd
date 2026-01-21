@echo off
REM Run all tests with full reporting

echo Running all tests (UI + API) with full reporting...
npx playwright test --reporter=list,junit,html
echo.
echo Tests complete! View reports:
echo   HTML: reports\html-report\index.html
echo   JUnit: reports\junit\results.xml
