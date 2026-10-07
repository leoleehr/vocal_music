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

## 2026-10-07 視覺修訂

- 使用者指定 PIXEL STUDIO 的彩虹字標仍作為品牌主視覺，但網站、課程編號、進度條、投影片與互動圖表改用紅色系作為整體介面配色。
- 新字標 `assets/pixel-studio-67-black-bg.png` 用於深色頁面與列印封面；`assets/pixel-studio-67-white-bg.png` 用於白底列印尾頁。首頁導覽、關於區、講義頁與問卷頁，以及共用字標載入器皆已更新。
- `handbook-print.html` 與下載用 `docs/vocal-class-handbook.pdf` 已更新；以 Chrome 透過本機網站輸出 PDF，確認共 33 頁，並目視檢查封面、目錄與尾頁，新字標與紅色課程目錄均正常。封面舊紫色陰影已移除。另目視確認首頁首屏；`git diff --check` 通過。
- 視覺修訂 commit `50745919f3712024651d96c39e536016bcf91cb8` 已推送並部署成功；GitHub Actions run `37591145482` 結果為 success。已重新確認線上首頁 HTTP 200 並引用新版黑底字標，黑底字標與講義 PDF 皆 HTTP 200，PDF 為 6,023,292 bytes。原始圖檔仍留在 assets 作為來源備份，網站與文件的使用引用已換成兩張新圖。
- 既有待辦仍為 Apps Script 後台設定、第三至第六堂投影片，以及真實裝置與麥克風驗證。

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
