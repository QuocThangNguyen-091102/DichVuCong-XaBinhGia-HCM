// ============================================================================
// CẤU HÌNH KHU VỰC — chỉnh sửa file này cho đúng với địa phương của bạn.
//
// - ORG_NAME: tên đơn vị hiển thị trên đầu phiếu (ví dụ: "UBND xã Bình An").
// - AREAS: danh sách các thôn/tổ/khu phố để người dân chọn khi điền phiếu.
//   Đây cũng là danh sách dùng để lọc/tìm kiếm trong trang quản trị.
// ============================================================================

const ORG_NAME = 'UBND xã Bình Giã ';

const AREAS = [
  'Ấp Vĩnh Bình',
  'Gia An',
  'Bình Trung',
  'Xuân Hoà',
  'Xuân Hậu',
  'Đồng Nghi',
  'Ấp Lộc Hoà',
  'Ấp Trung Thành',
  'Ấp Tân Hiệp',
  'Ấp Quảng Thành',
  'Ấp Hậu Cần',
];

module.exports = { ORG_NAME, AREAS };
