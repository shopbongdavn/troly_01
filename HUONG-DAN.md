# Kho & Đặt hàng — hướng dẫn cài đặt

Phần mềm là một trang HTML chạy thẳng trong trình duyệt. Dữ liệu lưu trong máy
(localStorage) để thao tác tức thì, và đồng bộ lên một file Google Sheets để
nhiều máy dùng chung.

- `web/index.html` — phần mềm
- `apps-script/Code.gs` — code đặt trên Google để đọc/ghi Sheets

Làm theo hai phần dưới đây, khoảng 15 phút. **Làm phần A trước.**

---

## A. Google Sheets làm nơi lưu chung

### A1. Tạo file Sheets

Mở [sheet.new](https://sheet.new), đặt tên ví dụ `Kho Ijomi`. Không cần tạo cột
gì cả — phần mềm tự tạo 4 tab khi lưu lần đầu.

### A2. Dán code

Trong file Sheets vừa tạo: **Tiện ích mở rộng → Apps Script**
(Extensions → Apps Script).

Xoá hết code mẫu trong ô soạn thảo, dán toàn bộ nội dung file
`apps-script/Code.gs` vào.

### A3. Đổi mã bảo vệ

Sửa dòng đầu:

```js
var TOKEN = 'doi-ma-nay-di-1234';
```

Đổi thành một chuỗi của riêng bạn, khó đoán, ví dụ `ijomi-kho-x7k2mq9`.
Ghi lại chuỗi này, lát nữa phải điền vào phần mềm y hệt.

Dòng `SHEET_ID` để trống vì script nằm ngay trong file Sheets.

Bấm biểu tượng đĩa mềm để lưu.

### A4. Triển khai

**Triển khai → Tuỳ chọn triển khai mới** (Deploy → New deployment).

- Bấm bánh răng cạnh "Chọn loại", chọn **Ứng dụng web** (Web app)
- Thực thi với tư cách: **Tôi** (Me)
- Ai có quyền truy cập: **Bất kỳ ai** (Anyone)
- Bấm **Triển khai**

Lần đầu Google sẽ hỏi quyền: chọn tài khoản → màn hình cảnh báo hiện ra thì bấm
**Nâng cao** → **Đi tới … (không an toàn)** → **Cho phép**. Cảnh báo này là bình
thường với script tự viết.

Xong, copy **URL ứng dụng web**, dạng:

```
https://script.google.com/macros/s/AKfycb..................../exec
```

> **Về bảo mật.** "Bất kỳ ai" nghĩa là ai biết URL cũng gọi được, nên mã bảo vệ
> ở bước A3 là thứ duy nhất chặn người lạ. Đặt chuỗi khó đoán và đừng đăng URL
> đó lên chỗ công khai. Không cần chọn "Bất kỳ ai" mức thấp hơn — mức có yêu cầu
> đăng nhập Google sẽ chặn luôn cả phần mềm.

### A5. Nối phần mềm với Sheets

Mở phần mềm, kéo xuống mục **Cài đặt & sao lưu → Đồng bộ Google Sheets**:

- **Địa chỉ ứng dụng web**: dán URL vừa copy
- **Mã bảo vệ**: chuỗi đã đặt ở bước A3

Bấm **Đưa dữ liệu máy này lên Sheets**. Quay lại file Sheets sẽ thấy 4 tab:

| Tab | Nội dung |
|---|---|
| `Kho` | Nhóm, SKU, Tên, rồi mỗi size một cột. Ô ghi `N` là hàng bị khoá |
| `NhatKy` | Từng lượt xuất/nhập, kèm mã vận đơn và trạng thái huỷ |
| `Anh` | Ảnh sản phẩm |
| `CaiDat` | Ngưỡng cảnh báo và số phiên bản |

Ở máy thứ hai: mở phần mềm, điền đúng hai ô trên, bấm **Tải từ Sheets về máy**.
Từ đó mỗi lần mở trang nó tự tải về, và mỗi thay đổi tự lưu lên sau khoảng 2 giây.

---

## B. Đưa phần mềm lên Cloudflare Pages

### B1. Tạo dự án

Vào [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
**Create** → thẻ **Pages** → **Connect to Git**.

Cho phép Cloudflare truy cập GitHub, chọn kho `shopbongdavn/troly_01`.

### B2. Cấu hình

Cloudflare hiện đưa "Connect to Git" vào **Workers**, không phải Pages. Hai loại
dự án điền khác nhau — xem trên trang dự án của bạn có ô nào thì điền theo cột đó:

**Nếu là Workers** (có các tab Bindings, Observability, và ô *Deploy command*):

| Mục | Điền |
|---|---|
| Build command | **để trống** |
| Deploy command | `npx wrangler deploy` |

File `wrangler.toml` ở gốc kho đã khai báo sẵn thư mục `web`, không cần điền
thư mục ở đâu nữa. **Kiểm tra dòng `name` trong `wrangler.toml` có trùng tên dự
án trên Cloudflare không** — không trùng thì Cloudflare sẽ tạo thêm một dự án
thứ hai với địa chỉ khác.

**Nếu là Pages** (có ô *Build output directory*):

| Mục | Điền |
|---|---|
| Framework preset | None |
| Build command | **để trống** |
| Build output directory | `web` |

Đừng điền `web` vào ô *Deploy command* — Cloudflare sẽ chạy nó như một câu lệnh
và báo `/bin/sh: 1: web: not found`.

Bấm lưu và triển khai. Khoảng một phút sau được địa chỉ dạng
`troly-01.workers.dev` hoặc `troly-01.pages.dev`. Mỗi lần đẩy code mới lên
GitHub, Cloudflare tự dựng lại.

### B3. Kiểm tra

Mở địa chỉ vừa nhận trên điện thoại, điền địa chỉ Sheets và mã bảo vệ,
bấm **Tải từ Sheets về máy**. Phải thấy đúng số liệu như trên máy tính.

---

## Những điều cần biết khi dùng

**Chỉ bản trên Cloudflare Pages mới đồng bộ được.** Bản xem trên link artifact
của Claude bị chặn gọi ra mạng ngoài, nên ở đó phần mềm chỉ lưu trong máy.

**Khi hai máy sửa cùng lúc.** Mỗi lần lưu lên, số phiên bản trên Sheets tăng
một. Nếu máy bạn đang giữ số cũ, phần mềm **không ghi đè** mà hiện băng vàng hỏi
giữ bên nào:

- *Lấy bản trên Sheets* — bỏ thay đổi chưa lưu ở máy này
- *Ghi đè Sheets* — lấy dữ liệu máy này làm chuẩn, thay đổi của máy kia mất

Cách tránh: mỗi máy mở trang thì tải về trước khi làm.

**Sửa thẳng trong Google Sheets được**, nhưng phải làm lúc không máy nào đang mở
phần mềm, rồi bấm *Tải từ Sheets về máy*. Đừng thêm/bớt cột ở tab `Kho` — muốn
đổi dải size thì sửa trong phần mềm rồi để nó ghi lên.

**Vẫn nên tải file sao lưu** định kỳ ở mục Cài đặt. Sheets có lịch sử sửa đổi,
nhưng file `.json` khôi phục nhanh hơn nhiều.

**Mất mạng vẫn dùng được.** Phần mềm chạy trên dữ liệu trong máy, chỉ phần lưu
lên Sheets là báo lỗi. Có mạng lại thì bấm *Đưa dữ liệu máy này lên Sheets*.
