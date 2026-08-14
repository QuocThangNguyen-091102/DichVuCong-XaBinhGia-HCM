-- ============================================================================
-- Chạy toàn bộ nội dung file này trong Supabase Dashboard → SQL Editor → New query
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists submissions (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),

  -- I. Thông tin hành chính
  ho_ten                   text not null,
  gioi_tinh                text not null,
  ngay_sinh                date not null,
  dan_toc                  text,
  nhom_mau                 text,
  so_cccd                  text not null,
  so_bhyt                  text,
  khu_vuc                  text not null,
  noi_o_hien_tai           text not null,
  xa_phuong_noi_o          text,
  nghe_nghiep              text,
  noi_lam_viec_hoc_tap     text,
  xa_phuong_noi_lam_viec   text,
  ten_me_nguoi_giam_ho     text,
  dien_thoai               text not null,
  doi_tuong                text not null,

  -- II. Thông tin khám sức khỏe / khám sàng lọc
  hinh_thuc_kham           text not null,
  hinh_thuc_kham_khac      text,
  ngay_kham                date not null,
  noi_kham                 text not null,
  ket_qua_kham             text,
  anh_dinh_kem_url         text
);

-- Lập chỉ mục để tìm kiếm/lọc theo khu vực và theo thời gian nhanh hơn
create index if not exists idx_submissions_khu_vuc on submissions (khu_vuc);
create index if not exists idx_submissions_created_at on submissions (created_at desc);

-- Bật Row Level Security và KHÔNG thêm policy nào cả.
-- => Không ai truy cập trực tiếp được từ trình duyệt (anon key).
-- => Chỉ server (dùng service_role key trong biến môi trường Vercel) mới đọc/ghi được,
--    vì service_role luôn bỏ qua RLS.
alter table submissions enable row level security;

-- ============================================================================
-- Nếu bạn đã tạo bảng submissions từ trước (chưa có cột anh_dinh_kem_url),
-- chạy thêm dòng dưới đây để bổ sung cột mới mà không mất dữ liệu cũ:
--   alter table submissions add column if not exists anh_dinh_kem_url text;
-- ============================================================================

-- ============================================================================
-- Tạo kho lưu trữ (Storage bucket) để chứa ảnh đính kèm phiếu khám.
-- Bucket đặt ở chế độ "public" để trang quản trị và người xem link có thể
-- mở ảnh trực tiếp; việc tải ảnh LÊN vẫn chỉ thực hiện được qua server
-- (dùng service_role key), người dùng không thể tự ý tải ảnh khác vào đây.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('ksk-uploads', 'ksk-uploads', true)
on conflict (id) do nothing;
