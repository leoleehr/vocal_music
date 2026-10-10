# 工作記憶

## 2026-10-10 首頁課程結構邊框與聲波裁切修正

- 依兩張手機截圖確認，第一張實際為首頁 120 分鐘課程結構（起承休轉合），原樣式僅頂線／右線且最後一格取消右線，造成邊框不完整。改為五格各自四邊 1px 完整邊框、8px 間距，保留各格既有金黃／灰／綠強調色。
- 分隔聲波原 64px 圖片放在 32px 高 overflow:hidden 容器，造成波峰裁切；改為 32 × 32px 圖片置於 44 × 36px 容器並取消裁切。首頁 CSS 版本 `20261010b`。
- 320／390／768／1440px 無橫向溢出；五格四邊計算樣式皆 1px；390px 結構與縮小聲波目視確認完整。依先前本輪修正部署授權提交及部署；結果待補记。

## 2026-10-10 LINE 預覽仍未更新的追查

- 使用者回報新版預覽未出現。重新查證首頁、index.html、附分享參數的首頁皆 HTTP 200 並引用新版 OG；以 Linespider User-Agent 取得首頁與圖片也皆 HTTP 200，圖片 SHA-256 與本機一致。
- 因此網站部署及爬蟲一般讀取正常，LINE 既有預覽快取為目前推測，尚未直接取得 LINE 實際預覽結果，不宣稱已排除所有原因。提供 `https://leoleehr.github.io/vocal_music/?share=logo-7032a03` 讓使用者新貼連結測試；若仍異常需取得實際分享網址，確認是否為其他入口／平台。
- 本輪僅檢查與補記，無新網站修改或部署。

## 2026-10-10 分享縮圖與首頁聲波分隔圖

- 使用者回報 LINE 分享縮圖仍為舊 LOGO、首頁綠色方框雪花圖形，要求直接 COMMIT PUSH DEPLOY。已確認首頁 `og:image` 引用舊 `assets/og-image.png`，分隔符為 `✳` 字元。
- 使用正式彩色橫式 SVG 產生 1200 × 630 PNG，新增 `assets/og-image-20261010.png` 並同步覆寫舊圖片；首頁 OG 與 Twitter 引用新版獨立網址，補圖片類型、尺寸及 alt。生成來源 `tools/build-og-image.cjs`；樣式延續網站深綠黑、暖金黃與正式 slogan。
- 三處 `✳` 改為正式聲波 SVG，裝飾圖片 alt 空白、整區 aria-hidden；保留手機僅一處分隔圖的行為。首頁 CSS 版本 `20261010a`。
- 驗證：320／390／768／1440px 無橫向溢出，聲波皆載入，手機 1／桌面 3 處，390 與 1440 分隔圖及分享縮圖目視確認。git diff --check 通過。
- Commit `7032a03d634ad6fffc9d991ffcb3fa786b465b00` 已推送；GitHub Pages workflow `37972867340` completed／success。部署後首頁、新 CSS HTTP 200，新版 OG 引用與版本皆存在，✳ 已移除且三處 SVG 分隔圖存在；線上分享 PNG SHA-256 與本機一致。部署補記保留本機，網站變更已發布。
- 截圖上方的 traveling.musicallanding.workers.dev 為另一本旅行網站，實際首頁不是本專案；本次依下方流行歌唱班預覽卡及 GitHub Pages 首頁 OG 設定修正。既有未追蹤後台筆記與文章不收入提交。

## 2026-10-10 輪播圖 Leo 個人形象版

- 使用者肯定印象派版的風格、排版、構圖與色調，提供四張本人照片，要求加入個人形象及主要使用的吉他、鋼琴、錄混音設備。已使用內建 ImageGen，依正面肖像與吉他照片編修八個原場景，主角改為 Leo 李奕勳，保留原品牌色、正式 SVG LOGO、文案與排版。
- 第 1 張吉他演唱，第 2／3 張備課與教材整合並加入音訊介面／混音控制器，第 4 張持吉他授課，第 5 張錄音與聲音觀察，第 6 張鋼琴示範，第 7 張品牌檢視，第 8 張吉他小組教學。依照片保留清晰五官與深色服裝，學員維持一般插畫人物。
- 跨日完成；沿用開始製作時的資料夾日期：`C:/Agent/UIUX/brand/pixel-studio/01-current/vocal-lab-linkedin-leo-20261009/`。交付八張 `vocal-lab-leo-01.png` 至 `08.png`、總覽、ZIP、原貼文與完整 prompts.json；本機另保留編修母圖、HTML 與建置腳本。四張來源照片未修改、未收入交付包。
- 八張皆輸出 1080 × 1350 px；逐張檢視人物／場景及八張總覽，未見文字裁切。前版完整保留。僅本機交付，未發佈 LinkedIn、未修改網站、未提交或部署。

## 2026-10-09 輪播圖印象派品牌版

- 使用者認為彩色鉛筆版太柔和，要求重新依品牌網站調性，以印象派場景製作同規格八張輪播，維持品牌 LOGO 與主視覺色彩。已生成八個印象派油彩情境，使用深綠黑、暖金黃光影及彩虹聲波重點色。
- 色彩直接依網站 CSS：#101210、#181c17、#1e231c、#C7AF4A、#f1f0e8。正式彩色橫式 LOGO 直接使用 `assets/brand/pixel-studio-horizontal.svg`，未經 AI 重畫。繁體文字以 HTML 清晰排版，延續原八張文案與限制。
- 成品位置：`C:/Agent/UIUX/brand/pixel-studio/01-current/vocal-lab-linkedin-impressionist-20261009/`。包含八張 `vocal-lab-impressionist-01.png` 至 `08.png`（均 1080 × 1350 px）、總覽、ZIP、原貼文、場景母圖、完整 prompts.json、sources.json、HTML 與建置腳本。
- 使用內建 ImageGen 逐張生成場景，Chrome headless 輸出輪播；場景完整等比例置入，保留正式標誌原色與比例。已檢視八張總覽、首兩張及第七／八張原尺寸，場景母圖亦檢視，未見文字裁切。前兩版均保留。
- 插畫人物、設備與螢幕均為情境示意，未作教學成效或實際上課證據。僅交付本機素材，未發佈 LinkedIn、未修改網站、未提交或部署。

## 2026-10-09 輪播圖彩色鉛筆寫實版

- 使用者認為原八張輪播專業但不夠活潑，要求彩色鉛筆素描與寫實圖片表達文字。已透過內建 image_gen 逐張產出八張新版，象牙白紙張紋理、深綠文字、彩色筆觸，涵蓋歌唱、深夜備課、教材整合、教室設備、聲音觀察、跟唱、品牌設計與返回課堂。
- 新版另存 `C:/Agent/UIUX/brand/pixel-studio/01-current/vocal-lab-linkedin-pencil-20261009/`，原深色版本保留。八張最終 PNG 皆為 1080 × 1350 px（4:5），另附總覽、ZIP、原 LinkedIn 文案、完整 prompts.json 與 sources.json。生成母圖保留 Codex generated_images；package.ps1 僅等比例縮放／留邊及打包。
- 已逐張檢視八張圖與總覽，文字未見裁切；第三張右側書本的生成課程名稱曾與原文不符，已用 image_gen 局部修改為歌唱序論、呼吸、共鳴、發聲練習、綜合應用、自我條件設定，並再次目視確認。
- 插畫人物及設備／網站畫面為情境示意，未使用本人肖像或課堂照片；保留三天整合範圍、曲線的觀察限制與真機／後台待辦。未發佈 LinkedIn、未修改網站、未提交或部署。

## 2026-10-09 LinkedIn 貼文與八張輪播圖

- 依使用者要求，將 `docs/voice-lab-build-story.md` 改編為 LinkedIn 分享貼文及八張 1080 × 1350 px（4:5）PNG；開頭沿用「聲音稍縱即逝。演唱完一句，旋律隨即散去。」使用 leo-voice 與 design 技能。
- 依文章順序涵蓋聲音短暫、備課累積、三天第一版、教材入口、聲音觀察、演唱條件、品牌樣貌與課堂驗證；保留三天建置的範圍、曲線的觀察限制、真機與後台待辦，未虛構教學成效。
- 交付位置：`C:/Agent/UIUX/brand/pixel-studio/01-current/vocal-lab-linkedin-20261009/`。包含 `linkedin-post.md`、八張 `vocal-lab-01.png` 至 `vocal-lab-08.png`、`overview.jpg`、ZIP、可修改 HTML 與 `build.py`、輪播文案 JSON。
- 使用正式品牌 SVG、深綠黑底與暖金黃；Chrome headless 輸出。八張尺寸均精確確認；八張總覽及第 1、5、8 張原尺寸目視檢查未見裁切；ZIP CRC 通過。
- 僅產出本機素材，未發佈 LinkedIn、未修改網站、未提交或部署。既有本機未追蹤文件保留。

## 2026-10-09 Slogan 再縮小與 VOCAL LAB Google 文件

- 使用者要求電腦／手機頁尾 Slogan 再縮小 20%：桌面 `clamp(20.16px,3.808vw,54.88px)`，手機 22.4px；首頁 CSS 版本 `20261009b`。延續先前部署授權提交並推送此修改。
- 本次 commit `5cf2ee4` 已推送。部署 workflow `37811545261` completed／success；上線後首頁與 CSS HTTP 200，版本引用與電腦／手機尺寸設定皆確認存在。全文 readback 已確認日期 chip 顯示 2026 年 10 月 5 日與 10 月 8 日。部署確認紀錄保留本機。
- 文章標題依指定更正為「VOCAL LAB：將十多年的歌唱教學，彙整成一個聲樂實驗室」，全文名稱同步更正，保留原有建置事實與待驗證限制。本機文章檔名維持 `docs/voice-lab-build-story.md`，文章未加入網站公開頁面。
- 已建立原生 Google Docs，放在 My Drive 的 ChatGPT 資料夾；文件網址：https://docs.google.com/document/d/10pfjZ67eQLxRK6oScG2KHn9AopQVrimuKGOIFxRRKsA/edit 。使用原生標題、四個章節標題、網站連結及兩個日期 chip，並以完整 readback 核對新名稱、結尾與結構。
- Google 文件維持既有帳戶的預設分享設定，未開啟公開分享。後台設定筆記保留未追蹤，本機文章保留供後續修訂。

## 2026-10-09 Slogan 首輪部署與網站建置文章

- 使用者要求提交與部署，Slogan 修改及當時工作記憶已提交並推送：`8a81d39d335ee8203bf711cdfb8c2a2069b8a4b8`。GitHub Pages workflow `37808145806` completed／success。
- 部署後實際查證：首頁與 `home-art-direction.css?v=20261009a` HTTP 200；首頁含新版 CSS 引用，線上 CSS 含電腦版縮小 30% 的 clamp 與手機 28px。此次未進行瀏覽器目視驗證。
- 依使用者引言與 leo-voice 技能撰寫 `docs/voice-lab-build-story.md`，整理教材、互動、品牌、驗證與教學反思；文稿與本段部署紀錄先保留本機，未加入網站導覽或公開文章頁。
- 「三天內」指 Git 可佐證的 10 月 5 日晚間首次教材提交至 10 月 8 日六堂整合與首頁改版；不代表完整工時或從零產生十多年教學內容。文章保留使用者所述下週亞東吉他社授課計畫，明確交代後台回傳及真機／教室實測待完成。
- 文稿禁用句型掃描與 `git diff --check` 通過。原有未追蹤 `docs/apps-script-setup-notes.md` 保留；其他既有待辦不變。

## 2026-10-09 頁尾 Slogan 尺寸修正

- 依使用者指定，首頁頁尾 Slogan 電腦版字級縮小 30%：`clamp(36px,6.8vw,98px)` 改為 `clamp(25.2px,4.76vw,68.6px)`；599px 以下手機版固定為 28px。保留原有兩行、行高與留白。
- 首頁樣式版本更新為 `20261009a`。已核對 CSS 斷點與縮放比例，`git diff --check` 通過；尚未提交、推送或部署，尚未進行瀏覽器目視驗證。
- 原有工作記憶修改與未追蹤後台設定筆記保留。

## 2026-10-08 品牌網站品質深化

- 依使用者要求以國際設計獎項水準為目標，完成三輪首頁實作與自查。設計為「聲音展覽 × 精密工作室」，延續正式彩色品牌標誌、暖金黃與 Find your voice. 漸層；放大主標／聲波，課程改編號索引，淺色練習區提升閱讀尺度，節奏區改細線比例格，頁尾放大正式 slogan。
- 新增 `assets/home-art-direction.css`（只作用於首頁），修改 `index.html`、`assets/studio.js`。首頁新增聲波暫停、頻率音名；requestAnimationFrame 離屏／背景停止，支援即時減少動態設定與頁面恢復。修正 SVG 遮擋聲音按鈕，補 main 鍵盤焦點與導覽 aria-current。新資產版本 `20261008w`。
- 驗證：9 頁 × 320／390／768／1440px 共 36 組無橫向溢出、無 JS 未處理例外；25 個首頁本機連結 HTTP 200；7 項互動測試通過；手機／平板真實點擊與方向鍵通過；首頁正常／暫停狀態 axe WCAG 標籤檢查 0 項違規；語法與 diff 檢查通過。真機 iOS、LINE、實體音色及原有教室互動仍待實測。
- 設計與驗證紀錄：`docs/design-review-20261008.md`。預覽及 JSON 位於 `C:/Agent/UIUX/brand/pixel-studio/01-current/website-20261008/`，遵守 UIUX 產出位置偏好。
- 改版已於後續依使用者指示提交、推送及部署：改版 `fdefd4e`，最新已推送 commit `c295f92`。最新 GitHub Pages workflow `37739129691` 成功；原有未追蹤 `docs/apps-script-setup-notes.md` 保留。

## 下次 RESUME 優先讀取摘要（2026-10-09）

- 先讀本檔並確認 Git 狀態，第一則進度訊息使用精簡繁體中文 BRIEF，包含專案用途、已完成、版本／部署與待辦。
- 最新已推送 HEAD：`5cf2ee434006e4439c895ad2f471fd7580c656a6`，`main` 與 `origin/main` 同步。GitHub Pages workflow `37811545261` completed／success。
- 最新首頁 Slogan：電腦版先縮小 30%，再縮小 20%，目前 `clamp(20.16px,3.808vw,54.88px)`；手機由 28px 再縮小 20% 至 22.4px。CSS 版本 `20261009b`。上次線上查證首頁與 CSS HTTP 200，引用與兩種字級設定皆存在；此次未進行瀏覽器目視驗證。這是歷史驗證，若報告目前線上狀態需重新查證。
- 文章已依使用者指定改為「VOCAL LAB：將十多年的歌唱教學，彙整成一個聲樂實驗室」，全文名稱已更正；Google 文件已建立並讀回核對，位於 ChatGPT 資料夾：https://docs.google.com/document/d/10pfjZ67eQLxRK6oScG2KHn9AopQVrimuKGOIFxRRKsA/edit 。未修改網站其他 VOICE LAB 文案，未將文章加入網站公開頁。
- 文章中的「三天內完成第一版」依據 10 月 5 日晚間至 10 月 8 日 Git 紀錄，指既有教材整理與網站整合，不代表完整工時。Google 文件保留待實測與後台串接限制。
- 品質自評約 8／10，屬主觀設計評估，不是驗證工具或官方評審分數。品牌一致性、資訊導覽、響應操作各 8.5；互動創意與辨識度、整體品牌敘事各 7.5。尚未宣稱完全達成國際獎項頂尖水準。
- 已向使用者說明提升兩項 7.5 的方向：同音不同音色、真實示範「一段歌三種表達」、探索結果連到課程；精選真實作品／案例、創作決策、創辦人聲音與合作入口。建議首頁路徑為「體驗聲音 → 看見作品 → 理解方法 → 探索課程 → 聯絡」。目前僅為建議，使用者尚未要求實作，也尚未提供作品與錄音，不得虛構作品或成果。
- 既有待辦：Apps Script /exec endpoint、iOS／LINE／麥克風與教室音色真機驗證、兩處老師版標記確認。工作目錄有 `docs/work-memory.md` 修改，以及未追蹤的 `docs/apps-script-setup-notes.md`、`docs/voice-lab-build-story.md`；均先保留本機。本次使用者僅要求更新記憶，不另行提交或部署。
- 沒有設計或驗證作業在背景執行；本機預覽伺服器曾運行於 `http://localhost:8765`，本次未重新確認，下次以實際程序為準。

### 下次繁體中文 BRIEF 參考

「這是 Pixel Studio 畫素音樂工作坊的流行歌唱教學網站。六堂互動投影片、34 頁講義與問卷已完成；頁尾 Slogan 已再縮小並部署，最新版本 `5cf2ee4`，上次確認 Pages 部署成功。VOCAL LAB 建置文章已更正並產出 Google 文件。待辦是 Apps Script 串接、iOS／LINE／麥克風與教室實測，以及兩處教材標記確認；工作記憶與兩份未追蹤文件保留本機。」

最後更新：2026-10-09（Asia/Taipei）。

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

## 2026-10-07 首頁 About 文案調整

- 首頁 About 區塊依使用者最新文案調整標題大小寫與冒號、保留三行主張但移除末句句點，核心 slogan 加上中文引號，並將介紹與聲音藝術理念拆成兩段；更新「最獨一無二」及「一件事情」措辭。
- 已檢查原文案字串與 `git diff --check`。Commit `81e29fb` 已在本機建立；當時 push 遭 GitHub 回覆 `Internal Server Error`；之後已隨第三堂投影片 commit `6e6131c` 一併推送並部署。

## 2026-10-07 第三堂投影片

- 依第一、二堂格式與講義第三堂規劃，新增 `slides/lesson-03/index.html`（22 張，17 張帶互動）：起承轉合時間軸、手機同步 QR、摀耳實驗投票、吉他共鳴手指投票、三腔位置 SVG 圖＋翻牌、三段 40 秒跟做、哼鳴音準挑戰、捏鼻兩段錄音對照、警笛滑音、混合使用選擇題、休息倒數、《浪流連》共鳴地圖／角色輪替（抽籤＋3×3 分鐘）／三組計分、《浪子回頭》三種共鳴錄音、出場券、18 分鐘課表與作業勾選、第四堂問卷 QR。
- `assets/interact.js` 新增 `.siren` 警笛滑音元件（C2–C6 音高曲線、最低／最高音、自動與手動標記換聲點，存 localStorage 並送後台），`assets/interact.css` 加上 siren、雙／三錄音格與共鳴腔圖樣式；`Code.gs` 加 `siren` 類型名稱（Apps Script 需重新部署才生效）。
- 首頁第三堂入口改連投影片；講義第三堂互動表依實作更新（共鳴地圖插入第 15 張，角色輪替改第 16 張），並修正「茶子蛋→茄子蛋」「摧耳→摀耳」；README 補上第三堂與 `.siren`。
- 依使用者要求，第三堂第 4 張與講義第三堂開頭的三大要素統一為「呼吸、共鳴、發聲」（英文沿用第一堂的 Breath／Resonance／Pronunciation）。
- 驗證：22 張 1440px 截圖檢查；iframe 稽核 320／390／768／1440px 無橫向溢出；`node --check assets/interact.js`、`git diff --check` 通過。真實麥克風下的警笛滑音尚未實測。
- 部署：commit `6e6131c`（連同先前未推送的 `81e29fb` About 文案、`b9aabef`）已推送至 `main`；GitHub Pages workflow `37646114337` 成功。線上第三堂投影片、首頁與 `assets/interact.js` HTTP 200，首頁含第三堂投影片連結，線上腳本含 `.siren`。

## 2026-10-08 講義錯字與三份同步

- 查證 2020 年原始講義（OneDrive `02.畫素音樂工作坊/2020 亞東吉他流行歌唱班` 的 PDF 與 .doc）：「嗉嘴」「圓攟」「茶子蛋」「摧耳」都不在原文，是 2026-10-05 擴寫時產生；原文為「喉腔舒服自然的打開，儼如打呵欠的動作」。
- 依使用者確認改為「打哈欠時喉腔打開」「嘴張很大但喉腔沒有打開」「嘴唇圓攏往前」。
- Claude Doc 原稿（rev 56）、`docs/course-handbook.md`、`docs/vocal-class-handbook.pdf`（33 頁，含暖金黃配色）三份同步：補上先前只改 md 的茄子蛋、摀耳、三大要素用詞、第一到三堂投影片編號說明、第零號錄音「下載保存」、第三堂互動表（新增第 15 張共鳴地圖、角色輪替改第 16 張）。
- 第一堂第 18 張提示改為「錄完請下載保存，也可以按『上傳給老師』」。
- 第四到六堂規劃已獲同意：第零號錄音同時支援手機選檔與老師 Drive；第五堂保留三句話頁；先做第四堂。

## 2026-10-08 第四堂投影片

- 新增 `slides/lesson-04/index.html`（22 張，16 張互動標籤加休息倒數）：繞口令抽籤＋碼表、只唱母音／子音預測題、五母音翻牌＋手機前鏡頭鏡子、心／星聽辨計票、C 大調音階依序音準挑戰、促音和弦節拍器加速挑戰（班級紀錄存本機）、五組母音接力計分、子音翻牌、送氣音噴麥選擇題、三步驟學唱分段計時＋影片、韻腳（●）與後鼻音（ŋ）歌詞標記、/a/ 版與歌詞版錄音對照、出場券、20 分鐘課表與作業、第五堂問卷 QR。
- 新元件：`.stopwatch`、`.mirror`；擴充：`.pitch[data-seq="scale"]`、`.lyricmark[data-marks][data-hint]`、`.metro[data-presets]`／`[data-challenge]`（`assets/deck.js`）、`.score.five`、`table.mini-scale`。
- 首頁第四堂入口連到投影片；講義第四堂互動表依實作更新（新增第 15 張送氣音與噴麥），Claude Doc（rev 67）、md、PDF（33 頁）同步。
- 驗證：22 張 1440px 截圖；第一到四堂 iframe 稽核 320／390／768／1440px 無橫向溢出；碼表、歌詞記號循環、老師版記號、節拍器加速與紀錄、依序出題按鈕、鏡子元件建立測試通過。真實鏡頭與麥克風尚未實測。
- 部署：commit `b7cf48d`（含講義同步 `6c5d1b1`、第四堂 `4b6ef6d`）已推送至 `main`；GitHub Pages workflow `37652768221` 成功。線上第四堂、第一堂、首頁與 PDF 皆 HTTP 200，首頁含第四堂連結，線上腳本含碼表元件，第一堂含「請下載保存」，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 第五、六堂投影片

- 新增 `slides/lesson-05/index.html`（22 張，18 張互動標籤加休息）：三步驟成果抽籤、《愛情轉移》換氣標記（老師版為暫定，待依原唱確認）、共鳴應用翻牌、長短頓音聽辨計票、70／100／140 BPM 節拍器、模仿類型投票、聽仿化、歌手配對翻牌、模仿工作坊抽籤＋計時、五項聆聽參考、小組展示計分、模仿版／自己版錄音、《後來的我們》情緒地圖、《人質》《演員》分組＋抽籤分享、三句話（依使用者要求保留）、出場券、模仿筆記表、課後練習、第六堂問卷 QR。
- 新增 `slides/lesson-06/index.html`（22 張，19 張互動標籤加休息）：Quick Review 搶答與翻牌解答、換氣情境題、音域測量、可用／完全音域題、鍵盤度數圖與度數題、自定調題與計算器、吉他移調計分、Case Study 抽籤計時與十首、十首人氣榜、演唱順序抽籤、結業演唱循環計時、第零號錄音對照、回饋問卷 QR、六堂總回顧出場券、結語與長期課表。
- 新元件：`.dynmap`、`.range`、`.transpose`、`.zero`；擴充：`.exit[data-key][data-label]`（同堂第二份表單，送後台類型 `note`）、`.phase[data-loop]`、`.poll.cols2`／`.wide-label`；錄音時間改為 mm:ss（60 秒顯示 01:00），分段計時 60 秒以下以秒顯示。`Code.gs` 新增 note、dynamics、range、transpose 類型名稱。
- 首頁第五、六堂入口連到投影片；講義第五堂互動表依實作重寫、第六堂補上第 5、11、22 張並更新第 6、18、19 張；投影片編號說明改為「編號都對應網站上現有的投影片」。Claude Doc（rev 78）、md、PDF（33 頁）同步。
- 驗證：第五、六堂各 22 張 1440px 截圖；第一到六堂 iframe 稽核 320／390／768／1440px 無橫向溢出；情緒地圖計票與共識、筆記表單獨立儲存、音域設定與度數（G3–F4 = 7 度）、自定調（C、A4、F4 → A♭、G 調指型 Capo 1）、錄音 01:00、循環計時換人測試通過。真實麥克風與選檔播放尚未在手機實測。
- 部署：commit `12483c3` 已推送至 `main`；GitHub Pages workflow `37673256678` 成功。線上第五、六堂與首頁 HTTP 200，首頁含兩堂連結，線上腳本含新元件，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 第三堂共鳴觀測站

- 使用者指出第三堂第 9 張的音準挑戰與第二堂重複；第三堂重點是共鳴轉換：胸腔移到頭腔時頻率升高、音量（振幅）明顯變小。
- 第 9 張改為「共鳴觀測站」（`.resolab`）：即時顯示音高曲線與音量（dBFS）面積圖，錄製最多 20 秒（音訊與曲線同步）；錄完可播放並顯示播放頭，在圖上拖曳選段標記胸腔／口腔／頭腔，列出每段音高範圍、中位音與平均音量，並自動比較「胸腔 → 頭腔」的半音數與 dB 變化；可下載觀測圖 PNG、下載錄音、上傳觀測圖與錄音給老師（後台類型 `resonance`「共鳴觀測」）。
- 講義第三堂互動表第 9 列、README 同步更新；Claude Doc（rev 82）、md、PDF（33 頁）同步。
- 使用者確認第 12 張「警笛滑音」功能不同（找換聲點），保留不合併。
- 驗證：以模擬資料測試拖曳標記、腔體標記、統計與比較（D3 → G4：+17 半音、−13 dB）；1440px 與 390px 版面檢查；第一到六堂 iframe 稽核無橫向溢出。真實麥克風尚未實測。

## 2026-10-08 第四堂音階與促音跟唱

- 使用者指出第四堂也有類似音準挑戰的重複設計；本堂重點是音階發聲與促音發聲練習，要可跟著練、不用錄音。
- 第 9 張改為「音階跟唱」（`.scalepractice`）：男聲／女聲選起始音（男 E2–A3、女 E3–A4，預設 C3／C4），± 半音、拍速 40–160 可調；每輪 4 拍預備（主和弦＋節拍），鋼琴音帶唱 1 2 3 4 5 6 7 1̇ 7 6 5 4 3 2 1，可每輪自動升半音、輪換 [a][i][u][e][o]、連續練習、節拍聲開關。
- 第 10 張改為「促音跟唱」（`.staccato`）：七個三和弦依序以 1 3 5 3 1 3 5 3（八分斷音）、1，接 3 拍換氣並提示下一個和弦，可選「和弦走完再下行」；拍速、半音可調，保留「唱穩了 +5 BPM」與班級紀錄。和弦名稱依調號用升或降記號（D 調 C♯dim）。
- 修正：促音換氣格原用 `.breath` 類別會被吐氣測量元件初始化，改為 `.pr-breath`；共鳴觀測站標記按鈕由 `.tag` 改 `.rl-z`，避免套到投影片標籤樣式；`table.mini-scale` 在手機維持表格。播放畫面改用 25ms 計時器更新（AudioContext 排程聲音）。
- 講義第四堂第 9、10 列與 README 更新；Claude Doc（rev 87）、md、PDF（33 頁）同步。
- 驗證：以模擬 AudioContext 測試音階 C3→C4→C3 與促音 C E G E C E G E C、吸、Dm 的進行；半音、男女聲、加速紀錄、下行選項正確；1440px 與 390px 版面；第一到六堂 iframe 稽核無橫向溢出。實際聲音尚未在教室喇叭試聽。

## 2026-10-08 行動裝置連點放大

- 使用者回報手機上連點會放大畫面，節拍 tap 鍵與拍速 ± 難以操作。
- `assets/responsive.css`（網站與投影片都載入）加上 `html` 與按鈕等互動元素 `touch-action: manipulation`：關閉雙擊放大、保留雙指縮放與捲動；按鈕類加 `user-select:none` 與透明點擊高亮；觸控裝置上輸入欄、選單一律 16px，避免 iOS 聚焦自動放大。未使用 `user-scalable=no`，保留無障礙縮放。
- 節奏挑戰「拍點」鍵改用 `pointerdown` 立即記錄（不等 click 延遲），鍵盤啟動（click detail 0）仍有效，不會重複計拍。
- 驗證：第一、四堂投影片、首頁、問卷的 html、按鈕、拍點鍵、拍速鍵計算樣式皆為 manipulation。尚需真機（iOS Safari、Android Chrome）確認。
- 部署：commit `ee4231b`（含共鳴觀測站 `4ba80d3`、第四堂跟唱 `9c020e0`、連點修正）已推送至 `main`；GitHub Pages workflow `37711513976` 成功。線上第三、四堂 HTTP 200 且含新元件，線上腳本與樣式已更新，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 手機實測回饋修正

- 起承轉合流程圖與課表色塊刷淡：`deck-studio.css` 加 `filter:saturate(.68) brightness(.97); opacity:.86`。
- 共鳴觀測站：不同腔體的標記可以重疊，重疊處以斜線網底標為「聲區」（共鳴轉換位置）；清單與結論列出各聲區的時間、音高範圍與約略音高，觀測圖與上傳資料一併帶入。同腔體重複標記才會取代。音高範圍相同時只顯示單一音名。
- 手機下載：新增 `saveFile()`／`saveSheet()`。觸控裝置優先用 `navigator.share` 檔案分享；LINE、Facebook、Instagram、微信等 App 內建瀏覽器改顯示「長按圖片即可儲存」視窗，錄音則提示改用預設瀏覽器開啟或上傳給老師；桌機照常下載。共鳴觀測站與各堂錄音元件的下載都改用此流程。
- 第四堂五線譜：音階與促音跟唱上方加入 SVG 五線譜（高音譜號，男聲標低八度的 8，依調號畫升降記號），播放時與簡譜同步標示目前音符；促音每換一個和弦重畫，八分音符連桁並加斷音點。第四堂頁面載入 Google Fonts「Noto Music」顯示譜號。
- 音階跟唱改為 1 2 3 4 5 6 7 1̇ 1̇ 7 6 5 4 3 2 1（高音 1 重複），最後的 1 唱滿四拍（全音符）。
- 講義第三堂第 9 列、第四堂第 9、10 列與 README 更新；Claude Doc（rev 90）、md、PDF（33 頁）同步。
- 驗證：模擬 AudioContext 確認音階 16 音順序與四拍結尾、促音和弦進行與五線譜重畫；模擬重疊標記得出兩個聲區與音高；以 LINE 使用者代理測試出現長按儲存視窗；第一到六堂 iframe 稽核無橫向溢出。分享選單與 LINE 實際儲存需真機確認。
- 部署：commit `a883eee` 已推送至 `main`；GitHub Pages workflow `37717163012` 成功。線上第三、四堂 HTTP 200，第四堂載入 Noto Music，線上腳本含聲區、五線譜與儲存視窗，樣式含刷淡設定，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 流程圖刷淡修正與快取版本參數

- 使用者回報電腦簡報流程圖沒有變淡。原因：GitHub Pages 的 CSS 快取 `max-age=600`，加上 filter 刷淡在深色底上不明顯。
- 改為直接在 `deck-studio.css` 覆寫 `.bar-*` 為低飽和配色（起 #52699f、承 #cdc57a 深字、休 #3b3b43、轉 #b05a4d、合 #5c8456；課表 teal #4f8297、orange #a77b48、pink #9c5a70、purple #7b62a0），白字對比皆不低於原配色。
- 所有頁面（首頁、問卷、講義、列印講義、六堂投影片，共 111 處）引用的本地 CSS／JS 加上 `?v=20261008c`。**之後修改 assets 的 CSS 或 JS 時，要同步更新版本參數**，否則使用者可能沿用舊快取。
- 驗證：第一堂流程圖、第二堂課表截圖確認變淡；第一到六堂 iframe 稽核無橫向溢出；首頁、問卷、講義正常渲染。
- 部署：commit `02bfef9` 已推送；GitHub Pages workflow `37717676715` 成功，線上第一堂引用 `deck-studio.css?v=20261008c`，線上樣式為新配色。

## 2026-10-08 觀測站拖曳落差與講義 Logo

- 共鳴觀測站在電腦上拖曳選段有位移：投影片以 CSS transform 整體縮放，`getBoundingClientRect` 是縮放後座標，畫布繪圖用未縮放的版面寬度。`px()` 改為乘上 `cv.clientWidth / rect.width` 換算。以 1920×1080（1.4 倍）、1600×1000、1280×720（0.9 倍）測試拖曳 2–6 秒，標記皆為 2.0–6.0 秒。
- 講義封面與封底 Logo（`handbook-print.html` 的 `.logo-new`）寬度 164mm → 82mm，加 `opacity:.8` 刷淡 20%；PDF 重新產生，仍為 33 頁。
- 資產版本參數更新為 `?v=20261008d`。

## 2026-10-08 圖表解析度與音階連續練習結尾

- 電腦上共鳴觀測站等折線圖模糊：投影片以 transform 放大（1920 寬約 1.4 倍），畫布只依未縮放尺寸繪製再被拉大。共用 `canvasFit()` 改為依實際顯示寬度 × devicePixelRatio（上限 4）設定點陣大小；換頁動畫結束 420ms 後送出 resize 讓各圖表重畫。1920×1080 測試：觀測站、警笛滑音、吐氣測量、聲波實驗室的畫布點陣寬度皆等於顯示寬度（觀測站由 577 px 拉伸改為實際 807 px）。
- 第四堂音階跟唱：連續練習時最後的 1 改為二分音符（2 拍），另 2 拍接下一輪 4 拍預備；單輪仍為全音符 4 拍。五線譜與簡譜格同步顯示「2 拍／4 拍」。
- 跟唱排程改為下一輪從上一輪結束時間無縫接上（提前 250ms 排程），不再每輪多出 0.12 秒與計時器延遲；140 BPM 測得最後的 1 到下一輪「預備 4」為 840ms（理論 857ms，差距為測試取樣間隔）。單輪結束與到達最高起始音時，等最後一個音唱完才停止。
- 講義第四堂第 9 列、README 更新；Claude Doc（rev 91）、md、PDF（33 頁）同步。資產版本參數 `?v=20261008e`。

## 2026-10-08 投影片頁尾與唱名提示

- 所有投影片（封面除外）左下角加章節標註（取 body `data-title`，例：第四堂｜歌唱發聲練習）；右下角「畫素音樂工作坊」文字改為刷淡的 PIXEL STUDIO Logo（`pixel-studio-67-dark.png`，高 15px、不透明度 .42）。手機與列印時隱藏。
- 第四堂第 16 張影片下方加「唱名提示」（`.solfa`，代碼 `l4-solfa`）：一行一句簡譜，行首可加時間（例 0:45）跟著影片播放時間自動換行，否則用 ◀ ▶；分段計時進入「① 唱名」時自動展開、進入其他段落時收起。內容由老師在電腦上「貼上唱名」或放在試算表「歌詞」分頁代碼 l4-solfa。**尚未取得這首歌的唱名簡譜**（不自行推測旋律），等使用者提供。
- 分段計時新增 `phase:change` 事件；`PixelYT.find(el)` 可取得投影片中的影片播放器。
- 修正：`interact.js` 早於 `backend.js` 載入，歌詞換氣標記從試算表讀完整歌詞的動作從未執行；新增 `later()` 延到所有腳本載入後。
- 320px 稽核發現第四堂第 16 張被唱名提示按鈕列撐寬（357px）；加 `.split>*{min-width:0}` 與按鈕換行後恢復 305px。資產版本參數 `?v=20261008g`。注意：iframe 稽核的 bad 清單在手機版會被 `.slide:not(.active)` 濾掉，判斷溢出要看 scroll 寬度。驗證：唱名提示展開、手動換行、模擬播放時間同步、段落切換收起與重開；頁尾章節與 Logo；第一到六堂 iframe 稽核無橫向溢出。

## 2026-10-08 第四堂三步驟學唱：/i/ 母音、影片連動、四小節唱名

- 範例曲韻腳為 [i]：第 16 張三步驟第二步改為「/i/ 母音」，第 18 張錄音對照與第五堂第 3 張的「/a/ 版」同步改為 /i/；講義第四堂課程綱要、三步驟說明、互動表第 16、18 列一併更新。
- 分段計時加 `data-video`：按開始／繼續同步播放同張投影片的影片，暫停時暫停，換段時影片從頭播放，重設時停止。
- 唱名提示改為四小節節奏動態（`data-score`）：依 jianpu.space 簡譜（1=A♭、68 BPM）解讀副歌前四小節「不是因為天氣晴朗才愛你／不是因為看見星星才想你」，一次顯示一小節，依拍速逐音亮起唱名（簡譜、Do Re Mi、歌詞，低八度以下方圓點標示）。可按「▶ 跟唱」從 4 拍預備開始，或在影片副歌第一句時按「設定副歌起點」，之後影片播到該處自動同步（只對第一次副歌）。依使用者要求，只呈現不超過四小節。
- 簡譜解讀：該站格式 `_`＝八分、`=`＝十六分、`,`＝低八度、`-`＝延長一拍、`.`＝前一音加附點；四小節音數與兩句歌詞 11＋11 字逐一對應。
- 資產版本參數 `?v=20261008k`；講義 Claude Doc（rev 96）、md、PDF（33 頁）同步。驗證：第二步顯示 /i/；影片呼叫順序 play、pause、play、seek＋play、stop；手動跟唱依序亮起兩句歌詞、四小節切換；模擬影片時間（起點後 4.6 拍）落在第 2 小節「朗」；1440px 版面與 320px 寬度、六堂稽核通過。
- 部署：commit `4350a00`（含拖曳落差與 Logo、圖表解析度與音階結尾、頁尾與唱名提示、手機寬度修正）已推送；GitHub Pages workflow `37720874507` 成功。線上第三、四堂 HTTP 200，第四堂引用 `?v=20261008k` 並含唱名四小節與影片連動，線上腳本含新功能，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 第四堂第 16 張改為旋律偵測

- 依使用者要求移除唱名提示視窗（`.solfa` 元件程式保留，第 16 張不再使用），改為「旋律偵測」（`.melodyscope`，data-tonic 56 = A♭3、男聲低八度高音譜號、data-phase 0）：分段計時進入「① 唱名」時自動啟動，離開時停止。
- 限制：YouTube 嵌入框的聲音網頁無法直接讀取。收音來源：電腦版 Chrome／Edge 用 `getDisplayMedia` 分享本分頁音訊（需勾選「分享分頁音訊」，`preferCurrentTab`），手機或取消分享時改用麥克風收喇叭聲音；來源選擇存在本機。
- 演算法：8192 點 Hann 窗 FFT，立體聲時以「中央（L+R）振幅減 0.9×兩側（L−R）振幅」突顯置中的人聲，再以 10 個諧波的加權總和（harmonic salience）在 G2–G5 找最顯著音高，壓低 0.5 倍與 1.5 倍誤判；八度校正（基頻弱於高八度時取高八度）；5 格中位數、連續 3 格（約 120ms）穩定才成為新音；依調號換算簡譜（含 ♯／♭ 與高低八度點）與音名拼法。
- 合成測試（人聲置中、四音和弦伴奏、雜訊）：伴奏分在兩側時，人聲音量 1、0.7、0.5 皆 60/60；伴奏置中時人聲音量 1 為 60/60、0.7 為 30/60、0.5 為 8/60。模擬分頁音訊的投影片流程測得旋律 3 4 5 4 3 7̣ 2 1 正確；純伴奏段落會顯示伴奏音。實際歌曲準確度需在教室實測。
- `staffSVG` 新增選項（固定格數、簡譜列、不畫結束線）與臨時記號。第 16 張影片在此頁縮為最寬 430px 以容納偵測面板。講義第四堂第 16 列、README 更新；Claude Doc（rev 98）、md、PDF（33 頁）同步；資產版本 `?v=20261008o`。
- 注意：工作目錄出現他處新增、尚未提交的 `brand/Pixel-Studio-CI-v1/` 與 `assets/pixel-studio-official-black.*`、`assets/pixel-studio-wave-220hz.svg`。這次提交一度用 `git add -A` 誤收入，已在推送前移出；之後提交一律指定檔案路徑，不收入非本次工作的檔案。
- 部署：commit `e078d8b`（旋律偵測 `3406879`）已推送；GitHub Pages workflow `37722651569` 成功。線上第四堂含旋律偵測面板、引用 `interact.js?v=20261008o`，線上腳本含 melodyPitch，線上 PDF 與本機 SHA-256 一致。Codex 正在 `brand/` 製作 CI，那些檔案與其工作記憶段落由使用者自行處理。

## 2026-10-08 旋律偵測：分享視窗卡住與首調簡譜

- 使用者回報分頁音訊視窗會卡住，必須關掉「一併分享分頁音訊」才能取消。原因：分段計時每秒送出 `phase:change`，旋律偵測每次都呼叫 `getDisplayMedia`，視窗未回應前不斷疊加。修正：加 `starting` 防重入，且只在分段狀態改變（進入唱名段、暫停、換段）時反應；取消分享時只顯示提示，不再自動改開麥克風。
- 簡譜採首調（主音為 1，A♭ 調的 A♭ = 1）；移除畫面上的絕對音名，只顯示首調唱名與「1 = 調」。新增「首調 1 = ?」選單，可切換 12 個調，五線譜調號與簡譜同步，選擇存在本機。
- 驗證（模擬分享）：視窗未回應時計時 4 秒只要求 1 次；取消後 1 次、未開麥克風；正常分享測得 5̣ 3 4 5 4 3 7̣ 2 1（1 = A♭），切到 G 調後以 G 為 1 重新標示。320px 寬度維持 305px。資產版本 `?v=20261008p`。

## 2026-10-08 音階連續練習：全音符即預備拍

- 依使用者要求，連續練習時最後的 1 恢復為全音符（4 拍），這四拍即下一輪的預備拍，唱完直接接新的音階（每輪升半音時從新調開始），不再有提示和弦與預備拍；第一輪仍有 4 拍預備。單輪練習同樣唱滿四拍。
- 節拍聲改依每輪實際起點計算；新的一輪第一個音出現時更新五線譜調號。第 9 張說明改為「第一輪前 4 拍預備……之後最後的 1 唱滿四拍就直接接下一輪」。
- 驗證（140 BPM 模擬）：最後的 1（C3）之後直接是下一輪「Do C#3」，間隔 1720ms（四拍理論 1714ms），整段只有第一輪的 4 個預備拍；五線譜最後為全音符、簡譜格顯示 4 拍。講義第四堂第 9 列、README 更新；Claude Doc（rev 100）、md、PDF（33 頁）同步；資產版本 `?v=20261008q`。

## 2026-10-08 Rebranding：首頁與講義換新標誌

- 使用者完成 Pixel Studio CI（Codex 製作，來源 `C:\Agent\UIUX\brand\Pixel-Studio-CI-v1\01-logos`）。複製三份 SVG 到 `assets/brand/`：`pixel-studio-horizontal.svg`（橫式，取透明版）、`pixel-studio-primary-dark.svg`、`pixel-studio-primary-transparent.svg`。暗色版與透明版 SVG 內容相同，只差一個黑色背景矩形。
- 首頁左上角（原「pixel studio」文字）與頁尾（原「pixel studio.」大字）改為橫式標誌圖片；首頁底色是深綠黑，所以用透明版避免出現黑框。SVG 有內建安全邊距，以高度與負邊距對齊：頂欄 64px（平板 52、手機 46），頁尾 120px（88／70）。
- 講義依背景換標誌：黑底封面用 primary-dark，白底封底用 primary-transparent；沿用先前的寬 82mm、不透明度 .8。PDF 重新產生，33 頁、4.62MB。用 SVG 不用 6000px PNG（每張 2–7MB）。
- 問卷、講義網頁、投影片頁尾仍是舊字標（使用者這次只指定首頁與講義）。資產版本 `?v=20261008s`。commit `4ebb2e7`。

## 2026-10-08 Rebranding 第二輪：依背景選用標誌

- 講義白底封底改用 primary-mono-black（`assets/brand/pixel-studio-primary-mono-black.svg`），移除上一輪的 primary-transparent。
- 依背景與用途選用：首頁、問卷、講義網頁左上角與頁尾 → 彩色橫式（不含黑底的 horizontal-dark，三頁頂欄一致）；投影片右下角 → 白色單色橫式 `pixel-studio-horizontal-mono-white.svg`（高 34px、不透明度 .38），小尺寸彩色會變成雜點並與流程圖、圖表搶色；講義封面維持彩色 primary-dark。horizontal-light 與 horizontal-mono-black 目前沒有淺底位置，未使用。
- `pixel.js` 的舊 Logo 產生函式沒有頁面使用，未更動；講義內頁頁首仍是文字「PIXEL STUDIO」（列印頁邊距區無法控制圖片尺寸）。
- PDF 重新產生，33 頁。資產版本 `?v=20261008t`。
- 部署：commit `28d8a36`（含分享視窗修正、首調簡譜、音階全音符銜接、兩輪 Rebranding）已推送；GitHub Pages workflow `37725527763` 成功。首頁、問卷、講義網頁、第二堂與四份標誌 SVG 皆 HTTP 200，三頁頂欄為新標誌，投影片頁尾為白色單色標誌，線上 PDF 與本機 SHA-256 一致。

## 2026-10-08 投影片封面加入 Rebranding 視覺

- 六堂封面由 `deck.js` 自動加入：右側大型彩色聲波 `assets/brand/pixel-studio-symbol-color.svg`（透明底，560px，緩慢上下浮動與呼吸光暈，支援減少動態效果），右下角白色直式標誌 `pixel-studio-primary-mono-white.svg`（寬 118px、不透明度 .55）；移除舊的彩色格紋裝飾。手機版聲波縮為 200px 置於標題上方、隱藏右下標誌。
- 未使用 avatar-dark（含黑底方塊）與 symbol-compact（線條數少，適合小圖示）。資產版本 `?v=20261008u`。

## 2026-10-08 講義：課程回饋問卷與封面標誌

- 講義「課程回饋問卷」改為與網站 `surveys.js` 的 feedback 問卷一致（12 題）：五構面滿意度表、課程整體 6 題（標示選填）、六堂學習成效自評表、進步紀錄 3 題（/s/ 秒數、可用音域、整體進步）。Claude Doc（rev 101）、md、PDF 同步；PDF 因此由 33 頁增為 34 頁。
- 講義封面標誌改為黑底彩字原色顯示：`.cover .logo-new{opacity:1}`，取消先前刷淡 20%（封底黑色單色版仍維持 .8）。CI 的 primary-dark 與 primary-transparent SVG 除黑色背景外完全相同，色彩與 PNG 一致。

## 2026-10-08 首頁頁尾白色標誌與聲波流動修正

- 首頁左下角頁尾標誌改為白色單色橫式 `pixel-studio-horizontal-mono-white.svg`；左上角維持彩色橫式。講義封面依使用者確認不變。
- 首頁 FIG. 01 聲波彩虹流動在手機上不動：原本用 SVG SMIL `animateTransform` 移動 `gradientTransform`，iOS Safari 不會重繪。改為 `requestAnimationFrame` 每約 33ms 移動漸層 `x1`／`x2`（spreadMethod repeat，12 秒一循環）；離開畫面（IntersectionObserver）或切到背景時暫停；系統開啟「減少動態效果」時仍不動（手機若開了這個設定，流動停止是正常的）。資產版本 `?v=20261008v`。

## 2026-10-08 新版 favicon

- 依 CI 的 symbol-color 聲波（`C:/Agent/UIUX/brand/pixel-studio/01-current/.../symbol-color-2400.png`）產生：裁去四周留白後置中；`favicon.ico`（16／32／48／64）與 `favicon.png`（48px）線條加粗、透明度提高 2.6 倍，避免細線在 16px 分頁圖示中消失；`favicon-192.png`（Android）與 `apple-touch-icon.png`（180px，深色 #101210 底，iPhone 主畫面）較輕微加強。
- 所有頁面改為四條連結（ico、48px、192px、apple-touch-icon），加 `?v=2` 讓瀏覽器重新抓圖。瀏覽器對 favicon 快取很頑固，上線後可能要強制重新整理或重開分頁。
- 部署：commit `63cc32d`（含頁尾白色標誌與聲波流動修正 `568d13a`）已推送；GitHub Pages workflow `37732798207` 成功。四個圖示檔與白色標誌 HTTP 200，首頁含新圖示連結與白色頁尾標誌，線上 studio.js 已改用 requestAnimationFrame 流動。

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

- `assets/config.js` 的 Apps Script endpoint 仍空白；使用者尚未提供 /exec 網址。資料暫存在學員瀏覽器，實際回傳試算表尚未驗證；Code.gs 新增的資料類型需重新部署。
- 六堂投影片、講義（34 頁）、問卷都已完成並部署；Rebranding 與新 favicon 已上線。
- 尚未真機實測：麥克風、錄音、分頁音訊旋律偵測、手機分享儲存、LINE 內建瀏覽器、iOS 聲波流動、教室喇叭音色。
- 待使用者確認：第四堂韻腳「想」是否標後鼻音、第五堂《愛情轉移》老師版換氣點；`docs/apps-script-setup-notes.md` 是否提交（公開 repo）。
- `.qa/` 為本機驗證暫存（已忽略）。改 assets CSS／JS 要更新 `?v=` 版本參數；只用明確路徑 git add。

## RESUME BRIEF 參考

「這是 Pixel Studio 亞東吉他社流行歌唱班的教學網站。六堂互動投影片、34 頁講義（Claude Doc／md／PDF 三份同步）與問卷都已完成；本次也完成 Rebranding（新標誌、投影片封面聲波、favicon），最後部署 commit `63cc32d` 成功。待處理：Apps Script /exec 網址（後台尚未連線）、真機與教室實測（麥克風、旋律偵測、手機儲存），以及兩處老師版標記確認。」

使用此參考前，確認最新 Git 狀態；若後續已有新工作，依最新狀態更新 BRIEF。

## 2026-10-08 正式 Logo 資產

- 依使用者要求，直接使用首頁 studio.js 的 220 Hz（54 條線、121 取樣點）SVG 路徑與原始漸層，置於提供的 pixel-studio-67-black-bg.png 字標上方；移除首頁介面標籤、控制項與輔助圓圈。
- 新增 assets/pixel-studio-official-black.png（2048×1800）、同名 SVG（聲波為向量，字標嵌入原始 PNG）與 assets/pixel-studio-wave-220hz.svg（獨立透明聲波）。
- Chrome 渲染並目視確認完整波形、原始字標與置中排列。未修改網站引用、未部署。原本未追蹤的 docs/apps-script-setup-notes.md 保留。

## 2026-10-08 正式 Logo 字標刷淡

- 依使用者要求，下方彩色字標 opacity 改為 0.9（刷淡 10%），上方 220 Hz 聲波維持原樣。正式 Logo PNG 與 SVG 已同步更新；Chrome 渲染並目視確認。

## 2026-10-08 Pixel Studio CI v1.0

- 依使用者要求，以已確認的 220 Hz 聲波 + 刷淡 10% 字標製作 CI。新交付放在 brand/Pixel-Studio-CI-v1，另提供同名 ZIP。標準直式 1600×1440：字標寬 1344、聲波寬 860（64%）、中線對齊，外圍 128 單位安全距離，垂直間距約 93 單位。
- 字標由來源 PNG 輪廓擷取，保留幾何端點並修整曲線、圓點及字腔；漸層按來源重建，彩色字標維持 opacity .9。14 份標誌 SVG 全部為路徑，不含點陣圖或文字字型依賴。聲波沿用首頁 220 Hz 公式與 54 線，加密為 241 取樣點；另提供 9 線小尺寸版。
- 高解析主標誌 PNG 6000×5400，橫式 6000×1800；19 份 PNG（14 標誌 + 5 應用）含 300 ppi 中繼資料，透明版本 alpha 已確認。10 頁 CI 手冊 PDF / HTML、純向量主標誌 PDF、JSON / CSS 品牌參數，及名片正背面、社群方形、品牌橫幅、A4 信紙設計稿。
- 驗證：20 份 SVG XML 有效，標誌 14 份皆無 image / text 元素；兩份 PDF 分別 10 頁 / 1 頁，均無點陣圖片；逐頁渲染目視確認排版、圖片、字腔與頁尾；PNG 尺寸、透明度、ppi 驗證通過。ZIP 已檢查 CRC。
- 限制：此為 sRGB CI，本次未指定印刷 ICC / CMYK / Pantone；交印需轉色打樣，名片尚未填入個人聯絡資料、未含出血。未替換網站引用或部署，既有及其他進行中的檔案修改保留。

## 2026-10-08 CI 白底彩色橫式版

- 使用者指出橫式只有黑底，新增 horizontal-light.svg 與 horizontal-light-6000.png（6000×1800，純白底，原有彩色聲波與字標 90% 不透明度）。
- CI 標誌母檔增為 15 份。來源建置程式、README、手冊 HTML / PDF（10 頁，第 5 頁白底彩色範例及第 10 頁數量）、品質記錄、manifest 與 ZIP 同步更新。白底像素、尺寸、PDF 向量及受影響頁面渲染均驗證。

## 2026-10-08 CI 正式 Slogan 與品牌資訊

- 使用者提供正式 Slogan：We Perform the Pixel of Music；畫素音樂工作坊成立於 2008 年，結合音樂製作、音樂教學與藝術展演。以使用者本輪提供內容為品牌資訊來源，已同步進 CI 手冊、README、brand-tokens.json 與五份應用設計稿。
- 新增 horizontal-slogan-dark / horizontal-slogan-light SVG 與 6000×2000 PNG。Slogan 為 Arial Regular 的向量字形輪廓，保留原始大小寫，與字標左側對齊。標誌母檔合計 17 份，全部不含 image / text 元素；原本無 Slogan 的黑底及白底版本保留。
- CI 手冊 10 頁重繪並逐頁驗證，成立年份、三項業務與正式 Slogan 的 PDF 文字均驗證；PDF 不含點陣圖片。應用 PNG、品質記錄、manifest、ZIP 已更新，CRC 通過。未替換網站或部署。

## 2026-10-08 UIUX 產出位置修正

- 使用者指定：網站原始專案為 C:/Agent/vocal_music，但 UIUX 設計產出必須放在 C:/Agent/UIUX/brand。
- 已將完整 CI 資料夾與 ZIP 移至 C:/Agent/UIUX/brand/Pixel-Studio-CI-v1 與 C:/Agent/UIUX/brand/Pixel-Studio-CI-v1.zip；初版 Logo PNG / SVG 及獨立 220 Hz 聲波 SVG 從網站 assets 移至 C:/Agent/UIUX/brand/initial-logo。
- 61 個檔案移動前後 SHA-256 一致，目的地未覆蓋既有檔案。這三個初版資產無網站 HTML / CSS / JS 引用。網站 brand 目錄僅剩空目錄。後續 CI 修改與交付均以 UIUX/brand 為準。

## 2026-10-08 UIUX 雙品牌歸檔

- 使用者要求整理 UIUX 工作區中的 LEO LEE HR 與 Pixel Studio CI，已按品牌分開管理。工作區根目錄僅保留 brand 與 README.md；品牌入口為 C:/Agent/UIUX/brand/leoleehr 與 C:/Agent/UIUX/brand/pixel-studio。
- Pixel Studio 最新 CI 的位置改為 C:/Agent/UIUX/brand/pixel-studio/01-current/Pixel-Studio-CI-v1；ZIP 位於同品牌 02-packages；初版 Logo 在 03-archive/initial-logo。後續更新以此路徑為準。
- LEO LEE HR 分為目前應用、定稿母檔、規範、歷史版本、製作資料與 ZIP 交付包；保留全部原始產出。45 項搬移、538 個檔案、1 個 node_modules junction 均核對；18 份建置程式路徑修正並保存原程式備份。各品牌導覽與移動紀錄位於 UIUX brand。未修改網站引用或重新匯出設計檔。

## 2026-10-08 首頁品質提升部署

- 使用者明確要求 COMMIT PUSH DEPLOY。改版 commit fdefd4eb052f487d55f6d787936918756c792292 已推送至 main；GitHub Pages workflow 37738922314 的 build／deploy 均 success。
- 部署後重新查證：首頁 HTTP 200，含 home-art-direction.css?v=20261008w 與 voice-motion；新 CSS、studio.js HTTP 200，腳本包含 motionPaused。
- 原有未追蹤 docs/apps-script-setup-notes.md 留在本機。設計紀錄已更新為部署成功；真機待辦維持原紀錄。
