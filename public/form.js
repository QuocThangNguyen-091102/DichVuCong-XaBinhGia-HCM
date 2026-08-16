(function () {
  if (window.mountBirdFlock) mountBirdFlock('bird-flock-form', { count: 3 });

  if (window.mountTrongDong) {
    window.mountTrongDong('motif-top-right', {});
    window.mountTrongDong('motif-bottom-left', { rays: 12, sawCount: 24, birdCount: 6 });
  }

  const form = document.getElementById('ksk-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('status-message');
  const khuVucSelect = document.getElementById('khu_vuc');
  const orgNameEls = [document.getElementById('org-name'), document.getElementById('org-name-footer')];
  const fileInput = document.getElementById('anh_dinh_kem');
  const MAX_FILE_BYTES = 3 * 1024 * 1024;

  const otherRadio = document.getElementById('ht-7');
  const otherInput = document.getElementById('hinh_thuc_kham_khac');
  const hinhThucRadios = document.querySelectorAll('input[name="hinh_thuc_kham"]');

  function toggleOtherField() {
    const show = otherRadio.checked;
    otherInput.hidden = !show;
    if (!show) otherInput.value = '';
  }

  hinhThucRadios.forEach((radio) => radio.addEventListener('change', toggleOtherField));

  const cccdInput = document.getElementById('so_cccd');
  if (cccdInput) {
    cccdInput.addEventListener('input', () => {
      cccdInput.value = cccdInput.value.replace(/[^0-9]/g, '').slice(0, 12);
    });
  }

  const phoneInput = document.getElementById('dien_thoai');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  function pad2(n) {
    return n.toString().padStart(2, '0');
  }

  function isValidDate(d, m, y) {
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (y < 1900 || y > new Date().getFullYear() + 1) return false;
    if (m < 1 || m > 12) return false;
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return false;
    return true;
  }

  function setupDateField(inputId, errorId) {
    const dateInput = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (!dateInput || !errorEl) return null;

    function showFieldError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'inline';
      dateInput.dataset.isoDate = '';
    }

    function formatDateInput() {
      const raw = dateInput.value.trim();
      if (!raw) {
        errorEl.style.display = 'none';
        dateInput.dataset.isoDate = '';
        return;
      }

      // Chấp nhận mọi ký tự phân cách: / - \ khoảng trắng ...
      const normalized = raw.replace(/[^0-9]+/g, '/');
      const parts = normalized.split('/').filter(Boolean);

      if (parts.length !== 3) {
        showFieldError('Vui lòng nhập đúng định dạng ngày/tháng/năm (vd: 7/6/2002)');
        return;
      }

      let [d, m, y] = parts.map(Number);
      if (y < 100) y += y < 30 ? 2000 : 1900;

      if (!isValidDate(d, m, y)) {
        showFieldError('Ngày không hợp lệ, vui lòng kiểm tra lại');
        return;
      }

      dateInput.value = `${pad2(d)}/${pad2(m)}/${y}`;
      dateInput.dataset.isoDate = `${y}-${pad2(m)}-${pad2(d)}`;
      errorEl.style.display = 'none';
    }

    dateInput.addEventListener('blur', formatDateInput);
    return { input: dateInput, format: formatDateInput };
  }

  const ngaySinhField = setupDateField('ngay_sinh', 'ngay_sinh_error');
  const ngayKhamField = setupDateField('ngay_kham', 'ngay_kham_error');

  function showStatus(kind, message) {
    statusEl.textContent = message;
    statusEl.className = `status-message show ${kind}`;
  }

  function hideStatus() {
    statusEl.className = 'status-message';
  }

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const config = await res.json();

      orgNameEls.forEach((el) => {
        if (el) el.textContent = config.orgName;
      });

      khuVucSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '-- Chọn khu vực --';
      placeholder.disabled = true;
      placeholder.selected = true;
      khuVucSelect.appendChild(placeholder);

      (config.areas || []).forEach((area) => {
        const opt = document.createElement('option');
        opt.value = area;
        opt.textContent = area;
        khuVucSelect.appendChild(opt);
      });
    } catch (err) {
      // Không ghi đè tên đơn vị bằng thông báo lỗi — giữ nguyên tên đã
      // gán sẵn trong HTML, chỉ danh sách khu vực báo lỗi rõ ràng.
      khuVucSelect.innerHTML = '<option value="">Không tải được danh sách khu vực</option>';
    }
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result || '';
        const base64 = String(result).split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadAttachmentIfAny() {
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return null;

    if (file.size > MAX_FILE_BYTES) {
      throw new Error('Dung lượng ảnh vượt quá 4MB. Vui lòng chọn ảnh nhỏ hơn.');
    }

    const fileBase64 = await readFileAsBase64(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileBase64 }),
    });
    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Tải ảnh lên thất bại.');
    }

    return result.url;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Ép format lại lần cuối (phòng khi người dùng chưa rời khỏi ô trước khi bấm gửi)
    if (ngaySinhField) ngaySinhField.format();
    if (ngayKhamField) ngayKhamField.format();

    if (ngaySinhField && !ngaySinhField.input.dataset.isoDate) {
      showStatus('error', 'Ngày tháng năm sinh không hợp lệ. Vui lòng kiểm tra lại.');
      ngaySinhField.input.focus();
      return;
    }
    if (ngayKhamField && !ngayKhamField.input.dataset.isoDate) {
      showStatus('error', 'Ngày khám không hợp lệ. Vui lòng kiểm tra lại.');
      ngayKhamField.input.focus();
      return;
    }

    const formData = new FormData(form);
    formData.delete('anh_dinh_kem');
    const payload = Object.fromEntries(formData.entries());
    if (ngaySinhField) payload.ngay_sinh = ngaySinhField.input.dataset.isoDate;
    if (ngayKhamField) payload.ngay_kham = ngayKhamField.input.dataset.isoDate;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi…';

    try {
      if (fileInput && fileInput.files && fileInput.files[0]) {
        submitBtn.textContent = 'Đang tải ảnh…';
      }
      payload.anh_dinh_kem_url = await uploadAttachmentIfAny();
      submitBtn.textContent = 'Đang gửi…';

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gửi thông tin thất bại.');
      }

      form.reset();
      if (ngaySinhField) ngaySinhField.input.dataset.isoDate = '';
      if (ngayKhamField) ngayKhamField.input.dataset.isoDate = '';
      toggleOtherField();
      showStatus('success', 'Đã gửi thông tin thành công. Cảm ơn bạn!');
    } catch (err) {
      showStatus('error', err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gửi thông tin';
    }
  });

  loadConfig();
  toggleOtherField();
}());
