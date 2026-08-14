// ============================================================================
// CẤU HÌNH KHU VỰC — chỉnh sửa file này cho đúng với địa phương của bạn.
//
// - ORG_NAME: tên đơn vị hiển thị trên đầu phiếu (ví dụ: "UBND xã Bình An").
// - AREAS: danh sách các thôn/tổ/khu phố để người dân chọn khi điền phiếu.
//   Đây cũng là danh sách dùng để lọc/tìm kiếm trong trang quản trị.
// ============================================================================

const ORG_NAME = 'Uỷ ban Nhân dân xã Bình Giã';

const AREAS = [
  'Thôn 1',
  'Thôn 2',
  'Thôn 3',
  'Thôn 4',
  'Tổ 1',
  'Tổ 2',
  'Tổ 3',
];

module.exports = { ORG_NAME, AREAS };
