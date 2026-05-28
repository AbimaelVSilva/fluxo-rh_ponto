// manager-dashboard.jsx — Fluxo-RH web panel (HR view): Espelho de Ponto Mensal
import React from 'react';

// ── Mock data ───────────────────────────────────────────────
const MONTH_NAME = 'Junho';
const YEAR = 2024;
const DAYS_IN_MONTH = 30;
// June 2024 — day-of-week mapping (1=Sat, 2=Sun, ..., 30=Sun)
// 01 Jun 2024 = Saturday (sáb)
const WEEKDAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const dowFor = (day) => {
  // 1 = Sat = index 6
  const startDow = 6; // Saturday
  return (startDow + day - 1) % 7;
};

const HOLIDAYS = { 20: 'Corpus Christi' };

const DEPTS = ['Operação', 'Logística', 'Administrativo', 'Comercial', 'RH'];

// Status codes for cells
// regular | falta | folga | feriado | inconsistente | atestado | ferias | ajuste
function makeEmployeeRow(name, matricula, role, dept, bank) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return { name, matricula, role, dept, bank, initials };
}

const EMPLOYEES = [
  makeEmployeeRow('Ana Beatriz Lima', '1012', 'Analista de RH', 'RH', '+04h12'),
  makeEmployeeRow('Bruno Henrique Sá', '1018', 'Supervisor Logística', 'Logística', '-02h45'),
  makeEmployeeRow('Camila Rodrigues', '1024', 'Auxiliar Administrativo', 'Administrativo', '+01h05'),
  makeEmployeeRow('Diego Albuquerque', '1031', 'Auxiliar Noturno', 'Operação', '+12h30'),
  makeEmployeeRow('Eduarda Falcão', '1040', 'Coordenadora Comercial', 'Comercial', '+00h40'),
  makeEmployeeRow('Fernando Mendes', '1047', 'Auxiliar de Operações', 'Operação', '-04h20'),
  makeEmployeeRow('Gabriela Pinto', '1053', 'Analista Financeiro', 'Administrativo', '+02h00'),
  makeEmployeeRow('Hugo Cavalcante', '1061', 'Operador de Empilhadeira', 'Operação', '+06h45'),
  makeEmployeeRow('Isabela Tavares', '1064', 'Assistente Comercial', 'Comercial', '-01h10'),
  makeEmployeeRow('João Silva', '1023', 'Auxiliar de Operações', 'Operação', '+02h30'),
  makeEmployeeRow('Karina Vasconcelos', '1071', 'Estoquista', 'Logística', '+00h15'),
  makeEmployeeRow('Lucas Pereira', '1075', 'Conferente', 'Logística', '+03h25'),
  makeEmployeeRow('Mariana Costa', '1080', 'Recepcionista', 'Administrativo', '-00h30'),
];

// Deterministic "pseudo-random" but fixed mock cell generator
function buildMockCells() {
  const cells = {}; // key: emp_index_day -> { status, in, out, lunch, msg }
  EMPLOYEES.forEach((emp, ei) => {
    for (let d = 1; d <= DAYS_IN_MONTH; d++) {
      const dow = dowFor(d);
      let cell;

      // Holiday
      if (HOLIDAYS[d]) {
        // Some work on holiday
        if (ei % 4 === 0 && d === 20) {
          cell = { status: 'feriado-trab', label: 'Feriado', sub: 'Trabalhado', tone: 'purple', inTime: '08:02', outTime: '16:30' };
        } else {
          cell = { status: 'feriado', label: 'Feriado', tone: 'purple' };
        }
      }
      // Default Sunday off
      else if (dow === 0) {
        if (ei === 3 && (d === 2 || d === 23)) { // Diego works some Sundays
          cell = { status: 'folga-trab', label: 'Folga', sub: 'Trabalhada', tone: 'orange', inTime: '22:00', outTime: '06:00' };
        } else {
          cell = { status: 'folga', label: 'Folga', tone: 'primary' };
        }
      }
      else {
        // Sprinkle exceptions
        const seed = (ei * 17 + d * 31) % 100;
        if (ei === 9 && d === 4) cell = { status: 'inconsistente', label: 'Inconsist.', tone: 'warning', inTime: '08:00', missing: 'Retorno almoço' };
        else if (ei === 5 && d === 7) cell = { status: 'falta', label: 'Falta', tone: 'error' };
        else if (ei === 1 && d === 11) cell = { status: 'atestado', label: 'Atestado', tone: 'cyan', sub: 'Aprovado' };
        else if (ei === 8 && d === 13) cell = { status: 'inconsistente', label: 'Inconsist.', tone: 'warning', inTime: '08:15' };
        else if (ei === 4 && d === 17) cell = { status: 'atestado', label: 'Atestado', tone: 'cyan', sub: 'Pendente' };
        else if (ei === 12 && d === 18) cell = { status: 'falta', label: 'Falta', tone: 'error' };
        else if (ei === 6 && d === 25) cell = { status: 'ajuste', label: 'Ajuste', tone: 'orange-soft', inTime: '08:30', outTime: '18:05' };
        else if (ei === 11 && (d === 6 || d === 12 || d === 26)) cell = { status: 'extra', label: 'Extra', tone: 'success', inTime: '07:55', outTime: '19:32', extra: '+01h35' };
        else if (ei === 7 && (d === 14)) cell = { status: 'extra', label: 'Extra', tone: 'success', inTime: '07:58', outTime: '20:10', extra: '+02h10' };
        else if (dow === 6) {
          // Saturday — some have half shift, some off
          if (ei % 3 === 0) {
            cell = { status: 'folga', label: 'Folga', tone: 'primary' };
          } else {
            cell = { status: 'regular', tone: 'success', inTime: '08:0' + (seed % 5), outTime: '12:0' + (seed % 6) };
          }
        }
        else {
          // Regular weekday — small variances
          const iH = 7 + Math.floor(seed / 50);
          const iM = (seed % 6);
          const oH = 18;
          const oM = (seed % 9);
          cell = { status: 'regular', tone: 'success', inTime: `0${iH === 7 ? 7 : 8}:${String(iM).padStart(2, '0')}`, outTime: `${oH}:${String(oM).padStart(2, '0')}` };
        }
      }

      cells[`${ei}_${d}`] = cell;
    }
  });
  return cells;
}

const CELLS = buildMockCells();

// ── Sidebar ─────────────────────────────────────────────────
function SidebarItem({ icon, label, active, badge, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: sub ? '10px 16px 10px 48px' : '10px 16px',
      color: active ? '#fff' : 'rgba(255,255,255,0.7)',
      background: active ? 'linear-gradient(90deg, rgba(72,191,171,0.18) 0%, rgba(95,192,224,0.10) 100%)' : 'transparent',
      borderLeft: active && !sub ? '3px solid #48bfab' : '3px solid transparent',
      paddingLeft: active && !sub ? 13 : (sub ? 48 : 16),
      cursor: 'pointer', fontSize: 14, transition: '0.15s',
    }}>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          background: '#ff4d4f', color: '#fff', fontSize: 11, padding: '0 6px',
          borderRadius: 10, minWidth: 18, height: 18, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>{badge}</span>
      )}
    </div>
  );
}

function Sidebar({ collapsed }) {
  const w = collapsed ? 80 : 256;
  return (
    <aside style={{
      width: w, background: 'linear-gradient(180deg, #0c3b5c 0%, #07253e 100%)',
      minHeight: '100vh',
      color: 'rgba(255,255,255,0.7)', flexShrink: 0,
      boxShadow: '2px 0 6px rgba(7, 37, 62, 0.45)', position: 'sticky', top: 0, height: '100vh',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s',
      overflow: 'hidden',
    }}>
      {/* Watermark mark inside sidebar */}
      <img src="assets/fluxorh-mark-dark.png" alt="" style={{
        position: 'absolute', right: -60, bottom: 60, width: 220, opacity: 0.06, pointerEvents: 'none',
      }}/>

      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '0' : '0 20px', justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1,
      }}>
        {collapsed ? (
          <img src="assets/fluxorh-mark.png" alt="FluxoRH" style={{ width: 32, height: 'auto', filter: 'brightness(0) invert(1)' }}/>
        ) : (
          <React.Fragment>
            <img src="assets/fluxorh-mark.png" alt="" style={{ width: 32, height: 'auto', filter: 'brightness(0) invert(1)', flexShrink: 0 }}/>
            <div>
              <div style={{
                color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: 1,
                fontFamily: 'Avenir, Helvetica Neue, Arial, sans-serif',
              }}>FLUXO<span style={{ color: '#5fc0e0' }}>RH</span></div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.4, textTransform: 'uppercase' }}>Gestão de Pessoas</div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, paddingTop: 12, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <SidebarItem icon={<MenuIcon name="dashboard"/>} label={!collapsed && 'Dashboard'}/>
        <SidebarItem icon={<MenuIcon name="user"/>} label={!collapsed && 'Funcionários'}/>
        <div style={{ background: 'rgba(7,37,62,0.6)' }}>
          <SidebarItem icon={<MenuIcon name="clock"/>} label={!collapsed && 'Ponto'} active/>
          {!collapsed && (
            <React.Fragment>
              <SidebarItem sub label="Espelho mensal" active/>
              <SidebarItem sub label="Escalas"/>
              <SidebarItem sub label="Solicitações" badge="14"/>
              <SidebarItem sub label="Feriados"/>
              <SidebarItem sub label="Banco de horas"/>
            </React.Fragment>
          )}
        </div>
        <SidebarItem icon={<MenuIcon name="folder"/>} label={!collapsed && 'Folha'}/>
        <SidebarItem icon={<MenuIcon name="doc"/>} label={!collapsed && 'Documentos'}/>
        <SidebarItem icon={<MenuIcon name="chart"/>} label={!collapsed && 'Relatórios'}/>
        <SidebarItem icon={<MenuIcon name="gear"/>} label={!collapsed && 'Configurações'}/>
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.45)', position: 'relative', zIndex: 1 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#48bfab' }}/>
            FluxoRH · v1.0.0
          </div>
        )}
      </div>
    </aside>
  );
}

function MenuIcon({ name }) {
  const s = { width: 16, height: 16, color: 'currentColor' };
  const stroke = 'currentColor';
  if (name === 'dashboard') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
  if (name === 'user') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (name === 'clock') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (name === 'folder') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
  if (name === 'doc') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  if (name === 'chart') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
  if (name === 'gear') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  return null;
}

// ── Top Header ──────────────────────────────────────────────
function TopHeader({ onToggleSidebar, onExitToLanding }) {
  return (
    <header style={{
      height: 64, padding: '12px 24px', background: '#fff',
      boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <button onClick={onToggleSidebar} style={{
        border: 'none', background: 'transparent', width: 40, height: 40, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        color: 'rgba(0,0,0,0.65)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Ponto</span>
        <span>/</span>
        <span style={{ color: 'rgba(0,0,0,0.85)' }}>Espelho mensal</span>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Search */}
      <div style={{ position: 'relative', width: 280 }}>
        <input
          id="employee-search"
          name="employee-search"
          className="ant-input with-prefix"
          placeholder="Buscar funcionário, CPF ou matrícula"
        />
        <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>

      {/* Sync */}
      <button className="btn" style={{ width: 40, padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.7 1 6.4 2.6"/><polyline points="21 3 21 9 15 9"/></svg>
      </button>

      {/* Bell */}
      <button className="btn" style={{ width: 40, padding: 0, position: 'relative' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', border: '2px solid #fff' }}/>
      </button>

      {/* Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #f0f0f0' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2f9d86 0%, #5fc0e0 100%)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 13,
        }}>RB</div>
        <div style={{ fontSize: 14 }}>
          <div style={{ color: 'rgba(0,0,0,0.85)', lineHeight: 1.2 }}>Renata Borges</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Coordenadora RH</div>
        </div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <button onClick={onExitToLanding} className="btn ghost" title="Voltar ao seletor">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </button>
    </header>
  );
}

// ── Summary Cards ───────────────────────────────────────────
function SummaryCards() {
  const cards = [
    { label: 'Funcionários', value: '143', sub: '12 filiais', tone: 'primary' },
    { label: 'Dias regulares', value: '3.412', sub: '92% do total', tone: 'success' },
    { label: 'Inconsistências', value: '47', sub: 'Requer revisão', tone: 'warning' },
    { label: 'Faltas', value: '18', sub: '6 não justificadas', tone: 'error' },
    { label: 'Atestados', value: '9', sub: '3 pendentes', tone: 'cyan' },
    { label: 'Folgas trabalhadas', value: '12', sub: 'A pagar', tone: 'orange' },
    { label: 'Feriado trabalhado', value: '8', sub: '20 Jun · Corpus' },
    { label: 'Horas extras', value: '+218h', sub: 'No mês', tone: 'success' },
    { label: 'Débitos', value: '-94h', sub: 'No mês', tone: 'error' },
  ];

  const toneColor = {
    primary: '#1890ff', success: '#52c41a', warning: '#faad14',
    error: '#ff4d4f', cyan: '#13c2c2', orange: '#fa8c16',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12, marginBottom: 16 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: '#fff', border: '1px solid #f0f0f0', borderRadius: 5,
          padding: '12px 14px', position: 'relative',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 500 }}>
            {c.label}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 600, marginTop: 4,
            color: c.tone ? toneColor[c.tone] : 'rgba(0,0,0,0.85)',
            fontVariantNumeric: 'tabular-nums',
          }}>{c.value}</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Filter Row ──────────────────────────────────────────────
function FilterRow({ exportOpen, setExportOpen }) {
  const Field = ({ label, value, w = 140 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{label}</span>
      <div className="ant-select" style={{ minWidth: w }}>
        <span>{value}</span>
        <span className="arrow">▾</span>
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 5,
      padding: 16, marginBottom: 16,
      display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
    }}>
      <Field label="Empresa" value="Fluxo Logística" w={170}/>
      <Field label="Filial" value="Todas (12)" w={130}/>
      <Field label="Departamento" value="Operação" w={140}/>
      <Field label="Cargo" value="Todos" w={120}/>
      <Field label="Gestor" value="Carlos Tavares" w={150}/>
      <Field label="Mês" value="Junho"/>
      <Field label="Ano" value="2024" w={100}/>
      <Field label="Status" value="Todos"/>

      <div style={{ flex: 1 }}/>

      <button className="btn">Limpar filtros</button>
      <button className="btn primary">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
        Aplicar filtros
      </button>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setExportOpen(!exportOpen)} className="btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
          <span style={{ marginLeft: 2 }}>▾</span>
        </button>
        {exportOpen && (
          <div className="fade-in" style={{
            position: 'absolute', top: 38, right: 0, background: '#fff',
            border: '1px solid #f0f0f0', borderRadius: 4, minWidth: 240,
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)', zIndex: 50, padding: '4px 0',
          }}>
            {['PDF do espelho mensal', 'Excel da visão mensal', 'Relatório de inconsistências', 'Relatório de banco de horas', 'Relatório de faltas', 'Folgas trabalhadas', 'Arquivo legal de ponto (AFD)'].map((x, i) => (
              <div key={i} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setExportOpen(false)}>{x}</div>
            ))}
          </div>
        )}
      </div>
      <button className="btn" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Fechar mês
      </button>
    </div>
  );
}

// ── Legend ──────────────────────────────────────────────────
function LegendBar() {
  const items = [
    { color: '#52c41a', label: 'Regular' },
    { color: '#faad14', label: 'Inconsistente' },
    { color: '#ff4d4f', label: 'Falta' },
    { color: '#1890ff', label: 'Folga' },
    { color: '#722ed1', label: 'Feriado' },
    { color: '#13c2c2', label: 'Atestado' },
    { color: '#fa8c16', label: 'Ajuste pendente' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px',
      background: '#fafafa', borderBottom: '1px solid #f0f0f0',
      fontSize: 12, color: 'rgba(0,0,0,0.55)', flexWrap: 'wrap',
    }}>
      <strong style={{ color: 'rgba(0,0,0,0.65)' }}>Legenda:</strong>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: 'inline-block' }}/>
          {it.label}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', color: 'rgba(0,0,0,0.45)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', animation: 'pulse 1.6s infinite' }}/>
        Sincronizado há 2 min
      </div>
    </div>
  );
}

// ── Cell render ─────────────────────────────────────────────
const CELL_TONES = {
  success: { bg: '#f6ffed', fg: '#389e0d', bd: '#b7eb8f' },
  warning: { bg: '#fffbe6', fg: '#d48806', bd: '#ffe58f' },
  error:   { bg: '#fff1f0', fg: '#cf1322', bd: '#ffa39e' },
  primary: { bg: '#e6f7ff', fg: '#0050b3', bd: '#91d5ff' },
  purple:  { bg: '#f9f0ff', fg: '#531dab', bd: '#d3adf7' },
  cyan:    { bg: '#e6fffb', fg: '#08979c', bd: '#87e8de' },
  orange:  { bg: '#fff7e6', fg: '#ad4e00', bd: '#ffd591' },
  'orange-soft': { bg: '#fff7e6', fg: '#d46b08', bd: '#ffd591' },
};

function GridCell({ cell, onClick, selected, dow }) {
  const t = CELL_TONES[cell.tone] || CELL_TONES.success;
  const isWeekendBg = dow === 0 || dow === 6;

  return (
    <td
      onClick={onClick}
      style={{
        width: 64, minWidth: 64, maxWidth: 64,
        height: 56, padding: 2, cursor: 'pointer',
        background: selected ? '#bae7ff' : isWeekendBg ? '#fafafa' : '#fff',
        borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0',
        position: 'relative', verticalAlign: 'middle',
      }}>
      <div style={{
        height: '100%', borderRadius: 3, background: t.bg, border: '1px solid ' + t.bd,
        padding: '4px 4px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', fontSize: 11, color: t.fg,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {cell.status === 'regular' && (
          <React.Fragment>
            <div style={{ fontWeight: 600, textAlign: 'center' }}>{cell.inTime}</div>
            <div style={{ textAlign: 'center', opacity: 0.8 }}>{cell.outTime}</div>
          </React.Fragment>
        )}
        {cell.status === 'extra' && (
          <React.Fragment>
            <div style={{ fontWeight: 600, textAlign: 'center' }}>{cell.inTime}</div>
            <div style={{ textAlign: 'center', opacity: 0.85 }}>{cell.outTime}</div>
            <div style={{ position: 'absolute', top: 1, right: 2, fontSize: 8, background: '#52c41a', color: '#fff', padding: '0 2px', borderRadius: 2, lineHeight: '11px' }}>+</div>
          </React.Fragment>
        )}
        {(cell.status === 'folga' || cell.status === 'feriado') && (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>{cell.label}</div>
        )}
        {cell.status === 'folga-trab' && (
          <React.Fragment>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 10 }}>Folga ⚠</div>
            <div style={{ textAlign: 'center', fontSize: 10 }}>trab.</div>
          </React.Fragment>
        )}
        {cell.status === 'feriado-trab' && (
          <React.Fragment>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 10 }}>Feriado ⚠</div>
            <div style={{ textAlign: 'center', fontSize: 10 }}>trab.</div>
          </React.Fragment>
        )}
        {cell.status === 'falta' && (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            ✕ Falta
          </div>
        )}
        {cell.status === 'inconsistente' && (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            ⚠ {cell.inTime}
          </div>
        )}
        {cell.status === 'atestado' && (
          <React.Fragment>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 10 }}>📄 Atest.</div>
            <div style={{ textAlign: 'center', fontSize: 9 }}>{cell.sub}</div>
          </React.Fragment>
        )}
        {cell.status === 'ajuste' && (
          <React.Fragment>
            <div style={{ fontWeight: 600, textAlign: 'center', fontSize: 10 }}>⏳ {cell.inTime}</div>
            <div style={{ textAlign: 'center', opacity: 0.8, fontSize: 10 }}>{cell.outTime}</div>
          </React.Fragment>
        )}
      </div>
    </td>
  );
}

// ── Side Drawer (Day Detail) ────────────────────────────────
function DayDetailDrawer({ open, data, onClose }) {
  if (!open || !data) return null;
  const { emp, day, cell } = data;

  const statusLabels = {
    regular: 'Regular',
    extra: 'Hora extra',
    folga: 'Folga programada',
    'folga-trab': 'Folga trabalhada',
    feriado: 'Feriado',
    'feriado-trab': 'Feriado trabalhado',
    falta: 'Falta não justificada',
    inconsistente: 'Ponto inconsistente',
    atestado: 'Atestado médico',
    ajuste: 'Ajuste solicitado',
  };

  const batidas = (() => {
    if (cell.status === 'regular' || cell.status === 'extra') {
      return [
        { tipo: 'Entrada', time: cell.inTime, method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
        { tipo: 'Saída almoço', time: '12:0' + ((day * 3) % 6), method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
        { tipo: 'Retorno', time: '13:0' + ((day * 7) % 5), method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
        { tipo: 'Saída', time: cell.outTime, method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
      ];
    }
    if (cell.status === 'inconsistente') {
      return [
        { tipo: 'Entrada', time: cell.inTime, method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
        { tipo: 'Saída almoço', time: '12:01', method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
        { tipo: 'Retorno almoço', time: '—', pending: true },
        { tipo: 'Saída', time: '18:02', method: 'App Mobile', loc: 'Sede Eusébio', valid: true },
      ];
    }
    if (cell.status === 'folga-trab' || cell.status === 'feriado-trab') {
      return [
        { tipo: 'Entrada', time: cell.inTime, method: 'Coletor (Web)', loc: 'Filial Maracanaú', valid: true },
        { tipo: 'Saída', time: cell.outTime, method: 'Coletor (Web)', loc: 'Filial Maracanaú', valid: true },
      ];
    }
    return [];
  })();

  const tone = CELL_TONES[cell.tone] || CELL_TONES.success;

  return (
    <React.Fragment>
      <div className="drawer-mask" onClick={onClose}/>
      <aside className="drawer">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#1890ff', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14,
            }}>{emp.initials}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{emp.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)' }}>Matrícula {emp.matricula} · {emp.dept}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 6 }}>×</button>
        </div>

        <div className="drawer-body">
          {/* Day header */}
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase' }}>
                  {WEEKDAYS_PT[dowFor(day)]}, {String(day).padStart(2, '0')} de {MONTH_NAME.toLowerCase()} de {YEAR}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,0,0,0.85)', marginTop: 2 }}>
                  {statusLabels[cell.status]}
                </div>
              </div>
              <div className="tag" style={{ height: 28, fontSize: 13, padding: '0 10px', background: tone.bg, color: tone.fg, borderColor: tone.bd }}>
                {cell.status === 'regular' && '● Regular'}
                {cell.status === 'extra' && '⏱ Extra ' + (cell.extra || '')}
                {cell.status === 'folga' && 'Folga'}
                {cell.status === 'folga-trab' && '⚠ Folga trab.'}
                {cell.status === 'feriado' && 'Feriado'}
                {cell.status === 'feriado-trab' && '⚠ Feriado trab.'}
                {cell.status === 'falta' && '✕ Falta'}
                {cell.status === 'inconsistente' && '⚠ Pendente'}
                {cell.status === 'atestado' && '📄 ' + (cell.sub || '')}
                {cell.status === 'ajuste' && '⏳ Ajuste'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Jornada esperada</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>08:00–18:00</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Trabalhado</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cell.status === 'regular' || cell.status === 'extra' ? '08h12' : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Extras</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#52c41a' }}>{cell.extra || '+00min'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Débitos</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#cf1322' }}>00min</div>
              </div>
            </div>
          </div>

          {/* Batidas */}
          {batidas.length > 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1890ff', marginBottom: 12 }}>Batidas registradas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {batidas.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: b.pending ? '#fffbe6' : '#f6ffed',
                      color: b.pending ? '#d48806' : '#52c41a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {b.pending ? '!' : '✓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.tipo}</div>
                      {!b.pending && (
                        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
                          {b.method} · {b.loc} · {b.valid ? '✓ Validado' : 'Não validado'}
                        </div>
                      )}
                      {b.pending && (
                        <div style={{ fontSize: 11, color: '#d48806' }}>
                          Batida não encontrada — revisar
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: b.pending ? '#d48806' : '#1890ff', fontVariantNumeric: 'tabular-nums' }}>
                      {b.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inconsistência callout */}
          {cell.status === 'inconsistente' && (
            <div style={{
              background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4,
              padding: 12, fontSize: 13, color: '#874d00', marginBottom: 12,
            }}>
              <strong>Existe uma batida pendente neste dia.</strong>
              <div style={{ marginTop: 4 }}>Ação sugerida: revisar ponto ou registrar batida manual.</div>
            </div>
          )}

          {/* Atestado callout */}
          {cell.status === 'atestado' && (
            <div className="card" style={{ padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Atestado vinculado</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
                Atestado médico — 1 dia · CID Z76.0
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn sm">Ver documento</button>
                {cell.sub === 'Pendente' && (
                  <React.Fragment>
                    <button className="btn primary sm">Aprovar</button>
                    <button className="btn danger sm">Reprovar</button>
                  </React.Fragment>
                )}
              </div>
            </div>
          )}

          {/* Folga/Feriado trabalhado */}
          {(cell.status === 'folga-trab' || cell.status === 'feriado-trab') && (
            <div style={{
              background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4,
              padding: 12, fontSize: 13, color: '#ad4e00', marginBottom: 12,
            }}>
              <strong>{cell.status === 'folga-trab' ? 'Folga trabalhada' : 'Feriado trabalhado'}</strong>
              <div style={{ marginTop: 4 }}>
                Adicional de {cell.status === 'feriado-trab' ? '100%' : '50%'} aplicável à jornada.
              </div>
            </div>
          )}

          {/* Audit log */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Histórico de alterações</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'rgba(0,0,0,0.4)', minWidth: 80 }}>Há 2 min</span>
                <span>Renata B. abriu o detalhe deste dia</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'rgba(0,0,0,0.4)', minWidth: 80 }}>Há 1 dia</span>
                <span>Sistema sincronizou {batidas.length || 0} batidas</span>
              </div>
              {cell.status === 'inconsistente' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: 'rgba(0,0,0,0.4)', minWidth: 80 }}>Há 1 dia</span>
                  <span>Funcionário foi notificado da pendência</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn">Inserir batida manual</button>
          {cell.status === 'inconsistente' && <button className="btn">Corrigir batida</button>}
          <button className="btn ghost">Marcar como revisado</button>
          <button className="btn primary">Aprovar dia</button>
        </div>
      </aside>
    </React.Fragment>
  );
}

// ── The Big Grid ────────────────────────────────────────────
function MonthlyGrid({ onCellClick, selected }) {
  // Build day columns
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);

  // Compute summary tags per employee row
  const empSummary = (ei) => {
    let inc = 0, falt = 0, ftrab = 0;
    for (let d = 1; d <= DAYS_IN_MONTH; d++) {
      const c = CELLS[`${ei}_${d}`];
      if (c.status === 'inconsistente') inc++;
      if (c.status === 'falta') falt++;
      if (c.status === 'folga-trab' || c.status === 'feriado-trab') ftrab++;
    }
    return { inc, falt, ftrab };
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <LegendBar/>
      <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 340px)', position: 'relative' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'auto', minWidth: '100%' }}>
          <thead>
            {/* Header row */}
            <tr>
              <th style={{
                position: 'sticky', left: 0, top: 0, zIndex: 30,
                background: '#fafafa', borderRight: '2px solid #e8e8e8', borderBottom: '1px solid #e8e8e8',
                minWidth: 280, width: 280, padding: '10px 14px',
                textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.85)',
              }}>
                Funcionário ({EMPLOYEES.length})
              </th>
              {days.map(d => {
                const dow = dowFor(d);
                const isHoliday = HOLIDAYS[d];
                return (
                  <th key={d} style={{
                    position: 'sticky', top: 0, zIndex: 20,
                    background: isHoliday ? '#f9f0ff' : (dow === 0 || dow === 6 ? '#fafafa' : '#fafafa'),
                    borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #e8e8e8',
                    width: 64, minWidth: 64, padding: '6px 0', textAlign: 'center',
                    fontSize: 11, fontWeight: 500, color: dow === 0 ? '#ff4d4f' : 'rgba(0,0,0,0.65)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isHoliday ? '#722ed1' : (dow === 0 ? '#ff4d4f' : 'rgba(0,0,0,0.85)') }}>{String(d).padStart(2,'0')}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>{WEEKDAYS_PT[dow]}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((emp, ei) => {
              const sum = empSummary(ei);
              const isHighlight = emp.name === 'João Silva';
              return (
                <tr key={ei}>
                  {/* Sticky employee column */}
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 10,
                    background: isHighlight ? '#f0f8ff' : '#fff',
                    borderRight: '2px solid #e8e8e8', borderBottom: '1px solid #f0f0f0',
                    padding: '8px 14px', minWidth: 280, width: 280,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" name={`select-employee-${emp.matricula}`} aria-label={`Selecionar ${emp.name}`} style={{ accentColor: '#1890ff' }}/>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #' + (ei * 173 % 0xffffff).toString(16).padStart(6, '0').slice(0,6) + ', #1890ff)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 12, flexShrink: 0,
                      }}>{emp.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.85)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {emp.matricula} · {emp.role}
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 10, padding: '0 5px', borderRadius: 2,
                            background: emp.bank.startsWith('+') ? '#f6ffed' : '#fff1f0',
                            color: emp.bank.startsWith('+') ? '#52c41a' : '#cf1322',
                            border: '1px solid ' + (emp.bank.startsWith('+') ? '#b7eb8f' : '#ffa39e'),
                            fontWeight: 500, fontVariantNumeric: 'tabular-nums',
                          }}>BH {emp.bank}</span>
                          {sum.inc > 0 && <span style={{ fontSize: 10, color: '#d48806' }}>⚠ {sum.inc}</span>}
                          {sum.falt > 0 && <span style={{ fontSize: 10, color: '#cf1322' }}>✕ {sum.falt}</span>}
                          {sum.ftrab > 0 && <span style={{ fontSize: 10, color: '#ad4e00' }}>⏱ {sum.ftrab}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  {days.map(d => {
                    const cell = CELLS[`${ei}_${d}`];
                    const isSel = selected && selected.ei === ei && selected.day === d;
                    return (
                      <GridCell
                        key={d}
                        cell={cell}
                        dow={dowFor(d)}
                        selected={isSel}
                        onClick={() => onCellClick(ei, d, cell)}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Manager Dashboard Shell ─────────────────────────────────
function ManagerDashboard({ onExitToLanding }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null); // { emp, day, cell, ei }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar collapsed={collapsed}/>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopHeader onToggleSidebar={() => setCollapsed(!collapsed)} onExitToLanding={onExitToLanding}/>

        <main style={{ margin: '15px 10px', padding: 24, background: '#fff', borderRadius: 5, flex: 1 }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'rgba(0,0,0,0.85)' }}>
                Espelho de Ponto Mensal
              </div>
              <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
                Acompanhe a escala, as batidas, folgas, feriados e ocorrências dos colaboradores no mês.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="tag default">Período: 01/06 – 30/06</span>
              <span className="tag warning">14 dias úteis revisados</span>
              <span className="tag primary">16 dias úteis restantes</span>
            </div>
          </div>

          <SummaryCards/>
          <FilterRow exportOpen={exportOpen} setExportOpen={setExportOpen}/>

          {/* Bulk actions banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4,
            marginBottom: 12, fontSize: 13, color: '#0050b3',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span style={{ flex: 1 }}>
              <strong>Gestão por exceção:</strong> 47 inconsistências, 6 faltas não justificadas e 3 atestados pendentes precisam da sua atenção este mês.
            </span>
            <button className="btn sm" style={{ borderColor: '#1890ff', color: '#1890ff' }}>Aprovar ajustes</button>
            <button className="btn sm" style={{ borderColor: '#1890ff', color: '#1890ff' }}>Notificar funcionários</button>
            <button className="btn sm" style={{ borderColor: '#1890ff', color: '#1890ff' }}>Marcar como revisado</button>
          </div>

          <MonthlyGrid
            selected={selected}
            onCellClick={(ei, day, cell) => setSelected({ ei, day, cell, emp: EMPLOYEES[ei] })}
          />
        </main>
      </div>

      <DayDetailDrawer
        open={!!selected}
        data={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export default ManagerDashboard;
