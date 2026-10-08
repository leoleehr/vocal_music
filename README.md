# 亞東吉他社 流行歌唱班

亞東科技大學吉他社流行歌唱班的課程教材，主講：畫素音樂工作坊 Pixel Studio 李奕勳。

課程網站（手機也能瀏覽）：https://leoleehr.github.io/vocal_music/

六堂課、每堂 120 分鐘，每堂課的流程是：課前問卷、課堂上依起承轉合進行，最後是課後練習。

## 內容

| 路徑 | 說明 |
| --- | --- |
| `index.html` | 課程首頁：六堂課總覽、手機練唱工具、每堂 120 分鐘節奏、工作坊介紹 |
| `handbook.html` | 講義與教案的網頁版：讀取 `docs/course-handbook.md`，每堂開頭附「本堂歌曲」影片，內文的《歌名》後面有播放鈕 |
| `survey.html` | 課程問卷：六份課前問卷與課程回饋，學員在網站上填寫姓名、科系與問卷內容，直接送到老師的試算表 |
| `backend/` | Google 試算表後台：Apps Script 程式與安裝步驟（見 `backend/README.md`） |
| `handbook-print.html` | 講義的 A4 列印排版頁，用來產生 PDF |
| `docs/course-handbook.md` | 六堂課的講義與教案原稿：課前問卷、課程綱要、擴充講義、課堂互動、課後練習 |
| `docs/vocal-class-handbook.pdf` | 已排版的 PDF 講義（封面、目錄、各堂歌曲 QR Code、頁碼） |
| `slides/lesson-01/index.html` | 第一堂「歌唱序論」課堂投影片 |
| `slides/lesson-02/index.html` | 第二堂「歌唱基本條件與呼吸」課堂投影片 |
| `slides/lesson-03/index.html` | 第三堂「歌唱共鳴條件」課堂投影片 |
| `slides/lesson-04/index.html` | 第四堂「歌唱發聲練習」課堂投影片 |
| `slides/lesson-05/index.html` | 第五堂「歌唱綜合應用」課堂投影片 |
| `slides/lesson-06/index.html` | 第六堂「歌唱自我條件設定」課堂投影片 |
| `assets/` | 共用樣式、腳本與圖檔（見下方） |

### assets

2026-10-06 視覺改版：首頁、講義及問卷由 `studio.css` 延伸既有設計，首頁聲波與聲音控制在 `studio.js`，投影片由 `deck-studio.css` 調整。設計方向、驗證結果與目前限制見 [設計檢查紀錄](docs/design-review.md)。

| 檔案 | 用途 |
| --- | --- |
| `deck.css`、`deck.js` | 投影片版面、換頁、手機課程 App 模式 |
| `site.css` | 首頁與講義頁 |
| `responsive.css` | 響應式版面：手機、手機橫向、平板、筆電、大螢幕各自的排版調整 |
| `ui.js` | 表格轉卡片、目錄抽屜 |
| `interact.css`、`interact.js` | 課堂互動元件 |
| `songs.js`、`youtube.js`、`youtube.css` | 課程歌曲清單與 YouTube 播放（先顯示縮圖，點擊後在大視窗播放） |
| `config.js` | 後台網址設定（Apps Script 部署後填入） |
| `backend.js`、`backend.css` | 學員資料、送出佇列、上傳錄音、送出提示 |
| `surveys.js` | 問卷題目 |
| `pixel.js` | 插入 Logo |
| `logo-color-dark-notag.png` | 首頁與講義封面使用的主 Logo（深色底、不含英文標語，下方接「畫素音樂工作坊」） |
| `logo-color-dark.png`、`logo-color-light.png` | 含英文標語的彩色 Logo（深色底、淺色底用，透明背景） |
| `logo-mono-white.png`、`logo-mono-black.png` | 單色 Logo（深色底用白色、淺色底用黑色，透明背景） |
| `favicon.png`、`og-image.png` | 瀏覽器分頁圖示、分享預覽圖 |

## 投影片操作

- 換頁：← → 方向鍵、空白鍵，或點下方按鈕；`F` 全螢幕，`Home`／`End` 跳到第一張／最後一張
- 網址加上 `#頁碼` 可直接開啟指定頁，例如 `index.html#14`
- 每三張投影片至少一個互動，右上角的「互動」標籤寫著使用的教學技巧
- 歌曲出現的地方有影片卡片或 ▶ 播放鈕，點擊後在投影片上直接播放 YouTube
- 手機或直立平板會自動改成課程 App 模式：上方顯示目前張數與閱讀進度，右下角「目錄」可跳到任一張；表格轉成卡片，QR Code 改為按鈕
- 列印時每張投影片各佔一頁

## 課堂互動元件

在投影片中以 class 宣告即可使用：

| 元件 | 用途 |
| --- | --- |
| `.quiz` | 選擇題：手指投票後揭曉答案與解釋 |
| `.poll` | 舉手計票：老師點選項 +1，長條圖即時更新 |
| `.reveal` | 揭曉：預測—觀察—解釋的答案 |
| `.picker` | 隨機點名：名單存在老師電腦 |
| `.score` | 分組計分板：組名可直接修改 |
| `.phase` | 分段計時：想—配對—分享、示範—跟做 |
| `.order` | 排序遊戲：點兩張牌交換位置 |
| `.flips` | 翻牌：提取練習、迷思破解 |
| `.wavelab` | 聲波實驗室：調整頻率與振幅，邊聽邊看 |
| `.rhythm-game` | 節奏挑戰：播放六種節奏，學員用 Ta 唱出，比對拍點並顯示搶拍、拖拍（也可改用拍點鍵） |
| `.pitch` | 音準挑戰：按「開始練習」即計時，麥克風即時辨識音高，命中時顯示用時；`data-seq="scale"` 依 C 大調音階依序出題 |
| `.siren` | 警笛滑音：寬音域音高曲線，記錄最低音、最高音並標記換聲點 |
| `.resolab` | 共鳴觀測站：音高與音量即時曲線，錄下後拖曳標記胸腔／口腔／頭腔，比較音高與音量變化，可下載觀測圖或上傳 |
| `.scalepractice` | 音階跟唱：男聲／女聲選起始音，拍速與半音可調，鋼琴帶唱上行一個八度再下行，可每輪升半音、輪換母音 |
| `.staccato` | 促音和弦跟唱：七個三和弦 1 3 5 3 1 3 5 3、1 斷音上下行，拍速與半音可調，含加速挑戰與班級紀錄 |
| `.stopwatch` | 碼表：繞口令計時，保留每一位的成績並標出最快 |
| `.mirror` | 鏡子：手機前鏡頭對照口型，畫面不錄製、不上傳 |
| `.dynmap` | 情緒地圖：每段力度（p／mp／mf／f）舉手計票，顯示全班共識 |
| `.range` | 音域測量：參考音逐音上下，設定可用音域；麥克風偵測完全音域並算出度數 |
| `.transpose` | 自定調計算器：帶入可用最高音，算出自定調、餘裕方案與吉他移調夾位置 |
| `.zero` | 第零號錄音對照：從手機選檔，和同頁的結業錄音接著播放 |
| `.breath` | 吐氣測量：按「開始計時」立即計時，吐完自動停止並計算穩定度，可做前測與後測 |
| `.recorder` | 錄音：開始錄音即倒數計時，錄完可播放與下載 |
| `.lyricmark` | 歌詞換氣標記：對照老師版；`data-marks="●\|ŋ"` 可改用其他記號（如韻腳、後鼻音） |
| `.exit` | 出場券 3-2-1：可複製貼到群組 |
| `.log7`、`.checks[data-id]` | 七天紀錄表、作業勾選 |
| `.qr` | QR Code：手機同步、課前問卷 |
| `.yt[data-song]` | 歌曲影片卡片；加上 `chip` 為行內播放鈕 |

互動結果會連同學員的姓名與科系，送到 Google 試算表後台（設定方式見 `backend/README.md`）。出場券、七天紀錄、換氣標記與錄音由學員按「送出」或「上傳給老師」；選擇題、排序、音準挑戰、吐氣測量、警笛滑音與作業勾選會自動記錄。麥克風功能需以 https 開啟並允許瀏覽器使用麥克風。

## 更新講義 PDF

修改 `docs/course-handbook.md` 後，以本機伺服器開啟 `handbook-print.html`，再用 Chrome 輸出 PDF：

```bash
python -m http.server 8765
chrome --headless=new --no-pdf-header-footer --generate-pdf-document-outline --virtual-time-budget=20000 \
  --print-to-pdf=docs/vocal-class-handbook.pdf http://localhost:8765/handbook-print.html
```

也可以直接在瀏覽器開啟 `handbook-print.html`，按「列印／另存 PDF」。

## 新增一堂投影片

複製 `slides/lesson-02/index.html`，保留 `<head>` 與底部的 `<script>`，替換 `<section class="slide">` 內容即可沿用同一套設計。新的歌曲請先加進 `assets/songs.js`。

原始 PDF 講義與歌曲和弦譜涉及第三方著作權，所以沒有放進這個 repo。
