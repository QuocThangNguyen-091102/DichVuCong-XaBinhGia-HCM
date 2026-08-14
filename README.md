# Phiếu thông tin khám sức khỏe — hướng dẫn triển khai

Trang gồm:
- `public/index.html` — phiếu điền dành cho người dân.
- `public/admin.html` — trang quản trị xem/lọc/tìm kiếm/xuất CSV, có đăng nhập.
- `api/` — các hàm serverless (Vercel) nhận và trả dữ liệu.
- `supabase/schema.sql` — script tạo bảng dữ liệu trên Supabase.

Không cần biết lập trình để triển khai — chỉ cần làm theo đúng thứ tự dưới đây.

## Bước 1 — Chỉnh sửa khu vực của bạn

Mở file `lib/areas.js`, sửa:
- `ORG_NAME`: tên đơn vị của bạn (ví dụ `"UBND xã Bình An"`).
- `AREAS`: danh sách các thôn/tổ/khu phố thực tế của bạn (mỗi dòng một tên).

## Bước 2 — Tạo dự án Supabase (miễn phí)

1. Vào [supabase.com](https://supabase.com) → đăng ký/đăng nhập → **New project**.
2. Sau khi project khởi tạo xong, vào **SQL Editor** → **New query**.
3. Dán toàn bộ nội dung file `supabase/schema.sql` vào và bấm **Run**. Lệnh này tạo bảng `submissions` để lưu dữ liệu.
4. Vào **Project Settings → API**, ghi lại 2 giá trị:
   - **Project URL** → dùng cho biến `SUPABASE_URL`.
   - **service_role secret** (không phải `anon public`) → dùng cho biến `SUPABASE_SERVICE_ROLE_KEY`.

   ⚠️ `service_role` key có toàn quyền trên database — không chia sẻ, không đưa lên GitHub.

## Bước 3 — Đưa code lên GitHub

1. Tạo một repository mới trên GitHub.
2. Đẩy toàn bộ thư mục này lên repository đó (kéo-thả trên GitHub web, hoặc dùng `git`).

## Bước 4 — Triển khai lên Vercel (miễn phí)

1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng GitHub → **Add New → Project**.
2. Chọn repository vừa tạo → **Import**.
3. Ở phần **Environment Variables**, thêm đủ 4 biến:

   | Tên biến | Giá trị |
   |---|---|
   | `SUPABASE_URL` | Project URL lấy ở Bước 2 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role secret lấy ở Bước 2 |
   | `ADMIN_PASSWORD` | mật khẩu bạn tự đặt để đăng nhập trang quản trị |
   | `ADMIN_SESSION_SECRET` | một chuỗi ký tự ngẫu nhiên bất kỳ (càng dài càng tốt) |

4. Bấm **Deploy**. Sau khi xong, bạn sẽ có một địa chỉ dạng `https://ten-du-an.vercel.app`.

## Bước 5 — Kiểm tra

- Trang chủ (`/`): điền thử phiếu và gửi.
- Trang quản trị (`/admin.html`): đăng nhập bằng `ADMIN_PASSWORD`, kiểm tra bản ghi vừa gửi xuất hiện, thử lọc theo khu vực, tìm kiếm, và xuất CSV.

## Lưu ý quan trọng

- **Supabase gói miễn phí sẽ tạm dừng nếu 7 ngày liên tục không có ai truy cập.** Nếu form ít người dùng trong thời gian dài, thỉnh thoảng vào Supabase Dashboard bấm **Resume** để khôi phục (dữ liệu không mất, chỉ tạm ngưng hoạt động).
- **Dữ liệu nhạy cảm:** phiếu thu thập CCCD, số BHYT, thông tin sức khỏe. Trang quản trị đã được khóa bằng mật khẩu và mặc định ẩn số CCCD (bấm "Ẩn số CCCD" để bật/tắt). Hãy đảm bảo bạn có thẩm quyền thu thập dữ liệu này và thông báo rõ mục đích sử dụng cho người dân.
- **Muốn đổi tên miền:** vào Vercel Project → **Settings → Domains** để gắn tên miền riêng nếu có.
- **Muốn thêm/xóa khu vực sau này:** chỉ cần sửa `lib/areas.js` rồi đẩy code lên GitHub — Vercel sẽ tự triển khai lại.
- **Nếu bạn đã tạo bảng `submissions` từ trước** (từ bản triển khai cũ), hãy vào Supabase → SQL Editor và chạy lại toàn bộ nội dung `supabase/schema.sql` một lần nữa — script được viết an toàn để chạy nhiều lần (`if not exists`, `on conflict do nothing`), sẽ tự thêm cột `anh_dinh_kem_url` và tạo kho lưu trữ ảnh `ksk-uploads` mà không ảnh hưởng dữ liệu cũ.
- **Ảnh đính kèm:** được lưu trong Supabase Storage (bucket `ksk-uploads`, ở chế độ công khai để xem link trực tiếp được — người dùng khác không thể tự ý tải ảnh lạ lên vì việc tải lên chỉ thực hiện qua server bằng service_role key). Giới hạn dung lượng mỗi ảnh là 3MB do giới hạn của Vercel.
