/**
 * Worker phục vụ trang tĩnh trong web/, và trả thêm /config.json.
 *
 * Địa chỉ Apps Script và mã bảo vệ đặt trong biến môi trường của Cloudflare
 * (Settings -> Variables and Secrets), không nằm trong kho code. Nhờ vậy mọi
 * máy mở địa chỉ này đều nối sẵn, không phải nhập tay từng máy.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/config.json") {
      const body = JSON.stringify({
        u: env.SHEETS_URL || "",
        t: env.SHEETS_TOKEN || ""
      });
      return new Response(body, {
        headers: {
          "content-type": "application/json; charset=utf-8",
          // không cho lưu đệm, để đổi mã bảo vệ là có hiệu lực ngay
          "cache-control": "no-store"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
