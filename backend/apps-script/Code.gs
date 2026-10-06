/**
 * 流行歌唱班｜課程資料後台（Google Apps Script）
 *
 * 綁定在「流行歌唱班｜課程資料後台」試算表上，接收課程網站送來的資料：
 *   學員名單、各份問卷、互動紀錄、出場券、練習紀錄、錄音（存到 Google Drive）。
 *
 * 安裝步驟請見 backend/README.md。
 */

var TABS = {
  students: { name: '學員名單', head: ['首次登錄', '最後活動', '姓名', '科系', '裝置代碼', '送出次數'] },
  interactions: { name: '互動紀錄', head: ['時間', '姓名', '科系', '堂次', '投影片', '互動類型', '項目', '結果', '數值', '詳細資料'] },
  exit: { name: '出場券', head: ['時間', '姓名', '科系', '堂次', '今天學到的', '想多練習的', '想問老師的'] },
  log: { name: '練習紀錄', head: ['時間', '姓名', '科系', '堂次', '天數', '欄位一', '欄位二', '欄位三'] },
  rec: { name: '錄音', head: ['時間', '姓名', '科系', '堂次', '名稱', '長度（秒）', '檔案連結'] }
};
var DEFAULT_CODE = 'PIXEL2026';
var TYPE_LABEL = { quiz: '選擇題', order: '排序遊戲', poll: '舉手計票', score: '分組計分', pitch: '音準挑戰', breath: '吐氣測量', lyric: '歌詞換氣標記', homework: '作業勾選' };
var FOLDER_NAME = '流行歌唱班_學員錄音';

/* ---------- 選單 ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('歌唱班後台')
    .addItem('初始化工作表', 'setup')
    .addItem('設定課程代碼', 'setCode')
    .addItem('開啟錄音資料夾', 'openFolder')
    .addToUi();
}

/* ---------- 初始化：建立工作表、表頭、錄音資料夾、預設課程代碼 ---------- */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (k) { sheetOf(TABS[k]); });
  var first = ss.getSheets()[0];
  if (first.getName() === '工作表1' || first.getName() === 'Sheet1') {
    if (first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  }
  folder();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLASS_CODE')) props.setProperty('CLASS_CODE', DEFAULT_CODE);
  try {
    SpreadsheetApp.getUi().alert('初始化完成', '工作表與錄音資料夾已建立。\n目前的課程代碼：' + props.getProperty('CLASS_CODE') +
      '\n\n下一步：部署 → 新增部署作業 → 網頁應用程式（執行身分：我；存取權：所有人），並將網址提供給網站。', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) { Logger.log('目前的課程代碼：' + props.getProperty('CLASS_CODE')); }
}

function setCode() {
  var ui = SpreadsheetApp.getUi(), props = PropertiesService.getScriptProperties();
  var r = ui.prompt('設定課程代碼', '目前的代碼：' + (props.getProperty('CLASS_CODE') || DEFAULT_CODE) + '\n請輸入新的代碼（學員填寫資料時需要輸入）：', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() === ui.Button.OK && r.getResponseText().trim()) {
    props.setProperty('CLASS_CODE', r.getResponseText().trim());
    ui.alert('已更新課程代碼：' + r.getResponseText().trim());
  }
}

function openFolder() {
  var url = folder().getUrl();
  var html = HtmlService.createHtmlOutput('<p style="font-family:sans-serif"><a href="' + url + '" target="_blank">開啟「' + FOLDER_NAME + '」</a></p>').setWidth(320).setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, '錄音資料夾');
}

/* ---------- 網頁端點 ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.code !== undefined) return json({ ok: true, valid: p.code === classCode() });
  return json({ ok: true, service: '流行歌唱班課程資料後台' });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad-json' }); }
  if (!body || body.code !== classCode()) return json({ ok: false, error: 'code' });
  var items = body.items || [];
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  var results = [];
  try {
    items.forEach(function (it) {
      try { results.push({ id: it.id, ok: true, url: handle(it) || '' }); }
      catch (err) { results.push({ id: it.id, ok: false, error: String(err) }); }
    });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return json({ ok: true, results: results });
}

/* ---------- 依資料類型寫入 ---------- */
function handle(it) {
  var p = it.profile || {}, d = it.data || {}, ts = it.ts ? new Date(it.ts) : new Date();
  var name = clean(p.name), dept = clean(p.dept), lesson = it.lesson ? '第' + Number(it.lesson) + '堂' : '';
  touchStudent(name, dept, p.device, ts);
  switch (it.type) {
    case 'profile':
      return '';
    case 'survey':
      return writeSurvey(it, ts, name, dept);
    case 'exit':
      sheetOf(TABS.exit).appendRow([ts, name, dept, lesson].concat((d.answers || []).slice(0, 3).map(clean)));
      return '';
    case 'log7':
      var sh = sheetOf(TABS.log);
      (d.rows || []).forEach(function (r) { if (r.slice(1).some(function (v) { return String(v).trim(); })) sh.appendRow([ts, name, dept, lesson, '第' + (r[0]) + '天'].concat(r.slice(1).map(clean))); });
      return '';
    case 'recording':
      var blob = Utilities.newBlob(Utilities.base64Decode(d.base64), d.mime || 'audio/webm', safeName(d.filename || '錄音'));
      var file = lessonFolder(it.lesson).createFile(blob);
      file.setDescription(name + '（' + dept + '）' + lesson);
      sheetOf(TABS.rec).appendRow([ts, name, dept, lesson, clean(d.label), d.seconds || '', file.getUrl()]);
      return file.getUrl();
    default:
      sheetOf(TABS.interactions).appendRow([ts, name, dept, lesson, it.slide || '', TYPE_LABEL[it.type] || clean(it.type), clean(d.item), clean(d.result), d.value === undefined ? '' : d.value, JSON.stringify(d.detail || '')]);
      return '';
  }
}

function writeSurvey(it, ts, name, dept) {
  var d = it.data || {}, title = clean(d.title || '問卷'), qs = d.questions || [], ans = d.answers || [];
  var sh = sheetOf({ name: title.slice(0, 90), head: ['時間', '姓名', '科系'] });
  var head = sh.getRange(1, 1, 1, Math.max(3, sh.getLastColumn())).getValues()[0];
  var row = [ts, name, dept];
  qs.forEach(function (q, k) {
    var col = head.indexOf(q);
    if (col < 0) { col = head.length; head.push(q); sh.getRange(1, col + 1).setValue(q).setFontWeight('bold').setBackground('#f4efe3'); }
    row[col] = clean(ans[k]);
  });
  for (var i = 0; i < row.length; i++) if (row[i] === undefined) row[i] = '';
  sh.appendRow(row);
  return '';
}

/* ---------- 工具 ---------- */
function touchStudent(name, dept, device, ts) {
  if (!name) return;
  var sh = sheetOf(TABS.students), last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2, 1, last - 1, 6).getValues() : [];
  for (var i = 0; i < vals.length; i++) {
    if (vals[i][2] === name && vals[i][3] === dept) {
      sh.getRange(i + 2, 2).setValue(ts);
      sh.getRange(i + 2, 6).setValue((Number(vals[i][5]) || 0) + 1);
      return;
    }
  }
  sh.appendRow([ts, ts, name, dept, clean(device), 1]);
}

function sheetOf(def) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(def.name);
  if (!sh) {
    sh = ss.insertSheet(def.name);
    sh.getRange(1, 1, 1, def.head.length).setValues([def.head]).setFontWeight('bold').setBackground('#f4efe3');
    sh.setFrozenRows(1);
    sh.getRange('A:B').setNumberFormat('yyyy/mm/dd hh:mm');
  }
  return sh;
}

function folder() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function lessonFolder(lesson) {
  var root = folder(), name = lesson ? '第' + Number(lesson) + '堂' : '其他', it = root.getFoldersByName(name);
  return it.hasNext() ? it.next() : root.createFolder(name);
}

function classCode() { return PropertiesService.getScriptProperties().getProperty('CLASS_CODE') || DEFAULT_CODE; }
function clean(v) { return v === undefined || v === null ? '' : String(v).replace(/^[=+\-@]/, "'$&").slice(0, 5000); }
function safeName(s) { return String(s).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
