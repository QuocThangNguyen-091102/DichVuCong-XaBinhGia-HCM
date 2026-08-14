const crypto = require('crypto');
const { getSupabaseAdmin } = require('../lib/supabaseAdmin');

const BUCKET = 'ksk-uploads';
const MAX_BYTES = 3 * 1024 * 1024; // 3MB (mã hoá base64 sẽ tăng ~33%, cần chừa dư địa dưới giới hạn 4.5MB của Vercel)
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
    return;
  }

  try {
    const { fileName, fileType, fileBase64 } = req.body || {};

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      res.status(400).json({ error: 'Thiếu dữ liệu tệp.' });
      return;
    }

    const ext = ALLOWED_TYPES[String(fileType).toLowerCase()];
    if (!ext) {
      res.status(400).json({ error: 'Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc HEIC.' });
      return;
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > MAX_BYTES) {
      res.status(400).json({ error: 'Dung lượng ảnh vượt quá 4MB.' });
      return;
    }

    const safeName = crypto.randomUUID();
    const path = `${safeName}.${ext}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: fileType, upsert: false });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      res.status(500).json({ error: 'Không thể tải ảnh lên. Vui lòng thử lại.' });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ khi tải ảnh lên.' });
  }
};
