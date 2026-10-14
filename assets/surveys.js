/* ===== 問卷內容（與講義的課前問卷、課程回饋問卷一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'pre-1', lesson: 1, title: '第一堂課前問卷（入班問卷）', intro: '瞭解你的歌唱經驗、目前的困擾與期待，老師會依照結果調整課程。', questions: [
    { q: '過去的歌唱經驗', type: 'multi', options: ['沒有經驗', 'Ktv', '合唱團', '樂團', '上過歌唱課'] },
    { q: '目前的吉他程度', type: 'single', options: ['剛剛入門', '可以彈奏簡單和弦', '可以自彈自唱整首歌'] },
    { q: '最喜歡的三位歌手', type: 'short', placeholder: '例如：盧廣仲、田馥甄、五月天' },
    { q: '平常最常演唱的一首歌', type: 'short', hint: '第一堂請備妥這首歌的歌詞或和弦譜' },
    { q: '自我評分（1 到 5 分）', type: 'matrix', rows: ['音準', '節奏', '氣息', '高音', '咬字', '台風'] },
    { q: '演唱時最大的困擾', type: 'multi', options: ['高音唱不上去', '破音', '走音', '氣息不足', '唱完喉嚨疼痛', '容易緊張'], other: true },
    { q: '六堂課結束時，最希望達成的一件事', type: 'text' },
    { q: '課堂上是否願意獨唱', type: 'single', options: ['願意', '希望與同伴一起', '暫時保留'] },
    { q: '健康狀況（選填）', type: 'text', optional: true, hint: '是否有聲帶結節、過敏性鼻炎、氣喘或抽菸習慣，僅供老師調整練習強度' }
  ] },
  { id: 'pre-2', lesson: 2, title: '第二堂課前問卷', intro: '上一週的練習狀況，以及你的呼吸習慣。', questions: [
    { q: '上週的五項課後練習，完成的項數', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: '拆解曲式時，哪一個段落最難分辨', type: 'single', options: ['主歌', '前導句', '副歌', '橋段', '破格句'] },
    { q: '演唱一首歌時，通常感到氣息不足的段落', type: 'multi', options: ['主歌', '副歌', '長音', '快歌的密集歌詞'] },
    { q: '演唱完一小時後，喉嚨的感覺', type: 'single', options: ['舒服', '乾燥', '緊繃', '疼痛', '聲音沙啞'] },
    { q: '平均每天喝水量', type: 'number', unit: 'c.c.' },
    { q: '平均每天睡眠時數', type: 'number', unit: '小時' },
    { q: '站在鏡子前深吸一口氣，肩膀是否上抬', type: 'single', options: ['會上抬', '保持不動', '尚不確定'] },
    { q: '在家以 /s/ 吐氣並計時，最長持續的秒數', type: 'number', unit: '秒' }
  ] },
  { id: 'pre-3', lesson: 3, title: '第三堂課前問卷', intro: '呼吸練習的進度，以及你對自己聲音的感受。', questions: [
    { q: '七天呼吸紀錄：/s/ 吐氣的起始秒數', type: 'number', unit: '秒' },
    { q: '七天呼吸紀錄：進步後的秒數', type: 'number', unit: '秒' },
    { q: '呼吸課表中最難持續的一項', type: 'short' },
    { q: '演唱時，身體感到振動的位置', type: 'multi', options: ['胸口', '喉嚨', '鼻樑', '眉心', '頭頂', '沒有感覺'] },
    { q: '朋友對你聲音的形容', type: 'multi', options: ['明亮', '沉悶', '厚實', '單薄', '鼻音重', '氣音多'] },
    { q: '演唱高音時的感覺', type: 'single', options: ['擠壓', '用喊的', '容易破音', '自動轉成假音', '還算輕鬆'] },
    { q: '對台語歌的熟悉程度', type: 'single', options: ['經常聆聽也經常演唱', '聽過、尚未唱過', '幾乎沒有接觸'] }
  ] },
  { id: 'pre-4', lesson: 4, title: '第四堂課前問卷', intro: '共鳴練習的心得，以及你的咬字習慣。', questions: [
    { q: '上週找到的換聲區大約落在哪一個音（尚不確定也沒有關係）', type: 'short', optional: true, placeholder: '例如：E4' },
    { q: '三種共鳴中，最容易找到的是', type: 'single', options: ['胸腔', '口腔', '頭腔'] },
    { q: '三種共鳴中，最難找到的是', type: 'single', options: ['胸腔', '口腔', '頭腔'] },
    { q: '演唱時，是否曾被說「聽不清楚歌詞」', type: 'single', options: ['經常', '偶爾', '從未'] },
    { q: '咬字自我評分（1 到 5 分）', type: 'matrix', rows: ['平舌與捲舌的區分', 'ㄣ與ㄥ的區分'] },
    { q: '是否能閱讀簡譜，或能以 Do Re Mi 唱出旋律', type: 'single', options: ['可以', '略懂', '尚未學會'] },
    { q: '練習吉他或歌唱時，是否使用節拍器', type: 'single', options: ['經常', '偶爾', '從未'] }
  ] },
  { id: 'pre-5', lesson: 5, title: '第五堂課前問卷', intro: '發聲練習的進度、想模仿的歌手，以及結業演唱的初步想法。', questions: [
    { q: '促音和弦練習的最高速度', type: 'number', unit: 'Bpm' },
    { q: '三步驟學唱中，最有幫助的是哪一步', type: 'single', options: ['唱名', '母音', '歌詞'] },
    { q: '最想模仿的歌手與原因', type: 'text' },
    { q: '演唱時，是否思考歌詞的意思', type: 'single', options: ['經常', '偶爾', '幾乎只留意音準'] },
    { q: '在他人面前演唱的緊張程度', type: 'scale', low: '毫不緊張', high: '非常緊張' },
    { q: '你認為自己聲音最有特色的地方', type: 'short' },
    { q: '第六堂結業演唱的偏好', type: 'single', options: ['獨唱', '雙人', '小組'] },
    { q: '結業演唱是否自彈自唱', type: 'single', options: ['自彈自唱', '只負責演唱'] }
  ] },
  { id: 'pre-6', lesson: 6, title: '第六堂課前問卷', intro: '在家先測量音域，並決定結業演唱的歌曲。', questions: [
    { q: '可用音域：最低音', type: 'short', placeholder: '例如：A2' },
    { q: '可用音域：最高音', type: 'short', placeholder: '例如：E4' },
    { q: '完全音域：最低音', type: 'short', optional: true },
    { q: '完全音域：最高音', type: 'short', optional: true },
    { q: '模仿筆記選擇的歌手，以及最想保留的一個技巧', type: 'text' },
    { q: '六堂課中收穫最多的一項', type: 'single', options: ['呼吸', '共鳴', '發聲', '表情應用', '曲式'] },
    { q: '目前仍然最困擾的問題', type: 'text' },
    { q: '結業演唱的歌曲與預計使用的調', type: 'short' },
    { q: '伴奏的需求', type: 'single', options: ['需要老師或社員伴奏', '自彈自唱', '使用伴奏音檔'] }
  ] },
  { id: 'feedback', lesson: 6, title: '課程回饋問卷', intro: '結業當天填寫，你的回饋會用來改進下一期的課程。', questions: [
    { q: '各構面滿意度（1 到 5 分）', type: 'matrix', hint: '1 分為非常不滿意，5 分為非常滿意', rows: ['教學方式', '教學內容', '講義內容', '講師專業', '講師態度'] },
    { q: '整體滿意度', type: 'scale', low: '不滿意', high: '非常滿意' },
    { q: '最有幫助的一堂', type: 'single', options: ['第一堂', '第二堂', '第三堂', '第四堂', '第五堂', '第六堂'] },
    { q: '原因', type: 'short', optional: true },
    { q: '每堂 120 分鐘的節奏', type: 'single', options: ['太快', '剛好合適', '太慢'] },
    { q: '課後練習的份量', type: 'single', options: ['太多', '剛好合適', '太少'] },
    { q: '希望進階班加強的主題', type: 'multi', options: ['高音', '轉音', '合聲', '舞台表演', '自彈自唱', '歌詞創作'], optional: true },
    { q: '想對老師說的話', type: 'text', optional: true },
    { q: '六堂課學習成效自評（1 到 5 分）', type: 'matrix', hint: '1 分為完全做不到，5 分為能穩定做到', rows: [
      '第一堂：能說明聲音形成與歌唱三要素，並拆解一首歌的曲式',
      '第二堂：能以胸腹式呼吸演唱，並在歌詞上規劃換氣點',
      '第三堂：能分辨並運用胸腔、口腔、頭腔共鳴',
      '第四堂：能以正確的母音口型與咬字演唱',
      '第五堂：能運用長音、短音、頓音與模仿技巧表達情感',
      '第六堂：能測量自己的音域，並為歌曲設定適合的調'
    ] },
    { q: '目前 /s/ 吐氣最長持續的秒數', type: 'number', unit: '秒' },
    { q: '目前的可用音域', type: 'number', unit: '度', optional: true },
    { q: '和第一堂相比，歌唱能力的整體進步程度', type: 'scale', low: '沒有進步', high: '進步很多' }
  ] }
];
