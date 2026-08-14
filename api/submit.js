const { getSupabaseAdmin } = require('../lib/supabaseAdmin');
const { AREAS } = require('../lib/areas');

// Các trường bắt buộc phải có giá trị (khớp với dấu * trên phiếu)
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
    return;
  }

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

    if (!/^[0-9]{12}$/.test(clean(body.so_cccd) || '')) {
      res.status(400).json({ error: 'Số CCCD phải gồm đúng 12 chữ số.' });
      return;
    }

    if (!/^[0-9]{10}$/.test(clean(body.dien_thoai) || '')) {
      res.status(400).json({ error: 'Số điện thoại phải gồm đúng 10 chữ số.' });
      return;
    }

    const record = {
      ho_ten: clean(body.ho_ten).toUpperCase(),
      gioi_tinh: clean(body.gioi_tinh),
      ngay_sinh: clean(body.ngay_sinh),
      dan_toc: clean(body.dan_toc),
      nhom_mau: clean(body.nhom_mau),
      so_cccd: clean(body.so_cccd),
      so_bhyt: clean(body.so_bhyt),
      noi_o_hien_tai: clean(body.noi_o_hien_tai),
      xa_phuong_noi_o: clean(body.xa_phuong_noi_o),
      nghe_nghiep: clean(body.nghe_nghiep),
      noi_lam_viec_hoc_tap: clean(body.noi_lam_viec_hoc_tap),
      xa_phuong_noi_lam_viec: clean(body.xa_phuong_noi_lam_viec),
      ten_me_nguoi_giam_ho: clean(body.ten_me_nguoi_giam_ho),
      dien_thoai: clean(body.dien_thoai),
      doi_tuong: clean(body.doi_tuong),
      khu_vuc: clean(body.khu_vuc),
      hinh_thuc_kham: clean(body.hinh_thuc_kham),
      hinh_thuc_kham_khac: clean(body.hinh_thuc_kham_khac),
      ngay_kham: clean(body.ngay_kham),
      noi_kham: clean(body.noi_kham),
      ket_qua_kham: clean(body.ket_qua_kham),
      anh_dinh_kem_url: clean(body.anh_dinh_kem_url),
    };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('submissions').insert(record);

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).json({ error: 'Không thể lưu dữ liệu vào lúc này. Vui lòng thử lại sau.' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit handler error:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại.' });
  }
};
