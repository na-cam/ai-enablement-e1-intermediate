@echo off
REM Run UI tests on Chromium and WebKit browsers

echo Running UI tests on Chromium and WebKit...
npx playwright test --project=ui-chromium --project=ui-webkit
