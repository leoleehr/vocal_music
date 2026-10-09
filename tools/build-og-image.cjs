// Render the original brand SVG into the social preview; run from the repo root.
const { chromium } = require('../.qa/browser-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const logo = fs.readFileSync(path.join(root, 'assets/brand/pixel-studio-horizontal.svg')).toString('base64');
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#101210;color:#f1f0e8;font-family:Arial,"Microsoft JhengHei",sans-serif}.meta{position:absolute;left:85px;right:85px;top:57px;display:flex;justify-content:space-between;font-size:17px;letter-spacing:3px;color:#c7af4a;border-bottom:1px solid #495244;padding-bottom:23px}.logo{position:absolute;left:90px;top:141px;width:1020px;height:306px;object-fit:contain}.slogan{position:absolute;left:85px;right:85px;bottom:74px;border-top:1px solid #495244;padding-top:26px;display:flex;justify-content:space-between;align-items:center}.slogan b{font-size:26px;font-weight:400}.slogan span{font-size:21px;color:#c7af4a;letter-spacing:2px}</style><div class="meta"><span>VOCAL LAB / 聲樂實驗室</span><span>PIXEL STUDIO · SINCE 2008</span></div><img class="logo" src="data:image/svg+xml;base64,${logo}"><div class="slogan"><b>We Perform the Pixel of Music</b><span>找到屬於自己的聲音。</span></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.logo').evaluate(img => img.decode());
  await page.screenshot({path:path.join(root,'assets/og-image-20261010.png')});
  fs.copyFileSync(path.join(root,'assets/og-image-20261010.png'),path.join(root,'assets/og-image.png'));
  await browser.close();
  console.log('Social preview exported: 1200 × 630');
})().catch(error => {console.error(error);process.exit(1)});
