/**
 * Kho & Đặt hàng — nơi lưu dữ liệu chung trên Google Sheets.
 *
 * Cách dùng: xem file HUONG-DAN.md. Chỉ cần sửa hai dòng ngay bên dưới.
 */

// Mã bảo vệ. ĐỔI THÀNH CHUỖI CỦA RIÊNG BẠN rồi điền y hệt vào phần mềm.
var TOKEN = 'doi-ma-nay-di-1234';

// Để trống thì dùng chính file Sheets đang chứa script này.
// Nếu tạo script rời, dán ID file Sheets vào đây (phần giữa /d/ và /edit trên thanh địa chỉ).
var SHEET_ID = '';

var TAB_KHO = 'Kho', TAB_NK = 'NhatKy', TAB_ANH = 'Anh', TAB_CAI = 'CaiDat';

function doGet(e) { return handle((e && e.parameter) || {}); }

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}
  return handle(body);
}

function handle(p) {
  if (String(p.token || '') !== TOKEN) return out({ ok: false, err: 'sai_token' });

  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (err) { return out({ ok: false, err: 'may_chu_dang_ban' }); }

  try {
    var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return out({ ok: false, err: 'khong_mo_duoc_sheets' });

    if (p.action === 'pull') return out({ ok: true, ver: readVer(ss), data: readAll(ss) });

    if (p.action === 'push') {
      var cur = readVer(ss);
      // ver = -1 nghĩa là người dùng đã chọn ghi đè, bỏ qua kiểm tra
      var sent = Number(p.ver);
      if (sent !== -1 && sent !== cur) {
        return out({ ok: true, conflict: true, ver: cur });
      }
      writeAll(ss, p.data || {});
      var nv = cur + 1;
      writeVer(ss, nv);
      return out({ ok: true, ver: nv });
    }

    return out({ ok: false, err: 'khong_ro_yeu_cau' });
  } catch (err) {
    return out({ ok: false, err: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function tab(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function rowsOf(sh) {
  if (sh.getLastRow() < 2 || sh.getLastColumn() < 1) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues()
           .filter(function (r) { return String(r[0] || '').trim() !== ''; });
}

/** Ghi đè một tab: xoá sạch rồi ghi lại tiêu đề và dữ liệu. */
function put(sh, header, rows) {
  sh.clear();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) {
    var w = header.length;
    var norm = rows.map(function (r) {
      var a = r.slice(0, w);
      while (a.length < w) a.push('');
      return a;
    });
    sh.getRange(2, 1, norm.length, w).setValues(norm);
  }
  sh.setFrozenRows(1);
}

function readVer(ss) {
  var sh = tab(ss, TAB_CAI);
  var rows = rowsOf(sh);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === 'ver') return Number(rows[i][1]) || 0;
  }
  return 0;
}

function writeVer(ss, v) {
  var sh = tab(ss, TAB_CAI);
  var rows = rowsOf(sh).filter(function (r) { return String(r[0]) !== 'ver'; });
  rows.push(['ver', v]);
  put(sh, ['khoa', 'gia_tri'], rows);
}

function readAll(ss) {
  var kho = tab(ss, TAB_KHO);
  var head = kho.getLastColumn() >= 1 && kho.getLastRow() >= 1
    ? kho.getRange(1, 1, 1, kho.getLastColumn()).getValues()[0] : [];
  // Cột size bắt đầu từ cột thứ 4: Nhóm | SKU | Tên | 38 | 39 | …
  var sizes = [];
  for (var i = 3; i < head.length; i++) {
    var n = Number(head[i]);
    if (n) sizes.push(n);
  }

  var cai = {};
  rowsOf(tab(ss, TAB_CAI)).forEach(function (r) { cai[String(r[0])] = r[1]; });

  return {
    sizes: sizes,
    kho: rowsOf(kho).map(function (r) { return r.slice(0, 3 + sizes.length); }),
    moves: rowsOf(tab(ss, TAB_NK)).map(function (r) { return r.slice(0, 13); }),
    anh: rowsOf(tab(ss, TAB_ANH)).map(function (r) { return [r[0], r[1]]; }),
    cai: cai
  };
}

function writeAll(ss, d) {
  var sizes = d.sizes || [];
  put(tab(ss, TAB_KHO),
      ['Nhóm', 'SKU', 'Tên'].concat(sizes),
      d.kho || []);

  put(tab(ss, TAB_NK),
      ['id', 'ngay', 'gio', 'loai', 'sku', 'size', 'sl',
       'ma_van_don', 'ma_don_hang', 'ghi_chu', 'huy_ngay', 'huy_gio', 'day_so'],
      d.moves || []);

  put(tab(ss, TAB_ANH), ['sku', 'anh'], d.anh || []);

  var cai = d.cai || {};
  var rows = Object.keys(cai).map(function (k) { return [k, cai[k]]; });
  var sh = tab(ss, TAB_CAI);
  var keep = rowsOf(sh).filter(function (r) { return String(r[0]) === 'ver'; });
  put(sh, ['khoa', 'gia_tri'], rows.concat(keep));
}
