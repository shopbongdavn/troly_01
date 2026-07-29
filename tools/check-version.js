/* Số phiên bản nằm ở hai chỗ: hằng APP_VER trong web/index.html và web/version.json.
   Lệch nhau thì trang sẽ báo "có bản mới" mãi không hết, nên kiểm trước khi đẩy. */
const fs=require("fs");
const html=fs.readFileSync("web/index.html","utf8");
const json=JSON.parse(fs.readFileSync("web/version.json","utf8"));
const m=/const APP_VER="([^"]+)", APP_TEN="([^"]*)"/.exec(html);
if(!m){console.error("KHÔNG tìm thấy APP_VER trong web/index.html");process.exit(1)}
const loi=[];
if(m[1]!==json.ver)loi.push(`số phiên bản lệch: index.html = ${m[1]}, version.json = ${json.ver}`);
if(m[2]!==json.ten)loi.push(`tên phiên bản lệch:\n  index.html   = ${m[2]}\n  version.json = ${json.ten}`);
if(loi.length){loi.forEach(l=>console.error("LỖI: "+l));process.exit(1)}
console.log(`OK — v${json.ver} · ${json.ten}`);
