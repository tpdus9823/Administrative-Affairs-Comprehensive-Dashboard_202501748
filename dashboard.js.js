// 편리한 DOM 선택 함수
const G = id => document.getElementById(id);

// ── 데이터 비동기 로드 및 렌더링 ──
async function loadDashboardData() {
  try {
    const response = await fetch('sample-data.json');
    const data = await response.json();

    renderDepartments(data.departments);
    renderDocuments(data.documents);
    renderNotices(data.notices);
    renderMeetings(data.meetings);
  } catch (error) {
    console.error("데이터를 불러오는 중 오류 발생:", error);
  }
}

// 부서 현황 렌더링
function renderDepartments(deps) {
  const container = G('dept-list');
  if (!container) return;
  container.innerHTML = deps.map(d => `
    <div class="l-item">
      <span class="l-n"><i class="dot" style="background:#3b82f6"></i>${d.name}</span>
      <span class="l-v">${d.active}/${d.total} (${d.progress})</span>
    </div>
  `).join('');
}

// 결재 문서 렌더링
function renderDocuments(docs) {
  const tbody = G('doc-tbody');
  if (!tbody) return;
  tbody.innerHTML = docs.map(d => `
    <tr>
      <td style="font-family:monospace; color:#64748b;">${d.id}</td>
      <td style="font-weight:700;">${d.title}</td>
      <td>${d.dept}</td>
      <td><span class="badge amber">${d.status}</span></td>
      <td style="font-family:monospace; color:#64748b;">${d.date}</td>
      <td><span class="badge btn-act" onclick="viewDoc('${d.id}', '${d.title}')">검토</span></td>
    </tr>
  `).join('');
}

// 공지사항 렌더링
function renderNotices(notices) {
  const container = G('notice-container');
  if (!container) return;
  container.innerHTML = notices.map(n => `
    <div class="nt-card ${n.isUrgent ? 'urgent' : ''}">
      <span class="nt-tag">${n.tag}</span>
      <span class="nt-txt">${n.text}</span>
    </div>
  `).join('');
}

// 일정/회의 렌더링
function renderMeetings(meetings) {
  const container = G('meeting-container');
  if (!container) return;
  container.innerHTML = meetings.map(m => `
    <div class="mt-item">
      <div class="mt-top">
        <span class="mt-t">${m.title}</span>
        <span class="mt-time">${m.time}</span>
      </div>
      <div class="mt-m">${m.room}</div>
      <div class="mt-d">${m.desc}</div>
    </div>
  `).join('');
}

// ── 문서 검토 기능 ──
function viewDoc(id, title) {
  G('doc-prev-t').textContent = `[${id}] ${title}`;
  G('doc-prev-body').textContent = `본 문서는 ${title} 건으로 동아리연합회 행정처리에 관한 규정에 의거하여 상정된 안건입니다. 검토 후 하단의 승인 또는 반려를 선택해 주시기 바랍니다.`;
  G('doc-prev').classList.add('show');
  G('doc-action-btns').style.display = 'flex';
}

function closeDoc() {
  G('doc-prev-t').textContent = '';
  G('doc-prev-body').textContent = '';
  G('doc-prev').classList.remove('show');
  G('doc-action-btns').style.display = 'none';
}

// ── 메모 기능 ──
function saveMemo() {
  const s = G('memo-saved');
  s.classList.add('show');
  setTimeout(() => s.classList.remove('show'), 2000);
}
function clearMemo() {
  G('memo-area').value = '';
}

// ── 도넛 차트 애니메이션 ──
function initDonut() {
  const r = 36, circ = 2 * Math.PI * r;
  const segs = [
    { pct: .4375, color: '#3b82f6', el: 'dc1' },
    { pct: .1667, color: '#22c55e', el: 'dc2' },
    { pct: .0833, color: '#fbbf24', el: 'dc3' }
  ];
  setTimeout(() => {
    let offset = 0;
    segs.forEach(seg => {
      const el = G(seg.el);
      if (!el) return;
      const len = circ * seg.pct, gap = circ - len;
      el.style.strokeDasharray = `${len} ${gap}`;
      el.style.strokeDashoffset = -offset;
      offset += len;
    });
  }, 400);
}

// ── 상단 시계 기능 ──
function tick() {
  const n = new Date();
  const h = String(n.getHours()).padStart(2, '0');
  const mi = String(n.getMinutes()).padStart(2, '0');
  const s = String(n.getSeconds()).padStart(2, '0');
  G('clock').textContent = h + ':' + mi + ':' + s;
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  G('cal-yr-mo').textContent = `${n.getFullYear()}년 ${n.getMonth() + 1}월`;
}

// ── 미니 캘린더 생성 ──
function initCal() {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth(), today = n.getDate();
  const first = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();
  const g = G('cal-grid');
  if (!g) return;
  
  // 요일 헤더 추가
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  let html = days.map(d => `<div class="cal-d">${d}</div>`).join('');
  
  // 공백 셀
  for (let i = 0; i < first; i++) html += '<div></div>';
  
  // 날짜 셀 채우기
  for (let d = 1; d <= last; d++) {
    let cls = 'cal-cell';
    if (d === today) cls += ' today';
    if (d === 15 || d === 28) cls += ' has-evt'; // 예시 이벤트 날짜
    html += `<div class="${cls}">${d}</div>`;
  }
  g.innerHTML = html;
}

// 페이지가 로드되면 전체 초기화 실행
window.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  initDonut();
  initCal();
  setInterval(tick, 1000);
  tick();
});