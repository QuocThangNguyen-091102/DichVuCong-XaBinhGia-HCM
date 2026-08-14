const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

/**
 * Trả về một Supabase client dùng service_role key — CHỈ được gọi ở phía
 * server (trong các hàm /api), không bao giờ được gửi khóa này ra trình
 * duyệt của người dùng.
 */
function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. ' +
        'Hãy khai báo trong Vercel Project Settings → Environment Variables.'
    );
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return cachedClient;
}

module.exports = { getSupabaseAdmin };
