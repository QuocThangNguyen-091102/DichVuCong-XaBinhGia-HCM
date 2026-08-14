const { getSupabaseAdmin } = require('../../../lib/supabaseAdmin');
const { isAuthenticated } = require('../../../lib/auth');
const { AREAS } = require('../../../lib/areas');

// Các trường được phép sửa từ trang quản trị (không cho sửa id/created_at).
const EDITABLE_FIELDS = [
  'ho_ten',
  'gioi_tinh',
  'ngay_sinh',
  'dan_toc',
  'nhom_mau',
  'so_cccd',
  'so_bhyt',
  'khu_vuc',
  'noi_o_hien_tai',
  'xa_phuong_noi_o',
  'nghe_nghiep',
  'noi_lam_viec_hoc_tap',
  'xa_phuong_noi_lam_viec',
  'ten_me_nguoi_giam_ho',
  'dien_thoai',
  'doi_tuong',
  'hinh_thuc_kham',
  'hinh_thuc_kham_khac',
  'ngay_kham',
  'noi_kham',
  'ket_qua_kham',
];

const REQUIRED_FIELDS = [
  'ho_ten',
  'gioi_tinh',
  'ngay_sinh',
  'so_cccd',
  'noi_o_hien_tai',
  'dien_thoai',
  'doi_tuong',
  'khu_vuc',
  'hinh_thuc_kham',
  'ngay_kham',
  'noi_kham',
];

function clean(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Kiểm tra id có đúng định dạng UUID để tránh truy vấn với giá trị bất thường.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' });
    return;
  }

  const { id } = req.query;
  if (!id || !UUID_RE.test(id)) {
    res.status(400).json({ error: 'ID bản ghi không hợp lệ.' });
    return;
  }

  const supabase = getSupabaseAdmin();

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        res.status(500).json({ error: 'Không thể xóa bản ghi. Vui lòng thử lại.' });
        return;
      }
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Delete handler error:', err);
      res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ.' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body || {};

      for (const field of REQUIRED_FIELDS) {
        if (!clean(body[field])) {
          res.status(400).json({ error: `Vui lòng điền đầy đủ thông tin bắt buộc (thiếu: ${field}).` });
          return;
        }
      }

      if (!AREAS.includes(body.khu_vuc)) {
        res.status(400).json({ error: 'Khu vực (thôn/tổ) không hợp lệ.' });
        return;
      }

      const update = {};
      for (const field of EDITABLE_FIELDS) {
        if (field in body) {
          update[field] = field === 'ho_ten' ? clean(body[field])?.toUpperCase() ?? null : clean(body[field]);
        }
      }

      const { error } = await supabase.from('submissions').update(update).eq('id', id);
      if (error) {
        console.error('Supabase update error:', error);
        res.status(500).json({ error: 'Không thể lưu thay đổi. Vui lòng thử lại.' });
        return;
      }
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Update handler error:', err);
      res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ.' });
    }
    return;
  }

  res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
};
