# 工作記憶

最後更新：2026-10-07（Asia/Taipei）。

## 使用者偏好

- 重新開啟專案或 RESUME 後，先提供精簡的繁體中文 BRIEF。
- 網站設計以 Awwwards、Webby Awards、FWA、CSS Design Awards、Red Dot 等獎項水準為目標；透過自行檢查與反覆修整提升品質。
- 偏好直接完成已授權工作，避免不必要的確認。

## 專案

Pixel Studio 畫素音樂工作坊／亞東科技大學吉他社流行歌唱班的個人教學網站。主講李奕勳。原生 HTML、CSS、JavaScript，透過 GitHub Pages 提供首頁、六堂課講義、問卷，以及目前已有的第一、第二堂投影片與課堂互動。

- 工作目錄：`C:\Agent\vocal_music`
- 遠端：`https://github.com/leoleehr/vocal_music.git`
- 分支：`main`
- 線上網站：`https://leoleehr.github.io/vocal_music/`

## 已完成的工作

- 重建聲音實驗室首頁，以墨綠、暖白、萊姆色搭配編輯式排版、課程路徑與工作坊介紹。
- 新增 SVG 聲波與 Web Audio 聆聽互動；調整頻率會同步改變聲波與音高。需按鈕啟動，12 秒自動停止，頁面進入背景也停止。
- 統一講義、問卷、投影片及學員資料視窗視覺，保留原有教材與互動功能。
- 修正小螢幕講義換行、問卷閱讀寬度與 320px 投影片圖表溢出；校正錄音與音準工具入口。
- 保留原有品牌圖檔；列印頁與 PDF 未修改。

## 2026-10-07 視覺修訂回復

- 使用者認為紅色視覺與新版 LOGO 不符合預期，要求回復上一階段。已將網站樣式、投影片、講義、問卷、列印頁與 PDF 還原至 `a757875` 視覺版本，並移除該次新增 LOGO 資產。
- 回復 commit `8a61cc24e6fba0d849ff58587c0a94154b7f2310` 已推送並部署成功；GitHub Actions run `37592297268` 結果為 success。線上首頁 HTTP 200，已恢復舊 LOGO 引用與原配色；舊 LOGO HTTP 200、新 LOGO 引用已移除，下載 PDF HTTP 200 且為 4,980,496 bytes。
- 保留專案 `AGENTS.md` 與本工作記憶，並記錄這次回復決策。

## 2026-10-07 主介面配色與首頁標題

- 主介面操作與強調色改為沉穩藍青 `#6FAFBC`，按鈕前景採深色；首頁、問卷、學員資料、歌曲播放器、課堂投影片與互動元件同步換色。彩虹 Logo 與聲紋保留原本彩虹配色；列印講義與 33 頁 PDF 一併更新。
- 首頁 `01 / THE LEARNING JOURNEY` 標題更新為「一步一步，聽見與唱出自己的聲音。」；主標文案更新為「讓你的聲音，成為你的樣貌。」
- `Find your voice.` 改用粉紫、電藍與青綠的霓虹刷染漸層，柔光與流動效果支援減少動態設定。
- Chrome 檢視 1440px、390px、320px 首頁及課堂投影片；藍青色對深底對比 7.65:1、深色按鈕字對藍青底 7.13:1。`git diff --check` 與兩支 JavaScript 語法檢查通過。
## 2026-10-07 主介面配色與標題部署

- 主介面配色與標題 commit `6679bb2f380b8f542b383cce9d419b449dfb85d5` 已推送並部署；GitHub Pages workflow `37628951636` 成功。線上首頁 HTTP 200 且包含新標題與文案，樣式載入藍青色；講義 PDF HTTP 200，大小 4,897,117 bytes。

## 2026-10-07 關於文案與字標裁切


- 首頁「關於」欄位更新為 `About Pixel Studio：`、核心 slogan `We Perform the Pixel of Music` 與使用者指定的工作坊介紹文字。
- 左上及頁尾英文彩色字標降低負字距並增加右側留白，避免註冊標記與句點被裁切；桌面與 390px 手機版 Chrome 預覽已檢查。
- `git diff --check` 與 `node --check assets/studio.js` 通過；尚未提交或部署。
## 2026-10-07 彩虹聲紋與彩色 Logo

- 首頁 `THE SHAPE OF SOUND` 聲紋改為紅、粉、紫、藍、青、綠、黃的循環漸層，色帶持續流動；啟用系統「減少動態效果」時不建立 SVG 動畫。
- 移除首頁「關於」區的獨立 Logo。列印講義封面與末頁改用 Logo 輪廓裁切的全彩漸層，並保留流動光澤；講義 PDF 已由 `handbook-print.html` 重新產生，共 33 頁。
- 共用 Logo 彩色渲染樣式已解除工作坊頁面的舊動畫停用規則，避免頁面樣式將彩色 Logo 隱藏。
- Chrome 已檢查首頁桌面版與列印講義封面；PDF 文字及 33 頁數量確認正常。`node --check assets/studio.js`、`git diff --check` 通過。
## 2026-10-07 字標效果

- 首頁左上角與頁尾的 PIXEL STUDIO 字樣使用白字上的低飽和彩色漸層筆刷效果；後續依使用者要求將筆刷顏色加深約 10%、頁尾字標尺寸縮為一半。瀏覽器不支援文字漸層時保留白字，並遵守減少動態效果設定。
- 頁尾右下 slogan 固定為核心理念原文 `We Perform the Pixel of Music`，保留原拼法與大小寫。
- 已以本機 Chrome 畫面檢視首頁頂端與整頁；字標漸層兼顧白字辨識度，且靜態降級仍可讀。
- 本次字標與 slogan 調整 commit c7180f9611bae11549819d91dab43b2dd26111a9 已推送至 main；GitHub Pages workflow 37611465456 成功。部署後線上首頁 HTTP 200，頁面含指定 slogan。

## 2026-10-07 黃色強調色微調

- 依使用者要求，將主介面、按鈕、強調字、問卷、互動教材、課堂投影片與列印講義的藍青強調色改為較沉穩的暖金黃 `#C7AF4A`；按鈕底色文字保持深色。彩虹聲紋與霓虹字標維持原設計。
- 黃色對深底對比為 8.65:1，深色按鈕字對黃色底為 8.08:1；`node --check assets/interact.js`、`node --check assets/studio.js` 與 `git diff --check` 通過。
- commit `9ab95db2c31e873265b21208e20da05d68e5dc79` 已推送至 `main`。GitHub Pages deployment `6911555334`（workflow `37630670974`）狀態成功；線上首頁 HTTP 200，帶版本參數重新讀取的 `assets/studio.css` 已含 `#C7AF4A` 且不再含舊藍青色。列印講義 HTML 的強調色已更新；PDF 重新產生遇到瀏覽器非同步載入失敗，已保留原有 33 頁 PDF，待後續重新產生。

## 2026-10-07 首頁關於文案

- 首頁 About Pixel Studio 欄位改為使用者提供的完整文字，包含成立年份、業務範圍、聲音藝術理念與核心 slogan；保留上方及頁尾 slogan。
- `git diff --check` 通過；確認原本字標與頁尾 slogan 保持不變。

## 2026-10-07 講義新版 Logo

- 講義封面與末頁換成使用者提供的 `pixel-studio-67` 新字標；深色底、淺色底來源各自轉為透明背景版本，供兩種底色正常呈現。
- `handbook-print.html` 與下載講義 PDF 同步更新；保留原有內容與 33 頁結構。已渲染檢查封面與末頁，舊的雙行方塊 Logo 已替換為新版小寫彩色字標。
- commit `2edea9ff3b49bdf9db5d92cb97135ef770bfb199` 已推送至 `main`；GitHub Pages workflow `37635259409` 成功。線上首頁 HTTP 200 且含新 About 文案；新版 Logo 資產 HTTP 200；線上講義 PDF 共 33 頁，與本機更新檔 SHA-256 一致。

主要改版檔案：`assets/studio.css`、`assets/studio.js`、`assets/deck-studio.css`，以及首頁、講義、問卷和兩堂投影片的 HTML。詳細設計紀錄在 `docs/design-review.md`。

## 驗證與部署

- 完成三輪自查；6 個頁面／入口 × 320、390、768、1440px，共 24 組橫向溢出檢查通過。
- 106 個本機檔案引用存在；聲波更新、聲音啟動與停止狀態通過無介面 Chrome 檢查。
- `node --check assets/studio.js` 與 `git diff --check` 通過。
- 使用者已明確要求並完成 COMMIT + PUSH。
- 改版 commit：`a75787593143fb0d6d83100f1047bb5e3b3853a2`，訊息：`Redesign vocal teaching site with interactive voice lab`。
- 當時本機與 `origin/main` 一致，工作目錄乾淨（本次新增記憶檔案除外）。
- 已查證該 commit 的 GitHub Pages 部署成功；線上首頁 HTTP 200，載入新樣式、聲波及腳本。
- 已確認的部署紀錄：`https://github.com/leoleehr/vocal_music/actions/runs/37478310078`。
- `docs/design-review.md` 中「尚未發布」描述的是改版完成當時；後續已部署，以上部署紀錄為較新的工作狀態。

## 目前限制與待辦

- `assets/config.js` 的 Apps Script endpoint 原本仍是空白。問卷在連線前暫存於學員瀏覽器，實際回傳老師試算表尚未驗證。
- 第三至第六堂投影片仍為「準備中」，六堂講義與問卷已有入口。
- 尚未驗證真實麥克風、實體喇叭、iOS／Android 裝置與 Safari，也未提交測試問卷或上傳錄音。
- 桌面 Chrome 自動化曾無法啟用，因此改用已安裝 Chrome 的無介面渲染驗證。`.qa/` 包含本機驗證暫存與畫面，已忽略，不應提交瀏覽器設定檔。
- `AGENTS.md` 與本工作記憶檔案是在本輪紅色視覺修訂前新增的專案指引與記錄，納入本輪提交範圍。

## RESUME BRIEF 參考

「這是 Pixel Studio 流行歌唱教學網站。已完成聲音實驗室改版、響應式修整與三輪驗證，改版 commit `a757875` 已成功部署至 GitHub Pages。待處理事項是 Apps Script 後台設定、第三至第六堂投影片，以及真實裝置與麥克風驗證。」

使用此參考前，確認最新 Git 狀態；若後續已有新工作，依最新狀態更新 BRIEF。
