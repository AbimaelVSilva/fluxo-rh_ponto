// landing.jsx — Landing with 2 cards: Funcionário (mobile) vs Gestor (web)
import React from 'react';

function FluxoLogo({ size = 40, variant = 'mark' }) {
  // variant: 'mark' (icon only) | 'full' (logo + wordmark)
  const src = variant === 'full' ? 'assets/fluxorh-logo.png' : 'assets/fluxorh-mark.png';
  return <img src={src} alt="FluxoRH" style={{ height: size, width: 'auto', display: 'block' }}/>;
}

function PhoneIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="14" y="3" width="28" height="50" rx="5" fill="#fff" stroke="#fff" strokeWidth="2"/>
      <rect x="17" y="9" width="22" height="33" rx="1.5" fill="rgba(255,255,255,0.25)"/>
      <circle cx="28" cy="47.5" r="2" fill="#fff"/>
      <rect x="24" y="6" width="8" height="1.5" rx="0.75" fill="#fff" opacity="0.7"/>
      <text x="28" y="29" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">08:02</text>
    </svg>
  );
}

function DashboardIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="3" y="6" width="50" height="44" rx="4" fill="#fff" stroke="#fff" strokeWidth="2"/>
      <rect x="3" y="6" width="50" height="8" rx="4" fill="rgba(255,255,255,0.45)"/>
      <circle cx="8" cy="10" r="1" fill="#fff"/>
      <circle cx="12" cy="10" r="1" fill="#fff"/>
      <circle cx="16" cy="10" r="1" fill="#fff"/>
      <rect x="7" y="18" width="9" height="28" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="19" y="18" width="32" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="19" y="26" width="9" height="20" rx="1" fill="rgba(255,255,255,0.85)"/>
      <rect x="30" y="26" width="9" height="20" rx="1" fill="rgba(255,255,255,0.6)"/>
      <rect x="41" y="26" width="10" height="20" rx="1" fill="rgba(255,255,255,0.75)"/>
    </svg>
  );
}

function LandingChoiceCard({ title, subtitle, bullets, cta, icon, accent, gradient, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid ' + (hover ? accent : '#e8e8e8'),
        boxShadow: hover
          ? '0 14px 48px rgba(12,59,92,0.18), 0 2px 8px rgba(12,59,92,0.08)'
          : '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
        padding: 40,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', gap: 24,
        minHeight: 460,
        position: 'relative', overflow: 'hidden',
      }}>
      {/* accent bar (brand gradient) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: gradient || accent,
      }} />
      {/* faint watermark mark */}
      <img src="assets/fluxorh-mark.png" alt="" style={{
        position: 'absolute', right: -60, bottom: -40, width: 280, opacity: 0.05, pointerEvents: 'none',
      }}/>
      <div style={{
        width: 88, height: 88, borderRadius: 18,
        background: gradient || accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 24px rgba(12,59,92,0.18)',
        position: 'relative', zIndex: 1,
      }}>
        {icon}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>
          {subtitle}
        </div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0c3b5c', lineHeight: 1.2 }}>
          {title}
        </h2>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="8" cy="8" r="8" fill={accent}/>
              <path d="M4.5 8L7 10.5L11.5 6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <button className="btn primary lg" style={{
          background: gradient || accent, borderColor: 'transparent', boxShadow: '0 6px 16px rgba(12,59,92,0.2)',
        }}>
          {cta}
          <svg width="14" height="14" viewBox="0 0 16 16" style={{ marginLeft: 4 }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function LandingPage({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: 'radial-gradient(ellipse at top right, #e8f8f3 0%, transparent 40%), radial-gradient(ellipse at bottom left, #e6f0fa 0%, transparent 40%), #f6f8fb',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Watermark swoosh */}
      <img src="assets/fluxorh-mark.png" alt="" style={{
        position: 'absolute', right: -120, top: 80, width: 700, opacity: 0.06, pointerEvents: 'none',
      }}/>

      {/* Top bar */}
      <header style={{
        height: 64, padding: '12px 32px', background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,0.06)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="assets/fluxorh-logo.png" alt="FluxoRH" style={{ height: 32, width: 'auto' }}/>
          <div style={{ paddingLeft: 12, borderLeft: '1px solid #f0f0f0', marginLeft: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0c3b5c', lineHeight: 1.1 }}>Sistema de Ponto</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Gestão de Jornada</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tag default">v1.0.0 · Protótipo navegável</span>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 24px 40px', maxWidth: 1200, margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 28, padding: '0 12px', borderRadius: 14, marginBottom: 18,
            background: '#fff', border: '1px solid #c0e9dd', fontSize: 12, fontWeight: 600,
            color: '#0c3b5c', boxShadow: '0 2px 8px rgba(12,59,92,0.06)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2f9d86, #5fc0e0)',
            }}/>
            Protótipo de alta fidelidade
          </div>
          <h1 style={{
            margin: '0 0 12px', fontSize: 44, fontWeight: 700, lineHeight: 1.12,
            color: '#0c3b5c', letterSpacing: -0.8,
          }}>
            Como você quer explorar o sistema?
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: 'rgba(0,0,0,0.55)', lineHeight: 1.6 }}>
            O <strong style={{ color: '#0c3b5c' }}>FluxoRH</strong> possui duas experiências distintas: um aplicativo simples para o funcionário registrar o ponto,
            e um painel completo para o RH acompanhar a jornada de todos os colaboradores.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24,
          width: '100%', maxWidth: 980,
        }}>
          <LandingChoiceCard
            subtitle="Aplicativo mobile"
            title="Visão do Funcionário"
            accent="#2f9d86"
            gradient="linear-gradient(135deg, #2f9d86 0%, #48bfab 60%, #5fc0e0 100%)"
            icon={<PhoneIcon size={56}/>}
            bullets={[
              'Login com CPF, vínculo e biometria',
              'Bater ponto com confirmação e validação de localização',
              'Histórico de batidas, folgas, feriados e inconsistências',
              'Comprovantes e solicitações de ajuste',
            ]}
            cta="Abrir app do funcionário"
            onClick={() => onSelect('employee')}
          />
          <LandingChoiceCard
            subtitle="Painel web administrativo"
            title="Visão do Gestor de RH"
            accent="#1f4d80"
            gradient="linear-gradient(135deg, #3b7fc9 0%, #1f4d80 60%, #0c3b5c 100%)"
            icon={<DashboardIcon size={56}/>}
            bullets={[
              'Espelho de ponto mensal estilo planilha',
              'Filtros por empresa, filial, departamento e status',
              'Painel lateral com detalhes do dia e ações em lote',
              'Cards de resumo, ocorrências e fechamento mensal',
            ]}
            cta="Abrir painel do RH"
            onClick={() => onSelect('manager')}
          />
        </div>

        <div style={{
          marginTop: 56, display: 'flex', alignItems: 'center', gap: 24,
          color: 'rgba(0,0,0,0.45)', fontSize: 13,
        }}>
          <span>↳ Dados mocados para fins de protótipo</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }}/>
          <span>Use o botão "Voltar" no canto superior para retornar aqui</span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
export { FluxoLogo };
