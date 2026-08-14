(function () {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const exportBtn = document.getElementById('export-btn');
  const searchInput = document.getElementById('search-input');
  const maskToggle = document.getElementById('mask-toggle');
  const areaChipsEl = document.getElementById('area-chips');
  const tableBody = document.getElementById('table-body');
  const emptyState = document.getElementById('empty-state');
  const summaryLine = document.getElementById('summary-line');

  const editOverlay = document.getElementById('edit-overlay');
  const editForm = document.getElementById('edit-form');
  const editIdInput = document.getElementById('edit-id');
  const editKhuVucSelect = document.getElementById('edit_khu_vuc');
  const editError = document.getElementById('edit-error');
  const editCloseBtn = document.getElementById('edit-close-btn');
  const editCancelBtn = document.getElementById('edit-cancel-btn');
  const editSaveBtn = document.getElementById('edit-save-btn');

  const EDIT_FIELDS = [
    'ho_ten', 'gioi_tinh', 'ngay_sinh', 'dan_toc', 'nhom_mau', 'so_cccd', 'so_bhyt',
    'khu_vuc', 'noi_o_hien_tai', 'xa_phuong_noi_o', 'nghe_nghiep', 'noi_lam_viec_hoc_tap',
    'xa_phuong_noi_lam_viec', 'ten_me_nguoi_giam_ho', 'dien_thoai', 'doi_tuong',
    'hinh_thuc_kham', 'hinh_thuc_kham_khac', 'ngay_kham', 'noi_kham', 'ket_qua_kham',
  ];

  let allRows = [];
  let activeArea = 'Tất cả';
  let areasLoaded = false;

  function maskCccd(value) {
    if (!value) return '';
    const str = String(value);
    if (str.length <= 4) return str;
    return '•'.repeat(str.length - 4) + str.slice(-4);
  }

  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  }

  function showView(view) {
    loginView.hidden = view !== 'login';
    dashboardView.hidden = view !== 'dashboard';
  }

  // Luôn yêu cầu đăng nhập lại mỗi khi mở trang — không tự động vào thẳng
  // dashboard dù trình duyệt còn lưu phiên cũ, để tránh người khác truy cập
  // được dữ liệu khi máy không có ai trông coi.
  function init() {
    showView('login');
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.hidden = true;

    const password = document.getElementById('password').value;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const result = await res.json();

    if (!res.ok) {
      loginError.textContent = result.error || 'Đăng nhập thất bại.';
      loginError.hidden = false;
      return;
    }

    loginForm.reset();
    showView('dashboard');
    loadSubmissions();
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    allRows = [];
    showView('login');
  });

  async function loadSubmissions() {
    summaryLine.textContent = 'Đang tải dữ liệu…';
    const res = await fetch('/api/admin/submissions');
    const result = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        showView('login');
        return;
      }
      summaryLine.textContent = result.error || 'Không thể tải dữ liệu.';
      return;
    }

    allRows = result.data || [];
    renderAreaChips();
    renderTable();
  }

  function renderAreaChips() {
    const counts = new Map();
    allRows.forEach((row) => {
      counts.set(row.khu_vuc, (counts.get(row.khu_vuc) || 0) + 1);
    });

    const areas = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, 'vi'));

    areaChipsEl.innerHTML = '';

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'chip' + (activeArea === 'Tất cả' ? ' active' : '');
    allChip.textContent = `Tất cả (${allRows.length})`;
    allChip.addEventListener('click', () => {
      activeArea = 'Tất cả';
      renderAreaChips();
      renderTable();
    });
    areaChipsEl.appendChild(allChip);

    areas.forEach((area) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (activeArea === area ? ' active' : '');
      chip.textContent = `${area} (${counts.get(area)})`;
      chip.addEventListener('click', () => {
        activeArea = area;
        renderAreaChips();
        renderTable();
      });
      areaChipsEl.appendChild(chip);
    });
  }

  function getFilteredRows() {
    const query = searchInput.value.trim().toLowerCase();

    return allRows.filter((row) => {
      if (activeArea !== 'Tất cả' && row.khu_vuc !== activeArea) return false;
      if (!query) return true;

      const haystack = [row.ho_ten, row.dien_thoai, row.so_cccd]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  function renderTable() {
    const rows = getFilteredRows();
    const shouldMask = maskToggle.checked;

    summaryLine.textContent = `Hiển thị ${rows.length} / ${allRows.length} bản ghi`;
    tableBody.innerHTML = '';
    emptyState.hidden = rows.length !== 0;

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const cells = [
        formatDate(row.created_at),
        row.ho_ten,
        row.gioi_tinh,
        formatDate(row.ngay_sinh),
        row.khu_vuc,
        row.doi_tuong,
        shouldMask ? maskCccd(row.so_cccd) : row.so_cccd,
        row.dien_thoai,
        row.hinh_thuc_kham === 'Khác' ? row.hinh_thuc_kham_khac || 'Khác' : row.hinh_thuc_kham,
        formatDate(row.ngay_kham),
        row.noi_kham,
      ];

      cells.forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value || '—';
        tr.appendChild(td);
      });

      const attachmentTd = document.createElement('td');
      if (row.anh_dinh_kem_url) {
        const link = document.createElement('a');
        link.href = row.anh_dinh_kem_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Xem ảnh';
        link.className = 'link-btn';
        attachmentTd.appendChild(link);
      } else {
        attachmentTd.textContent = '—';
      }
      tr.appendChild(attachmentTd);

      const actionsTd = document.createElement('td');
      actionsTd.className = 'row-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'link-btn';
      editBtn.textContent = 'Sửa';
      editBtn.addEventListener('click', () => openEditModal(row));
      actionsTd.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'link-btn danger';
      deleteBtn.textContent = 'Xóa';
      deleteBtn.addEventListener('click', () => deleteSubmission(row));
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(actionsTd);
      tableBody.appendChild(tr);
    });
  }

  async function ensureAreasLoaded() {
    if (areasLoaded) return;
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      editKhuVucSelect.innerHTML = '';
      (data.areas || []).forEach((area) => {
        const opt = document.createElement('option');
        opt.value = area;
        opt.textContent = area;
        editKhuVucSelect.appendChild(opt);
      });
      areasLoaded = true;
    } catch (err) {
      console.error('Không tải được danh sách khu vực', err);
    }
  }

  function toDateInputValue(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
  }

  async function openEditModal(row) {
    await ensureAreasLoaded();

    editError.hidden = true;
    editIdInput.value = row.id;

    document.getElementById('edit_ho_ten').value = row.ho_ten || '';
    document.getElementById('edit_gioi_tinh').value = row.gioi_tinh || 'Nam';
    document.getElementById('edit_ngay_sinh').value = toDateInputValue(row.ngay_sinh);
    document.getElementById('edit_dan_toc').value = row.dan_toc || '';
    document.getElementById('edit_nhom_mau').value = row.nhom_mau || '';
    document.getElementById('edit_so_cccd').value = row.so_cccd || '';
    document.getElementById('edit_so_bhyt').value = row.so_bhyt || '';
    editKhuVucSelect.value = row.khu_vuc || '';
    document.getElementById('edit_noi_o_hien_tai').value = row.noi_o_hien_tai || '';
    document.getElementById('edit_xa_phuong_noi_o').value = row.xa_phuong_noi_o || '';
    document.getElementById('edit_nghe_nghiep').value = row.nghe_nghiep || '';
    document.getElementById('edit_noi_lam_viec_hoc_tap').value = row.noi_lam_viec_hoc_tap || '';
    document.getElementById('edit_xa_phuong_noi_lam_viec').value = row.xa_phuong_noi_lam_viec || '';
    document.getElementById('edit_ten_me_nguoi_giam_ho').value = row.ten_me_nguoi_giam_ho || '';
    document.getElementById('edit_dien_thoai').value = row.dien_thoai || '';
    document.getElementById('edit_doi_tuong').value = row.doi_tuong || '';
    document.getElementById('edit_hinh_thuc_kham').value = row.hinh_thuc_kham || 'Khám sức khỏe tổng quát';
    document.getElementById('edit_hinh_thuc_kham_khac').value = row.hinh_thuc_kham_khac || '';
    document.getElementById('edit_ngay_kham').value = toDateInputValue(row.ngay_kham);
    document.getElementById('edit_noi_kham').value = row.noi_kham || '';
    document.getElementById('edit_ket_qua_kham').value = row.ket_qua_kham || '';

    editOverlay.hidden = false;
  }

  function closeEditModal() {
    editOverlay.hidden = true;
  }

  editCloseBtn.addEventListener('click', closeEditModal);
  editCancelBtn.addEventListener('click', closeEditModal);
  editOverlay.addEventListener('click', (event) => {
    if (event.target === editOverlay) closeEditModal();
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    editError.hidden = true;
    editSaveBtn.disabled = true;
    editSaveBtn.textContent = 'Đang lưu…';

    const id = editIdInput.value;
    const payload = {};
    EDIT_FIELDS.forEach((field) => {
      const el = document.getElementById(`edit_${field}`);
      payload[field] = el ? el.value : '';
    });

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        editError.textContent = result.error || 'Không thể lưu thay đổi.';
        editError.hidden = false;
        return;
      }

      closeEditModal();
      loadSubmissions();
    } catch (err) {
      editError.textContent = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
      editError.hidden = false;
    } finally {
      editSaveBtn.disabled = false;
      editSaveBtn.textContent = 'Lưu thay đổi';
    }
  });

  async function deleteSubmission(row) {
    const label = row.ho_ten || 'bản ghi này';
    const confirmed = window.confirm(`Xóa vĩnh viễn thông tin của "${label}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/submissions/${row.id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Không thể xóa bản ghi.');
        return;
      }

      loadSubmissions();
    } catch (err) {
      alert('Không thể kết nối máy chủ. Vui lòng thử lại.');
    }
  }

  function csvEscape(value) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function exportCsv() {
    const rows = getFilteredRows();
    const headers = [
      'Ngày gửi', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Dân tộc', 'Nhóm máu',
      'Số CCCD', 'Số BHYT', 'Khu vực', 'Nơi ở hiện tại', 'Xã/phường nơi ở',
      'Nghề nghiệp', 'Nơi làm việc/học tập', 'Điện thoại', 'Đối tượng',
      'Hình thức khám', 'Ngày khám', 'Nơi khám', 'Kết quả khám', 'Link ảnh đính kèm',
    ];

    const lines = [headers.map(csvEscape).join(',')];

    rows.forEach((row) => {
      lines.push(
        [
          row.created_at, row.ho_ten, row.gioi_tinh, row.ngay_sinh, row.dan_toc, row.nhom_mau,
          row.so_cccd, row.so_bhyt, row.khu_vuc, row.noi_o_hien_tai, row.xa_phuong_noi_o,
          row.nghe_nghiep, row.noi_lam_viec_hoc_tap, row.dien_thoai, row.doi_tuong,
          row.hinh_thuc_kham === 'Khác' ? row.hinh_thuc_kham_khac : row.hinh_thuc_kham,
          row.ngay_kham, row.noi_kham, row.ket_qua_kham, row.anh_dinh_kem_url,
        ]
          .map(csvEscape)
          .join(',')
      );
    });

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const areaLabel = activeArea === 'Tất cả' ? 'tat-ca' : activeArea.replace(/\s+/g, '-').toLowerCase();
    a.href = url;
    a.download = `ksk-${areaLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  searchInput.addEventListener('input', renderTable);
  maskToggle.addEventListener('change', renderTable);
  exportBtn.addEventListener('click', exportCsv);

  // Tự động hủy phiên đăng nhập ngay khi rời trang (đóng tab, chuyển trang,
  // tắt trình duyệt) để không ai mở lại trang và vào thẳng dashboard được.
  window.addEventListener('pagehide', () => {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/admin/logout');
    }
  });

  init();
}());
