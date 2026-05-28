// landing.jsx - Landing with 2 cards: Funcionario (mobile) vs Gestor (web)
import React from 'react';
import fluxoLogo from '../assets/fluxorh-logo.png';
import fluxoLogoDark from '../assets/fluxorh-logo-dark.png';
import fluxoMark from '../assets/fluxorh-mark.png';
import fluxoMarkDark from '../assets/fluxorh-mark-dark.png';

const brand = {
  logo: fluxoLogo,
  logoDark: fluxoLogoDark,
  mark: fluxoMark,
  markDark: fluxoMarkDark,
};

function FluxoLogo({ size = 40, variant = 'mark' }) {
  const src = variant === 'full' ? brand.logo : brand.mark;
  return <img src={src} alt="FluxoRH" style={{ height: size, width: 'auto', display: 'block' }}/>;
}

function LandingChoiceCard({ title, subtitle, bullets, cta, accent, gradient, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="landing-choice-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid ' + (hover ? accent : '#e8e8e8'),
        boxShadow: hover
          ? '0 14px 48px rgba(12,59,92,0.18), 0 2px 8px rgba(12,59,92,0.08)'
          : '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative', overflow: 'hidden',
      }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: gradient || accent,
      }} />
      <img src={brand.mark} alt="" style={{
        position: 'absolute', right: -48, bottom: -34, width: 230, opacity: 0.045, pointerEvents: 'none',
      }}/>
      <div className="landing-card-heading">
        <div className="landing-card-kicker" style={{ color: accent }}>
          {subtitle}
        </div>
        <h2>
          {title}
        </h2>
      </div>

      <ul className="landing-card-list">
        {bullets.map((b, i) => (
          <li key={i}>
            <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="8" cy="8" r="8" fill={accent}/>
              <path d="M4.5 8L7 10.5L11.5 6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="landing-card-action">
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
    <div className="landing-page">
      <img src={brand.mark} alt="" className="landing-watermark"/>

      <header className="landing-header">
        <div className="landing-header-brand">
          <img src={brand.logo} alt="FluxoRH" />
          <div className="landing-header-copy">
            <div>Sistema de Ponto</div>
            <span>Gestão de Jornada</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tag default">v1.0.0 · Protótipo navegável</span>
        </div>
      </header>

      <div className="landing-hero">
        <div className="landing-hero-copy">
          <img src={brand.logo} alt="FluxoRH" className="landing-hero-logo" />
          <div className="landing-badge">
            <span />
            Protótipo de alta fidelidade
          </div>
          <h1>
            Como você quer explorar o sistema?
          </h1>
          <p>
            O <strong style={{ color: '#0c3b5c' }}>FluxoRH</strong> possui duas experiências distintas: um aplicativo simples para o funcionário registrar o ponto,
            e um painel completo para o RH acompanhar a jornada de todos os colaboradores.
          </p>
        </div>

        <div className="landing-card-grid">
          <LandingChoiceCard
            subtitle="Aplicativo mobile"
            title="Visão do Funcionário"
            accent="#2f9d86"
            gradient="linear-gradient(135deg, #2f9d86 0%, #48bfab 60%, #5fc0e0 100%)"
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

        <div className="landing-footnote">
          <span>Dados mocados para fins de protótipo</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }}/>
          <span>Use o botão "Voltar" no canto superior para retornar aqui</span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
export { FluxoLogo };
