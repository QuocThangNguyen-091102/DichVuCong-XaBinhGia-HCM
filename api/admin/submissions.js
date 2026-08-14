const { getSupabaseAdmin } = require('../../lib/supabaseAdmin');
const { isAuthenticated } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' });
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('Supabase select error:', error);
      res.status(500).json({ error: 'Không thể tải dữ liệu.' });
      return;
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error('Submissions handler error:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ.' });
  }
};
