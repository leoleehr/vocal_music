# 亞東吉他社 流行歌唱班

亞東科技大學吉他社流行歌唱班的課程教材，主講：畫素音樂工作坊 Pixel Studio 李奕勳。

課程網站（手機也能瀏覽）：https://leoleehr.github.io/vocal_music/

六堂課、每堂 120 分鐘，每堂課的流程是：課前問卷、課堂上依起承轉合進行，最後是課後練習。

## 內容

| 路徑 | 說明 |
| --- | --- |
| `index.html` | 課程首頁：六堂課總覽、每堂 120 分鐘節奏、工作坊介紹 |
| `handbook.html` | 講義與教案的網頁版，讀取 `docs/course-handbook.md` 並轉成網頁，附各堂快速跳轉 |
| `docs/course-handbook.md` | 六堂課的講義與教案：課前問卷、120 分鐘課程綱要、擴充講義、課後練習 |
| `slides/lesson-01/index.html` | 第一堂「歌唱序論」課堂投影片（單一 HTML 檔，可直接用瀏覽器開啟） |
| `slides/lesson-02/index.html` | 第二堂「歌唱基本條件與呼吸」課堂投影片，內建 /s/ 吐氣碼表與節拍器 |

| `assets/` | 共用樣式與腳本：`deck.css`／`deck.js`（投影片）、`site.css`（首頁與講義）、`pixel.js`（插入 Logo）、`logo-dark.png`（深色底用，白色標語）、`logo-light.png`（淺色底用）、`logo-mark.png`（PIXEL 小標）、`favicon.png`、`og-image.png` |

## 投影片操作

- 換頁：← → 方向鍵、空白鍵、手機左右滑動，或點下方按鈕
- `F`：全螢幕；`Home`／`End`：回到第一張／跳到最後一張
- 網址加上 `#頁碼` 可直接開啟指定頁，例如 `index.html#14`
- 每份投影片的休息頁都有十分鐘倒數計時器
- 第二堂的第 3、19 張有吐氣碼表，第 12、15 張有可調速的節拍器（點擊後才會發出聲音）
- 手機或直立平板會自動改成上下捲動的閱讀模式，頂端有回到課程首頁的連結
- 列印時每張投影片各佔一頁

新增一堂投影片時，複製 `slides/lesson-02/index.html`，保留 `<head>` 與底部的兩個 `<script>`，替換 `<section class="slide">` 內容即可沿用同一套設計。

原始 PDF 講義與歌曲和弦譜涉及第三方著作權，所以沒有放進這個 repo。
