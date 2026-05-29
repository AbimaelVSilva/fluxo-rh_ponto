// employee-app.jsx — Mobile app inside iOS frame
import React from "react";
import Tesseract from "tesseract.js";
import { Fingerprint } from "@phosphor-icons/react";
import { IOSDevice } from "./ios-frame.jsx";
import fluxoLogo from "../assets/fluxorh-logo.png";
import fluxoMark from "../assets/fluxorh-mark.png";
import fluxoMarkDark from "../assets/fluxorh-mark-dark.png";

// ── shared mock data ─────────────────────────────────────────
const EMP_DATA = {
  name: "NÉLIO LIMA",
  firstName: "NÉLIO",
  company: "01 - MATRIZ",
  branch: "RUA MARTINS DE CARVALDO 4398",
  role: "Auxiliar de Operações",
  matricula: "1023",
  bankHours: "+02h30",
  bankHoursPositive: true,
  schedule: {
    entry: "08:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
  },
};

// Current "today" — Segunda, 03 de junho
const TODAY = {
  weekday: "segunda-feira",
  dayMonth: "03 de junho",
  dateKey: "03/06",
};

// Time helper — fake live clock starting at 08:02
function useLiveClock(initial = { h: 8, m: 2, s: 14 }) {
  const [t, setT] = React.useState(initial);
  React.useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        let { h, m, s } = prev;
        s += 1;
        if (s >= 60) {
          s = 0;
          m += 1;
        }
        if (m >= 60) {
          m = 0;
          h += 1;
        }
        if (h >= 24) h = 0;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    hhmm: `${pad(t.h)}:${pad(t.m)}`,
    hhmmss: `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`,
    raw: t,
  };
}

// ── Status pill helper ───────────────────────────────────────
function MobilePill({ tone = "success", icon, children }) {
  const tones = {
    success: { bg: "#f6ffed", fg: "#52c41a", bd: "#b7eb8f" },
    warning: { bg: "#fffbe6", fg: "#d48806", bd: "#ffe58f" },
    error: { bg: "#fff1f0", fg: "#cf1322", bd: "#ffa39e" },
    primary: { bg: "#e6f7ff", fg: "#007BA4", bd: "#91d5ff" },
    neutral: { bg: "#f5f5f5", fg: "#595959", bd: "#d9d9d9" },
  };
  const t = tones[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: "1px solid " + t.bd,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {icon}
      {children}
    </div>
  );
}

// ── Login Screen ─────────────────────────────────────────────
function EmployeeLoginScreen({ onLogin }) {
  const [step, setStep] = React.useState("cpf"); // cpf | vinculo | senha
  const [cpf, setCpf] = React.useState("");
  const [vinculo, setVinculo] = React.useState(null);
  const [pwd, setPwd] = React.useState("");
  const [err, setErr] = React.useState("");

  const formatCpf = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  };

  const cpfValid = cpf.replace(/\D/g, "").length === 11;

  return (
    <div
      style={{
        minHeight: "100%",
        background:
          "linear-gradient(180deg, #f7fbff 0%, #f6f9fc 46%, #f0f2f5 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "90px 24px 34px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <img
            src={fluxoLogo}
            alt="FluxoRH"
            style={{
              height: 60,
              width: "auto",
              display: "block",
              margin: "0 auto 18px",
            }}
          />
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.15,
              fontWeight: 780,
              color: "rgba(0,0,0,0.85)",
              letterSpacing: 0,
            }}
          >
            Bem-vindo(a)!
          </div>
        </div>

        {step === "cpf" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div
              style={{
                marginBottom: 2,
                fontSize: 14,
                lineHeight: 1.45,
                color: "rgba(0,0,0,0.65)",
                textAlign: "left",
              }}
            >
              Informe seu CPF para acessar o registro de ponto.
            </div>
            <label
              htmlFor="employee-cpf"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              CPF
            </label>
            <input
              id="employee-cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => {
                setCpf(formatCpf(e.target.value));
                setErr("");
              }}
              style={{
                width: "100%",
                height: 56,
                border: "1px solid #d9d9d9",
                borderRadius: 16,
                background: "rgba(255,255,255,0.92)",
                outline: "none",
                boxShadow: "0 10px 24px rgba(0,123,164,0.08)",
                padding: "0 16px",
                fontSize: 19,
                fontWeight: 650,
                color: "rgba(0,0,0,0.85)",
                letterSpacing: 0,
              }}
            />
            {err && (
              <div style={{ color: "#ff4d4f", fontSize: 13, marginTop: 6 }}>
                {err}
              </div>
            )}
            <button
              style={{
                width: "100%",
                height: 54,
                border: 0,
                borderRadius: 16,
                background: cpfValid
                  ? "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)"
                  : "#dedede",
                color: cpfValid ? "#fff" : "#7a7a7a",
                fontSize: 16,
                fontWeight: 750,
                cursor: cpfValid ? "pointer" : "not-allowed",
                boxShadow: cpfValid
                  ? "0 14px 28px rgba(0,123,164,0.28)"
                  : "none",
              }}
              disabled={!cpfValid}
              onClick={() => {
                // Mock: Nélio has 2 vínculos
                setStep("vinculo");
              }}
            >
              Continuar
            </button>
            <button
              style={{
                width: "100%",
                height: 44,
                border: 0,
                background: "transparent",
                color: "#007BA4",
                fontSize: 14,
                fontWeight: 650,
                cursor: "pointer",
              }}
            >
              Problemas para acessar?
            </button>
          </div>
        )}

        {step === "vinculo" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              Onde você deseja acessar hoje?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(0,0,0,0.55)",
                marginBottom: 8,
              }}
            >
              Identificamos mais de um vínculo ativo neste CPF.
            </div>
            {[
              {
                co: "01 - MATRIZ",
                role: "RUA MARTINS DE CARVALDO 4398",
                branch: "",
              },
              {
                co: "02 - FILIAL SAPIRANGA",
                role: "AVENIDA ENGENHEIRO LEAL LIMA VERDE, 306",
                branch: "",
              },
            ].map((v, i) => (
              <button
                key={i}
                onClick={() => {
                  setVinculo(v);
                  setStep("senha");
                }}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #e8e8e8",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "#e6f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#007BA4",
                    fontSize: 14,
                  }}
                >
                  {v.co.split(" - ")[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "rgba(0,0,0,0.85)",
                    }}
                  >
                    {v.co}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                    {v.role}
                  </div>
                </div>
                <span style={{ color: "rgba(0,0,0,0.25)" }}>›</span>
              </button>
            ))}
            <button
              onClick={() => setStep("cpf")}
              className="btn lg"
              style={{
                marginTop: 4,
                border: "none",
                background: "transparent",
                color: "#007BA4",
              }}
            >
              ← Trocar CPF
            </button>
          </div>
        )}

        {step === "senha" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #d9d9d9",
                boxShadow: "0 10px 24px rgba(0,123,164,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                NL
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 750,
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  NÉLIO LIMA
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,0,0,0.65)",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {vinculo?.co || "01 - MATRIZ"}
                </div>
              </div>
              <button
                onClick={() => setStep("vinculo")}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#007BA4",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "8px 0 8px 8px",
                }}
              >
                Trocar
              </button>
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.45,
                color: "rgba(0,0,0,0.65)",
              }}
            >
              Digite sua senha para continuar.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                htmlFor="employee-password"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.85)",
                }}
              >
                Senha
              </label>
              <input
                id="employee-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                style={{
                  width: "100%",
                  height: 56,
                  border: "1px solid #d9d9d9",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.92)",
                  outline: "none",
                  boxShadow: "0 10px 24px rgba(0,123,164,0.08)",
                  padding: "0 16px",
                  fontSize: 18,
                  fontWeight: 650,
                  color: "rgba(0,0,0,0.85)",
                  letterSpacing: 0,
                }}
              />
            </div>
            <button
              style={{
                width: "100%",
                height: 54,
                border: 0,
                borderRadius: 16,
                background:
                  pwd.length >= 4
                    ? "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)"
                    : "#dedede",
                color: pwd.length >= 4 ? "#fff" : "#7a7a7a",
                fontSize: 16,
                fontWeight: 750,
                cursor: pwd.length >= 4 ? "pointer" : "not-allowed",
                boxShadow:
                  pwd.length >= 4 ? "0 14px 28px rgba(0,123,164,0.28)" : "none",
              }}
              disabled={pwd.length < 4}
              onClick={onLogin}
            >
              Entrar
            </button>
            <button
              style={{
                width: "100%",
                height: 52,
                borderRadius: 16,
                border: "1px solid rgba(0,123,164,0.32)",
                background: "rgba(255,255,255,0.62)",
                color: "#007BA4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontSize: 15,
                fontWeight: 720,
                cursor: "pointer",
              }}
            >
              <Fingerprint size={20} weight="bold" />
              Entrar com biometria
            </button>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <a href="#" style={{ color: "#007BA4", fontSize: 14 }}>
                Esqueci minha senha
              </a>
            </div>
          </div>
        )}

        {/* footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 22,
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.45,
            color: "rgba(0,0,0,0.45)",
          }}
        >
          FluxoRH · versão 1.0.0
        </div>
      </div>
    </div>
  );
}

// ── Home / Bater Ponto ───────────────────────────────────────
function EmployeeHomeScreen({
  onOpenHistory,
  onLogout,
  batidas,
  nextAction,
  onPunch,
}) {
  const clock = useLiveClock();

  const nextLabels = {
    entry: "Registrar entrada",
    lunchOut: "Registrar saída para almoço",
    lunchIn: "Registrar retorno do almoço",
    exit: "Encerrar expediente",
    done: "Expediente encerrado",
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "linear-gradient(180deg, #e8f8f3 0%, #f6f8fb 280px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* top header */}
      <div
        style={{
          padding: "60px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            NL
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              Olá, {EMP_DATA.firstName}!
            </div>
            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
              {EMP_DATA.company}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: 38,
            height: 38,
            border: "none",
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
            cursor: "pointer",
          }}
          title="Sair"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <div
        style={{
          padding: "0 20px",
          marginTop: 6,
          fontSize: 13,
          color: "rgba(0,0,0,0.55)",
        }}
      >
        Hoje, {TODAY.weekday}, {TODAY.dayMonth}
      </div>

      {/* Clock card */}
      <div
        style={{
          margin: "20px 20px 0",
          background: "#fff",
          borderRadius: 18,
          padding: "24px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "0 4px 24px rgba(0,123,164,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {/* faint brand mark */}
        <img
          src={fluxoMark}
          alt=""
          style={{
            position: "absolute",
            right: -40,
            top: -20,
            width: 160,
            opacity: 0.05,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -1.5,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
            position: "relative",
            background: "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {clock.hhmm}
          <span style={{ fontSize: 24, opacity: 0.55, marginLeft: 4 }}>
            :{String(clock.raw.s).padStart(2, "0")}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(0,0,0,0.5)",
            marginTop: 6,
            position: "relative",
          }}
        >
          Horário oficial da empresa
        </div>

        {/* status validation */}
        <div style={{ marginTop: 18, position: "relative" }}>
          <MobilePill
            tone="success"
            icon={
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          >
            Você está dentro da área permitida
          </MobilePill>
        </div>
      </div>

      {/* Main punch button */}
      <div style={{ padding: "24px 20px 0" }}>
        <button
          onClick={onPunch}
          disabled={nextAction === "done"}
          style={{
            width: "100%",
            height: 64,
            borderRadius: 14,
            border: "none",
            background:
              nextAction === "done"
                ? "#bdbdbd"
                : "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            cursor: nextAction === "done" ? "default" : "pointer",
            boxShadow:
              nextAction === "done"
                ? "none"
                : "0 8px 24px rgba(47,157,134,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.2s",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {nextLabels[nextAction]}
        </button>
      </div>

      {/* Escala + Banco de horas grid */}
      <div
        style={{
          padding: "16px 20px 0",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 12,
        }}
      >
        {/* Escala */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(0,0,0,0.45)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            Escala de hoje
          </div>
          <div
            style={{ fontSize: 13, color: "rgba(0,0,0,0.85)", lineHeight: 1.7 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Entrada</span>
              <strong>{EMP_DATA.schedule.entry}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Almoço</span>
              <strong>
                {EMP_DATA.schedule.lunchOut} – {EMP_DATA.schedule.lunchIn}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Saída</span>
              <strong>{EMP_DATA.schedule.exit}</strong>
            </div>
          </div>
        </div>
        {/* Banco de horas */}
        <div
          style={{
            background: "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
            borderRadius: 12,
            padding: 14,
            border: "1px solid #b7eb8f",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(0,0,0,0.45)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Banco de horas
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#389e0d",
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {EMP_DATA.bankHours}
          </div>
          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
            crédito acumulado
          </div>
        </div>
      </div>

      {/* Batidas de hoje */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              Batidas de hoje
            </div>
            <button
              onClick={onOpenHistory}
              style={{
                border: "none",
                background: "transparent",
                color: "#007BA4",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Ver histórico ›
            </button>
          </div>
          {batidas.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderTop: i === 0 ? "none" : "1px solid #f5f5f5",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background:
                    b.status === "done"
                      ? "#f6ffed"
                      : b.status === "sync"
                        ? "#fff7e6"
                        : "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    b.status === "done"
                      ? "#52c41a"
                      : b.status === "sync"
                        ? "#fa8c16"
                        : "rgba(0,0,0,0.25)",
                }}
              >
                {b.status === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path
                      d="M3 8L7 12L13 4"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : b.status === "sync" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.7 1 6.4 2.6" />
                    <polyline points="21 3 21 9 15 9" />
                  </svg>
                ) : (
                  "•"
                )}
              </div>
              <div style={{ flex: 1, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
                {b.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color:
                    b.time === "pendente"
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(0,0,0,0.85)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {b.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

// ── Confirmation Modal ───────────────────────────────────────
function PunchConfirmModal({ open, time, actionLabel, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        borderRadius: 48,
        overflow: "hidden",
      }}
      className="fade-in"
    >
      <div
        style={{
          background: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          width: "100%",
          padding: "28px 24px 44px",
          animation: "slideUp 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#e8e8e8",
            borderRadius: 2,
            margin: "0 auto 18px",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8f8f3 0%, #e3f4fb 100%)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007BA4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: "rgba(0,0,0,0.85)" }}
          >
            Confirmar {actionLabel}?
          </div>
        </div>
        <div
          style={{
            background: "#fafafa",
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            color: "rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}
          >
            <span style={{ color: "rgba(0,0,0,0.5)" }}>Horário</span>
            <strong style={{ color: "rgba(0,0,0,0.85)" }}>{time}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <span style={{ color: "rgba(0,0,0,0.5)" }}>Local</span>
            <strong style={{ color: "rgba(0,0,0,0.85)" }}>
              RUA MARTINS DE CARVALDO 4398
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <span style={{ color: "rgba(0,0,0,0.5)" }}>Status</span>
            <span style={{ color: "#52c41a", fontWeight: 600 }}>
              ● Localização validada
            </span>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            onClick={onCancel}
            className="btn lg"
            style={{ width: "100%" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn primary lg"
            style={{ width: "100%" }}
          >
            Confirmar batida
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success Modal ────────────────────────────────────────────
function PunchSuccessModal({
  open,
  time,
  actionLabel,
  onClose,
  onVerComprovante,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 48,
        overflow: "hidden",
        padding: 24,
      }}
      className="fade-in"
    >
      <div
        className="scale-in"
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "28px 24px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f6ffed, #b7eb8f)",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(82,196,26,0.25)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#52c41a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "rgba(0,0,0,0.85)",
            marginBottom: 6,
          }}
        >
          Ponto registrado com sucesso
        </div>
        <div
          style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 18 }}
        >
          {actionLabel} registrada às{" "}
          <strong style={{ color: "#007BA4" }}>{time}</strong>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => {
              onClose();
              onVerComprovante();
            }}
            className="btn ghost lg"
            style={{ width: "100%" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Ver comprovante
          </button>
          <button
            onClick={onClose}
            className="btn primary lg"
            style={{ width: "100%" }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comprovante Modal ────────────────────────────────────────
function ComprovanteModal({
  open,
  onClose,
  time,
  actionLabel,
  employee,
  branch,
}) {
  const compRef = React.useRef(null);
  const protocolo = React.useMemo(
    () => `PTO-${Date.now().toString(36).toUpperCase().slice(-8)}`,
    [],
  );
  const data = React.useMemo(
    () => ({
      dateStr: `${String(new Date().getDate()).padStart(2, "0")}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`,
      horaStr: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}:${String(new Date().getSeconds()).padStart(2, "0")}`,
    }),
    [],
  );

  if (!open) return null;

  const { dateStr, horaStr } = data;

  const handleShare = async () => {
    const text = `Comprovante de Ponto\n${employee.name} · Matricula ${employee.matricula}\n${actionLabel} · ${time}h\n${dateStr} · ${horaStr}\nLocal: ${branch}\nProtocolo: ${protocolo}\n\nFluxoRH — Registro de Ponto`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Comprovante de Ponto", text });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Comprovante copiado para a area de transferencia!");
    }
  };

  const handleSave = () => {
    if (compRef.current) {
      const el = compRef.current;
      const style = document.createElement("style");
      style.textContent =
        "@media print { body { margin:0; } body * { visibility:hidden; } #comprovante-print, #comprovante-print * { visibility:visible; } #comprovante-print { position:absolute; left:0; top:0; width:100%; } .btn-row { display:none !important; } }";
      document.head.appendChild(style);
      window.print();
      setTimeout(() => document.head.removeChild(style), 100);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 48,
        overflow: "hidden",
        padding: 16,
      }}
      className="fade-in"
    >
      <div
        className="scale-in"
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxHeight: "92%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 700, color: "rgba(0,0,0,0.85)" }}
          >
            Comprovante de Ponto
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "#f5f5f5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Receipt body */}
        <div
          ref={compRef}
          id="comprovante-print"
          style={{
            padding: "20px 16px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "#fafafa",
          }}
        >
          {/* Brand header */}
          <div
            style={{
              textAlign: "center",
              paddingBottom: 14,
              borderBottom: "1px dashed #d9d9d9",
            }}
          >
            <img
              src={fluxoLogo}
              alt="FluxoRH"
              style={{
                height: 28,
                width: "auto",
                display: "block",
                margin: "0 auto 8px",
              }}
            />

            <div
              style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 2 }}
            >
              Sistema de Registro de Ponto Eletronico
            </div>
          </div>

          {/* Status banner */}
          <div
            style={{
              textAlign: "center",
              padding: "10px 14px",
              background: "linear-gradient(135deg, #f6ffed, #e6fffb)",
              borderRadius: 10,
              border: "1px solid #b7eb8f",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#52c41a"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#389e0d" }}>
                Ponto Registrado com Sucesso
              </span>
            </div>
          </div>

          {/* Employee info */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 14,
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 10,
              }}
            >
              Dados do Funcionario
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #007BA4, #007BA4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {employee.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  {employee.name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Matricula: {employee.matricula}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.45)" }}>
                Empresa
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.85)",
                  textAlign: "right",
                }}
              >
                {employee.company}
              </div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.45)" }}>
                Cargo
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.85)",
                  textAlign: "right",
                }}
              >
                {employee.role}
              </div>
            </div>
          </div>

          {/* Punch details */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 14,
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 10,
              }}
            >
              Detalhes da Batida
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Tipo
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#007BA4" }}
                >
                  {actionLabel}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Horario
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.85)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {time}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Data
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  {dateStr}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Local
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(0,0,0,0.85)",
                    textAlign: "right",
                  }}
                >
                  {branch}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Dispositivo
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  App Mobile
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Validacao
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#52c41a" }}
                >
                  ✓ Biometria facial
                </span>
              </div>
            </div>
          </div>

          {/* Protocol / footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: 8,
              borderTop: "1px dashed #d9d9d9",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(0,0,0,0.35)",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              Protocolo
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "monospace",
                color: "rgba(0,0,0,0.35)",
                letterSpacing: 1,
                background: "#f5f5f5",
                padding: "4px 12px",
                borderRadius: 6,
                display: "inline-block",
              }}
            >
              {protocolo}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(0,0,0,0.3)",
                marginTop: 10,
                lineHeight: 1.4,
              }}
            >
              Registro gerado em {dateStr} as {horaStr}
              <br />
              FluxoRH — Todos os direitos reservados
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="btn-row"
          style={{
            display: "flex",
            gap: 10,
            padding: "12px 16px 16px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "1.5px solid #007BA4",
              background: "#fff",
              color: "#007BA4",
              fontSize: 14,
              fontWeight: 650,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Compartilhar
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: "none",
              background: "#007BA4",
              color: "#fff",
              fontSize: 14,
              fontWeight: 650,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(0,123,164,0.3)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Biometric Choice Modal ──────────────────────────────────
function BiometricChoiceModal({
  open,
  onCancel,
  onChooseBiometric,
  onChooseFacial,
  onConfirmManual,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        borderRadius: 48,
        overflow: "hidden",
      }}
      className="fade-in"
    >
      <div
        style={{
          background: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          width: "100%",
          padding: "28px 24px 44px",
          animation: "slideUp 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#e8e8e8",
            borderRadius: 2,
            margin: "0 auto 18px",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8f8f3, #e3f4fb)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007BA4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(0,0,0,0.85)",
              marginBottom: 6,
            }}
          >
            Como deseja registrar?
          </div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
            Escolha o metodo de verificacao
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={onChooseBiometric}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "1.5px solid #007BA4",
              background: "#f0f9ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #007BA4, #007BA4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Fingerprint size={22} weight="bold" />
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.85)",
                }}
              >
                Biometria do celular
              </div>
              <div
                style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 2 }}
              >
                Use a digital ou Face ID do seu aparelho
              </div>
            </div>
            <span style={{ color: "rgba(0,0,0,0.25)", fontSize: 20 }}>›</span>
          </button>

          <button
            onClick={onChooseFacial}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "1.5px solid #e8e8e8",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2f9d86, #48bfab)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.85)",
                }}
              >
                Reconhecimento facial
              </div>
              <div
                style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 2 }}
              >
                Posicione seu rosto na camera
              </div>
            </div>
            <span style={{ color: "rgba(0,0,0,0.25)", fontSize: 20 }}>›</span>
          </button>
        </div>

        <button
          onClick={onConfirmManual}
          style={{
            width: "100%",
            marginTop: 14,
            height: 44,
            border: 0,
            background: "transparent",
            color: "#007BA4",
            fontSize: 14,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          Continuar sem biometria
        </button>
      </div>
    </div>
  );
}

// ── Biometric Scanning Modal ─────────────────────────────────
function BiometricScanningModal({ open, onSuccess, onCancel }) {
  const [phase, setPhase] = React.useState(0);
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  React.useEffect(() => {
    if (!open) return;
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => {
      onSuccessRef.current();
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 110,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 48,
        overflow: "hidden",
      }}
      className="fade-in"
    >
      <div
        className="scale-in"
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "32px 28px",
          textAlign: "center",
          width: 280,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              phase === 2
                ? "linear-gradient(135deg, #f6ffed, #b7eb8f)"
                : "linear-gradient(135deg, #e6f7ff, #91d5ff)",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.4s",
            boxShadow: phase === 2 ? "0 8px 20px rgba(82,196,26,0.3)" : "none",
          }}
        >
          {phase === 2 ? (
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#52c41a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <div className={phase === 1 ? "pulse" : ""}>
              <Fingerprint size={40} weight="bold" color="#007BA4" />
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: phase === 2 ? "#389e0d" : "rgba(0,0,0,0.85)",
            marginBottom: 6,
            transition: "color 0.3s",
          }}
        >
          {phase === 2
            ? "Biometria verificada!"
            : phase === 1
              ? "Toque no sensor"
              : "Preparando..."}
        </div>
        <div
          style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}
        >
          {phase === 2
            ? "Identidade confirmada com sucesso"
            : "Use a biometria do seu celular para confirmar"}
        </div>
        {phase < 2 && (
          <button
            onClick={onCancel}
            style={{
              marginTop: 20,
              height: 36,
              border: 0,
              background: "transparent",
              color: "rgba(0,0,0,0.45)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Face Recognition Modal (camera + tesseract.js) ────────────
function FaceRecognitionModal({ open, onSuccess, onCancel }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [phase, setPhase] = React.useState("init");
  const [progress, setProgress] = React.useState(0);
  const streamRef = React.useRef(null);
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const reset = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const run = async () => {
      setPhase("init");
      setProgress(0);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          await videoRef.current.play();
        }
      } catch (e) {}

      if (cancelled) return;
      setPhase("camera");
      await new Promise((r) => setTimeout(r, 800));

      if (cancelled) return;
      setPhase("scanning");
      const scanStart = Date.now();
      const scanDuration = 2200;

      const progressTimer = setInterval(() => {
        if (cancelled) {
          clearInterval(progressTimer);
          return;
        }
        const elapsed = Date.now() - scanStart;
        setProgress(Math.min(95, Math.round((elapsed / scanDuration) * 100)));
      }, 100);

      await new Promise((r) => setTimeout(r, scanDuration));
      clearInterval(progressTimer);
      if (cancelled) return;

      setPhase("processing");
      setProgress(96);

      try {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext("2d");
          if (videoRef.current && videoRef.current.readyState >= 2) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, -320, 0, 320, 240);
            ctx.restore();
          } else {
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, 320, 240);
          }

          await Tesseract.recognize(canvas, "eng", {
            logger: (m) => {
              if (cancelled) return;
              if (m.status === "recognizing text") {
                setProgress(96 + Math.round(m.progress * 0.04));
              }
            },
          });
        }
      } catch (e) {}

      if (cancelled) return;
      setProgress(100);
      setPhase("success");
    };

    run();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  React.useEffect(() => {
    if (phase === "success") {
      const t = setTimeout(() => {
        reset();
        onSuccessRef.current();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (!open) return null;

  const isActive = phase === "scanning" || phase === "processing";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 110,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Camera area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: phase === "success" ? 0.5 : 1,
            transform: "scaleX(-1)",
            transition: "opacity 0.4s",
          }}
        />

        {/* Dark placeholder when no camera */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase === "success" ? 0.3 : 1,
            transition: "opacity 0.4s",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Face guide oval */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 190,
              height: 250,
              borderRadius: "50% 50% 42% 42%",
              border:
                phase === "success"
                  ? "3px solid #52c41a"
                  : isActive
                    ? "3px solid rgba(255,255,255,0.65)"
                    : "3px solid rgba(255,255,255,0.18)",
              boxShadow:
                phase === "success"
                  ? "0 0 36px rgba(82,196,26,0.45)"
                  : isActive
                    ? "0 0 24px rgba(255,255,255,0.12)"
                    : "none",
              transition: "all 0.4s",
            }}
          />
        </div>

        {/* Corner guides */}
        {isActive && (
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {["top-left", "top-right", "bottom-left", "bottom-right"].map(
              (pos, i) => {
                const css = {
                  position: "absolute",
                  width: 24,
                  height: 24,
                  borderColor: "rgba(255,255,255,0.6)",
                };
                if (pos === "top-left") {
                  css.top = 110;
                  css.left = 60;
                  css.borderTop = "2px solid";
                  css.borderLeft = "2px solid";
                  css.borderTopLeftRadius = 8;
                }
                if (pos === "top-right") {
                  css.top = 110;
                  css.right = 60;
                  css.borderTop = "2px solid";
                  css.borderRight = "2px solid";
                  css.borderTopRightRadius = 8;
                }
                if (pos === "bottom-left") {
                  css.bottom = 130;
                  css.left = 60;
                  css.borderBottom = "2px solid";
                  css.borderLeft = "2px solid";
                  css.borderBottomLeftRadius = 8;
                }
                if (pos === "bottom-right") {
                  css.bottom = 130;
                  css.right = 60;
                  css.borderBottom = "2px solid";
                  css.borderRight = "2px solid";
                  css.borderBottomRightRadius = 8;
                }
                return <div key={pos} style={css} />;
              },
            )}
          </div>
        )}

        {/* Top status label */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          {isActive && (
            <div
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                className="pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#52c41a",
                  display: "inline-block",
                }}
              />
              Posicione seu rosto no centro
            </div>
          )}
          {phase === "success" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(82,196,26,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2.5px solid #52c41a",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#52c41a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ color: "#52c41a", fontSize: 18, fontWeight: 700 }}>
                Rosto verificado!
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Reconhecimento facial confirmado
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isActive && (
          <div
            style={{ position: "absolute", bottom: 80, left: 40, right: 40 }}
          >
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.18)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #2f9d86, #48bfab, #5fc0e0)",
                  borderRadius: 2,
                  width: `${Math.min(progress, 100)}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                color: "rgba(255,255,255,0.55)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {phase === "processing"
                ? "Tesseract.js processando..."
                : "Analisando..."}{" "}
              {Math.floor(progress)}%
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: "20px 24px 40px",
          background: "#000",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={handleCancel}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Hidden canvas for tesseract */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ── Bottom Tab Bar (iOS-style) ─────────────────────────────
function TabIcon({ name, active }) {
  const stroke = active ? "#007BA4" : "rgba(0,0,0,0.45)";
  const fill = active ? "#007BA4" : "none";
  const w = 24,
    h = 24;
  if (name === "home")
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill={active ? "#007BA4" : "none"}
          stroke={stroke}
        />
        <polyline points="12 7 12 12 15 14" stroke={active ? "#fff" : stroke} />
      </svg>
    );
  if (name === "history")
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          fill={active ? "#e6f7ff" : "none"}
          stroke={stroke}
        />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <circle cx="12" cy="16" r="1.5" fill={stroke} />
      </svg>
    );
  if (name === "requests")
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          fill={active ? "#e6f7ff" : "none"}
        />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    );
  if (name === "profile")
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          fill={active ? "#e6f7ff" : "none"}
        />
        <circle cx="12" cy="7" r="4" fill={active ? "#e6f7ff" : "none"} />
      </svg>
    );
  return null;
}

function BottomTabBar({ active, onChange, badges = {} }) {
  const tabs = [
    { k: "home", label: "Bater Ponto" },
    { k: "history", label: "Histórico" },
    { k: "requests", label: "Solicitações" },
    { k: "profile", label: "Perfil" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 83,
        paddingBottom: 22, // home indicator overlays bottom 34px
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "0.5px solid rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        zIndex: 55,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.k}
          onClick={() => onChange(t.k)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "6px 0 0",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            <TabIcon name={t.k} active={active === t.k} />
            {badges[t.k] > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -8,
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 10,
                  background: "#ff4d4f",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff",
                  boxSizing: "content-box",
                }}
              >
                {badges[t.k]}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: active === t.k ? 600 : 500,
              color: active === t.k ? "#007BA4" : "rgba(0,0,0,0.45)",
              letterSpacing: -0.1,
            }}
          >
            {t.label}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Requests Screen ────────────────────────────────────
function EmployeeRequestsScreen() {
  const items = [
    {
      type: "Ajuste de ponto",
      date: "04/06",
      detail: "Retorno almoço não registrado",
      status: "pending",
      age: "há 1 dia",
    },
    {
      type: "Justificativa de falta",
      date: "07/06",
      detail: "Atestado médico anexado",
      status: "approved",
      age: "há 3 dias",
    },
    {
      type: "Compensação de hora",
      date: "28/05",
      detail: "02h00 → banco de horas",
      status: "approved",
      age: "há 1 semana",
    },
    {
      type: "Solicitação de férias",
      date: "15/07 — 29/07",
      detail: "15 dias úteis",
      status: "pending",
      age: "há 2 dias",
    },
    {
      type: "Ajuste de ponto",
      date: "22/05",
      detail: "Esquecimento de batida de saída",
      status: "rejected",
      age: "há 1 semana",
      reason: "Sem testemunhas registradas",
    },
  ];
  const statusMap = {
    pending: { tone: "warning", label: "Em análise" },
    approved: { tone: "success", label: "Aprovada" },
    rejected: { tone: "error", label: "Reprovada" },
  };
  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          background: "#fff",
          padding: "64px 20px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 750,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              Solicitações
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", marginTop: 3 }}
            >
              Ajustes, justificativas e pedidos
            </div>
          </div>
          <button
            style={{
              width: 42,
              height: 42,
              border: 0,
              borderRadius: 14,
              background: "#007BA4",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 20px rgba(0,123,164,0.22)",
            }}
            aria-label="Nova solicitação"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginTop: 14,
          }}
        >
          {[
            {
              label: "Em análise",
              value: counts.pending,
              color: "#faad14",
              bg: "#fffbe6",
            },
            {
              label: "Aprovadas",
              value: counts.approved,
              color: "#52c41a",
              bg: "#f6ffed",
            },
            {
              label: "Reprovadas",
              value: counts.rejected,
              color: "#ff4d4f",
              bg: "#fff1f0",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                minHeight: 58,
                borderRadius: 12,
                background: item.bg,
                border: "1px solid rgba(0,0,0,0.04)",
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 780,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(0,0,0,0.55)",
                  marginTop: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "12px 16px 104px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((it, i) => {
          const s = statusMap[it.status];
          return (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: 14,
                border: "1px solid #f0f0f0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 9,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "rgba(0,0,0,0.85)",
                      lineHeight: 1.25,
                    }}
                  >
                    {it.type}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.5)",
                      marginTop: 3,
                    }}
                  >
                    {it.date} · {it.age}
                  </div>
                </div>
                <MobilePill tone={s.tone}>{s.label}</MobilePill>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.65)",
                  lineHeight: 1.4,
                  paddingTop: 8,
                  borderTop: "1px dashed #f0f0f0",
                }}
              >
                {it.detail}
              </div>
              {it.reason && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: "#fff1f0",
                    border: "1px solid #ffa39e",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#820014",
                  }}
                >
                  Motivo: {it.reason}
                </div>
              )}
              {it.status === "pending" && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid rgba(0,123,164,0.28)",
                      background: "#fff",
                      color: "#007BA4",
                      fontSize: 13,
                      fontWeight: 650,
                      cursor: "pointer",
                    }}
                  >
                    Ver detalhes
                  </button>
                  <button
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid #ff4d4f",
                      background: "#fff",
                      color: "#ff4d4f",
                      fontSize: 13,
                      fontWeight: 650,
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Profile Screen ──────────────────────────────────────
function EmployeeProfileScreen({ onLogout }) {
  const Item = ({ icon, label, value, onClick, danger }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        width: "100%",
        background: "#fff",
        border: "none",
        borderBottom: "1px solid #f5f5f5",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: danger ? "#fff1f0" : "#e6f7ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: danger ? "#ff4d4f" : "#007BA4",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            color: danger ? "#ff4d4f" : "rgba(0,0,0,0.85)",
            fontWeight: danger ? 600 : 500,
          }}
        >
          {label}
        </div>
        {value && (
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{value}</div>
        )}
      </div>
      {!danger && (
        <span style={{ color: "rgba(0,0,0,0.25)", fontSize: 18 }}>›</span>
      )}
    </button>
  );
  return (
    <div
      style={{ minHeight: "100%", background: "#f0f2f5", paddingBottom: 100 }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #007BA4 0%, #007BA4 100%)",
          padding: "70px 20px 40px",
          color: "#fff",
          textAlign: "center",
          position: "relative",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* watermark */}
        <img
          src={fluxoMarkDark}
          alt=""
          style={{
            position: "absolute",
            right: -60,
            top: 30,
            width: 220,
            opacity: 0.15,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
            border: "3px solid rgba(255,255,255,0.45)",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
            position: "relative",
            backdropFilter: "blur(8px)",
          }}
        >
          NL
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, position: "relative" }}>
          NÉLIO LIMA
        </div>
        <div
          style={{
            fontSize: 12,
            opacity: 0.9,
            marginTop: 2,
            position: "relative",
          }}
        >
          Auxiliar de Operações · Matrícula 1023
        </div>
      </div>

      {/* Quick stats */}
      <div
        style={{
          padding: "0 16px",
          marginTop: -22,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "12px 8px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center", padding: "0 4px" }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#52c41a",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              +02h30
            </div>
            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)" }}>
              Banco de horas
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "0 4px",
              borderLeft: "1px solid #f0f0f0",
              borderRight: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              14
            </div>
            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)" }}>
              Dias trab. mês
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "0 4px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#faad14" }}>
              1
            </div>
            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)" }}>
              Pendências
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div
        style={{
          padding: "16px 16px 0",
          fontSize: 11,
          color: "rgba(0,0,0,0.45)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Conta
      </div>
      <div
        style={{
          background: "#fff",
          margin: "8px 0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          label="Dados pessoais"
          value="CPF, telefone, endereço"
        />
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          label="Alterar senha"
        />
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
            </svg>
          }
          label="Biometria"
          value="Face ID ativo"
        />
      </div>

      <div
        style={{
          padding: "0 16px",
          fontSize: 11,
          color: "rgba(0,0,0,0.45)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Trabalho
      </div>
      <div
        style={{
          background: "#fff",
          margin: "8px 0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
          label="Meus vínculos"
          value="01 - MATRIZ, 02 - FILIAL SAPIRANGA"
        />
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          }
          label="Escala mensal"
        />
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          label="Comprovantes de ponto"
        />
      </div>

      <div
        style={{
          padding: "0 16px",
          fontSize: 11,
          color: "rgba(0,0,0,0.45)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Suporte
      </div>
      <div
        style={{
          background: "#fff",
          margin: "8px 0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          label="Central de ajuda"
        />
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          }
          label="Falar com o RH"
        />
      </div>

      <div
        style={{
          background: "#fff",
          margin: "8px 16px",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Item
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
          label="Sair"
          danger
          onClick={onLogout}
        />
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "rgba(0,0,0,0.35)",
          padding: 12,
        }}
      >
        FluxoRH · versão 1.0.0
      </div>
    </div>
  );
}

// ── History Screen ───────────────────────────────────────────
function EmployeeHistoryScreen({ onBack, onOpenDay }) {
  const [filter, setFilter] = React.useState("todos");

  const days = [
    {
      date: "03/06",
      weekday: "Segunda",
      status: "regular",
      schedule: "08:00-12:00 | 13:00-18:00",
      batidas: [
        { k: "Entrada", t: "08:01" },
        { k: "Saída almoço", t: "12:02" },
        { k: "Retorno", t: "13:01" },
        { k: "Saída", t: "18:04" },
      ],
      extra: "+04min",
      debit: "00min",
      worked: "08h04",
    },
    {
      date: "04/06",
      weekday: "Terça",
      status: "inconsistente",
      schedule: "08:00-12:00 | 13:00-18:00",
      batidas: [
        { k: "Entrada", t: "08:00" },
        { k: "Saída almoço", t: "12:01" },
        { k: "Retorno", t: "pendente" },
        { k: "Saída", t: "18:00" },
      ],
      message: "Existe uma batida pendente neste dia.",
    },
    {
      date: "05/06",
      weekday: "Quarta",
      status: "regular",
      schedule: "08:00-12:00 | 13:00-18:00",
      batidas: [
        { k: "Entrada", t: "08:03" },
        { k: "Saída almoço", t: "12:00" },
        { k: "Retorno", t: "13:02" },
        { k: "Saída", t: "18:15" },
      ],
      extra: "+10min",
      worked: "08h10",
    },
    {
      date: "06/06",
      weekday: "Quinta",
      status: "regular",
      schedule: "08:00-12:00 | 13:00-18:00",
      batidas: [
        { k: "Entrada", t: "07:58" },
        { k: "Saída almoço", t: "12:00" },
        { k: "Retorno", t: "13:00" },
        { k: "Saída", t: "18:02" },
      ],
      worked: "08h04",
    },
    {
      date: "07/06",
      weekday: "Sexta",
      status: "falta",
      message: "Não foram encontradas batidas para este dia.",
    },
    {
      date: "08/06",
      weekday: "Sábado",
      status: "folga",
      message: "Folga programada",
    },
    {
      date: "09/06",
      weekday: "Domingo",
      status: "folga",
      message: "Folga programada",
    },
    {
      date: "10/06",
      weekday: "Segunda",
      status: "regular",
      schedule: "08:00-12:00 | 13:00-18:00",
      batidas: [
        { k: "Entrada", t: "08:02" },
        { k: "Saída almoço", t: "12:01" },
        { k: "Retorno", t: "13:00" },
        { k: "Saída", t: "18:00" },
      ],
      worked: "07h59",
      debit: "01min",
    },
  ];

  const filterMap = {
    todos: () => true,
    regular: (d) => d.status === "regular",
    inconsistente: (d) => d.status === "inconsistente",
    falta: (d) => d.status === "falta",
    folga: (d) => d.status === "folga",
  };

  const filtered = days.filter(filterMap[filter] || (() => true));

  const statusBadge = (s) => {
    const map = {
      regular: { tone: "success", label: "Regular" },
      inconsistente: { tone: "warning", label: "Inconsistente" },
      falta: { tone: "error", label: "Falta" },
      folga: { tone: "primary", label: "Folga" },
      feriado: { tone: "neutral", label: "Feriado" },
    };
    return map[s];
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          zIndex: 5,
          background: "#fff",
          padding: "52px 16px 12px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 8,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0,0,0,0.85)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "rgba(0,0,0,0.85)",
              }}
            >
              Histórico de ponto
            </div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
              Junho de 2024
            </div>
          </div>
        </div>

        {/* filters */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 6,
            marginTop: 12,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {[
            { k: "todos", l: "Todos" },
            { k: "regular", l: "Regulares" },
            { k: "inconsistente", l: "Inconsistentes" },
            { k: "falta", l: "Faltas" },
            { k: "folga", l: "Folgas" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: filter === f.k ? "#007BA4" : "#d9d9d9",
                background: filter === f.k ? "#007BA4" : "#fff",
                color: filter === f.k ? "#fff" : "rgba(0,0,0,0.65)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "12px 16px 104px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {filtered.map((d, i) => {
          const sb = statusBadge(d.status);
          return (
            <button
              key={i}
              onClick={() => onOpenDay(d)}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 14,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(0,0,0,0.45)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {d.weekday}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "rgba(0,0,0,0.85)",
                      lineHeight: 1.2,
                    }}
                  >
                    {d.date}
                  </div>
                </div>
                <MobilePill tone={sb.tone}>{sb.label}</MobilePill>
              </div>

              {d.schedule && (
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  Escala: {d.schedule}
                </div>
              )}

              {d.batidas && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 6,
                  }}
                >
                  {d.batidas.map((b, j) => (
                    <div
                      key={j}
                      style={{
                        background: b.t === "pendente" ? "#fffbe6" : "#fafafa",
                        borderRadius: 6,
                        padding: "6px 4px",
                        textAlign: "center",
                        border:
                          b.t === "pendente"
                            ? "1px dashed #faad14"
                            : "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.45)" }}>
                        {b.k}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            b.t === "pendente" ? "#d48806" : "rgba(0,0,0,0.85)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {b.t}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {d.message && (
                <div
                  style={{
                    fontSize: 13,
                    color:
                      d.status === "falta"
                        ? "#cf1322"
                        : d.status === "inconsistente"
                          ? "#d48806"
                          : "rgba(0,0,0,0.65)",
                  }}
                >
                  {d.status === "folga" ? "🌴 " : ""}
                  {d.message}
                </div>
              )}

              {(d.extra || d.debit || d.worked) && (
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    fontSize: 11,
                    color: "rgba(0,0,0,0.55)",
                    paddingTop: 6,
                    borderTop: "1px dashed #f0f0f0",
                  }}
                >
                  {d.worked && (
                    <span>
                      Trabalhado:{" "}
                      <strong style={{ color: "rgba(0,0,0,0.85)" }}>
                        {d.worked}
                      </strong>
                    </span>
                  )}
                  {d.extra && (
                    <span style={{ color: "#52c41a" }}>
                      Extra: <strong>{d.extra}</strong>
                    </span>
                  )}
                  {d.debit && (
                    <span style={{ color: "#cf1322" }}>
                      Débito: <strong>{d.debit}</strong>
                    </span>
                  )}
                </div>
              )}

              {d.status === "falta" && (
                <div style={{ paddingTop: 4 }}>
                  <span
                    className="btn ghost sm"
                    style={{ height: 26, fontSize: 12 }}
                  >
                    Enviar justificativa
                  </span>
                </div>
              )}
              {d.status === "inconsistente" && (
                <div style={{ paddingTop: 4 }}>
                  <span
                    className="btn ghost sm"
                    style={{ height: 26, fontSize: 12 }}
                  >
                    Solicitar ajuste
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Day Detail Screen ────────────────────────────────────────
function EmployeeDayDetail({ day, onBack }) {
  return (
    <div
      style={{ minHeight: "100%", background: "#f0f2f5", paddingBottom: 40 }}
    >
      <div
        style={{
          background: "#fff",
          padding: "52px 16px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0,0,0,0.85)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
              }}
            >
              {day.weekday}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{day.date}</div>
          </div>
          <MobilePill
            tone={
              day.status === "regular"
                ? "success"
                : day.status === "inconsistente"
                  ? "warning"
                  : day.status === "folga"
                    ? "primary"
                    : "error"
            }
          >
            {day.status === "regular"
              ? "Regular"
              : day.status === "inconsistente"
                ? "Inconsistente"
                : day.status === "folga"
                  ? "Folga"
                  : "Falta"}
          </MobilePill>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {day.schedule && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Jornada esperada
            </div>
            <div style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
              {day.schedule}
            </div>
          </div>
        )}

        {day.batidas && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Batidas realizadas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {day.batidas.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    paddingBottom: 10,
                    borderBottom:
                      i < day.batidas.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      marginTop: 6,
                      background: b.t === "pendente" ? "#faad14" : "#52c41a",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        {b.k}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: b.t === "pendente" ? "#d48806" : "#007BA4",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {b.t}
                      </span>
                    </div>
                    {b.t !== "pendente" && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(0,0,0,0.5)",
                          marginTop: 2,
                        }}
                      >
                        App Mobile · RUA MARTINS DE CARVALDO 4398 · ✓ Validado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {day.message && day.status !== "regular" && (
          <div
            style={{
              background:
                day.status === "folga"
                  ? "#e6f7ff"
                  : day.status === "inconsistente"
                    ? "#fffbe6"
                    : "#fff1f0",
              border:
                "1px solid " +
                (day.status === "folga"
                  ? "#91d5ff"
                  : day.status === "inconsistente"
                    ? "#ffe58f"
                    : "#ffa39e"),
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              color:
                day.status === "folga"
                  ? "#0050b3"
                  : day.status === "inconsistente"
                    ? "#874d00"
                    : "#820014",
            }}
          >
            {day.message}
          </div>
        )}

        {(day.extra || day.debit || day.worked) && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Resumo do dia
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                  Trabalhado
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {day.worked || "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                  Extra
                </div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#52c41a" }}
                >
                  {day.extra || "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                  Débito
                </div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#cf1322" }}
                >
                  {day.debit || "—"}
                </div>
              </div>
            </div>
          </div>
        )}

        {(day.status === "inconsistente" || day.status === "falta") && (
          <button className="btn primary lg" style={{ width: "100%" }}>
            {day.status === "inconsistente"
              ? "Solicitar ajuste"
              : "Enviar justificativa"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Employee App Shell ───────────────────────────────────────
function EmployeeApp({ onExitToLanding }) {
  const [screen, setScreen] = React.useState("login");
  const [confirming, setConfirming] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [openDay, setOpenDay] = React.useState(null);

  // Biometric / facial recognition states
  const [biometricChoiceOpen, setBiometricChoiceOpen] = React.useState(false);
  const [biometricScanning, setBiometricScanning] = React.useState(false);
  const [faceScanning, setFaceScanning] = React.useState(false);
  const [comprovanteOpen, setComprovanteOpen] = React.useState(false);

  const [batidas, setBatidas] = React.useState([
    { label: "Entrada", time: "08:01", status: "done" },
    { label: "Saída almoço", time: "pendente", status: "pending" },
    { label: "Retorno almoço", time: "pendente", status: "pending" },
    { label: "Saída", time: "pendente", status: "pending" },
  ]);

  const nextIdx = batidas.findIndex((b) => b.status === "pending");
  const nextAction =
    nextIdx === -1
      ? "done"
      : nextIdx === 0
        ? "entry"
        : nextIdx === 1
          ? "lunchOut"
          : nextIdx === 2
            ? "lunchIn"
            : "exit";

  const clock = useLiveClock();
  const nextLabelHuman =
    {
      entry: "entrada",
      lunchOut: "saída para almoço",
      lunchIn: "retorno do almoço",
      exit: "saída",
    }[nextAction] || "batida";

  const recordPunch = () => {
    const time = clock.hhmm;
    setBatidas((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((b) => b.status === "pending");
      if (i !== -1) copy[i] = { ...copy[i], time, status: "done" };
      return copy;
    });
    setSuccess(true);
  };

  const handlePunch = () => {
    setBiometricChoiceOpen(true);
  };

  const handleBiometricChoiceCancel = () => {
    setBiometricChoiceOpen(false);
  };

  const handleChooseBiometric = () => {
    setBiometricChoiceOpen(false);
    setBiometricScanning(true);
  };

  const handleChooseFacial = () => {
    setBiometricChoiceOpen(false);
    setFaceScanning(true);
  };

  const handleConfirmManual = () => {
    setBiometricChoiceOpen(false);
    setConfirming(true);
  };

  const handleBiometricSuccess = () => {
    setBiometricScanning(false);
    recordPunch();
  };

  const handleFaceSuccess = () => {
    setFaceScanning(false);
    recordPunch();
  };

  const handleFaceCancel = () => {
    setFaceScanning(false);
  };

  const handleBiometricCancel = () => {
    setBiometricScanning(false);
  };

  return (
    <div
      className="employee-preview-shell"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <button
        className="employee-preview-back"
        onClick={onExitToLanding}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          height: 36,
          padding: "0 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          fontSize: 13,
          backdropFilter: "blur(8px)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </button>
      <div
        className="employee-preview-label"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "rgba(255,255,255,0.45)",
          fontSize: 12,
        }}
      >
        Visão do Funcionário · Mobile
      </div>

      <div className="employee-device-wrap" style={{ position: "relative" }}>
        <IOSDevice className="employee-device" width={402} height={874}>
          <div
            style={{ position: "relative", height: "100%", overflow: "hidden" }}
          >
            {screen === "login" && (
              <EmployeeLoginScreen onLogin={() => setScreen("home")} />
            )}
            {screen === "home" && (
              <EmployeeHomeScreen
                onOpenHistory={() => setScreen("history")}
                onLogout={() => setScreen("login")}
                batidas={batidas}
                nextAction={nextAction}
                onPunch={handlePunch}
              />
            )}
            {screen === "history" && (
              <EmployeeHistoryScreen
                onBack={() => setScreen("home")}
                onOpenDay={(d) => {
                  setOpenDay(d);
                  setScreen("day");
                }}
              />
            )}
            {screen === "requests" && <EmployeeRequestsScreen />}
            {screen === "profile" && (
              <EmployeeProfileScreen onLogout={() => setScreen("login")} />
            )}
            {screen === "day" && openDay && (
              <EmployeeDayDetail
                day={openDay}
                onBack={() => setScreen("history")}
              />
            )}

            {["home", "history", "requests", "profile"].includes(screen) && (
              <BottomTabBar
                active={screen}
                onChange={setScreen}
                badges={{ requests: 2 }}
              />
            )}

            <BiometricChoiceModal
              open={biometricChoiceOpen}
              onCancel={handleBiometricChoiceCancel}
              onChooseBiometric={handleChooseBiometric}
              onChooseFacial={handleChooseFacial}
              onConfirmManual={handleConfirmManual}
            />

            <BiometricScanningModal
              open={biometricScanning}
              onSuccess={handleBiometricSuccess}
              onCancel={handleBiometricCancel}
            />

            <FaceRecognitionModal
              open={faceScanning}
              onSuccess={handleFaceSuccess}
              onCancel={handleFaceCancel}
            />

            <PunchConfirmModal
              open={confirming}
              time={clock.hhmm}
              actionLabel={nextLabelHuman}
              onCancel={() => setConfirming(false)}
              onConfirm={() => {
                setConfirming(false);
                recordPunch();
              }}
            />
            <PunchSuccessModal
              open={success}
              time={clock.hhmm}
              actionLabel={
                nextLabelHuman[0].toUpperCase() + nextLabelHuman.slice(1)
              }
              onClose={() => setSuccess(false)}
              onVerComprovante={() => setComprovanteOpen(true)}
            />
            <ComprovanteModal
              open={comprovanteOpen}
              onClose={() => setComprovanteOpen(false)}
              time={clock.hhmm}
              actionLabel={
                nextLabelHuman[0].toUpperCase() + nextLabelHuman.slice(1)
              }
              employee={EMP_DATA}
              branch={EMP_DATA.branch}
            />
          </div>
        </IOSDevice>
      </div>
    </div>
  );
}

export default EmployeeApp;
