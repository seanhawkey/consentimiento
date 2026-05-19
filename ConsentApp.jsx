import { useState, useRef, useEffect } from "react";

// ─── Consent text ─────────────────────────────────────────────────────────────
const CONSENT = {
  es: {
    label: "Español",
    title: "Permiso para fotos y video",
    body: `Para promover el trabajo de World Renew, a veces tomamos fotografías y video en los proyectos que apoyamos.
Si Ud quiere darnos permiso para tomarle fotos o video:
• Las fotos o el video pueden ser publicados para promover nuestro trabajo.
• No hay pago por esto.
• Puede hacer preguntas si quiere`,
    agree: "He leído esto, lo entiendo y doy mi permiso.",
  },
  en: {
    label: "English",
    title: "Photo & Video Permission",
    body: `To promote the work of World Renew, we sometimes take photographs and video in the projects we support.
If you'd like to give permission for us to take photos or video of you:
• Photos or video may be published to promote our work.
• There's no payment for this.
• You can ask questions if you'd like.`,
    agree: "I've read this, I understand it, and I give my permission.",
  },
  fr: {
    label: "Français",
    title: "Permission photos et vidéo",
    body: `Pour promouvoir le travail de World Renew, nous prenons parfois des photos et des vidéos dans les projets que nous soutenons.
Si vous souhaitez nous donner la permission de vous photographier ou filmer :
• Les photos ou vidéos peuvent être publiées pour promouvoir notre travail.
• Il n'y a pas de paiement pour cela.
• Vous pouvez poser des questions si vous le souhaitez.`,
    agree: "J'ai lu ceci, je le comprends et je donne ma permission.",
  },
  ar: {
    label: "العربية",
    title: "إذن التصوير والفيديو",
    body: `لتعزيز عمل World Renew، نأخذ أحياناً صوراً ومقاطع فيديو في المشاريع التي ندعمها.
إذا كنت تريد منحنا إذناً لتصويرك:
• قد يتم نشر الصور أو الفيديو للترويج لعملنا.
• لا يوجد دفع لهذا.
• يمكنك طرح الأسئلة إذا أردت.`,
    agree: "قرأت هذا وفهمته وأعطي إذني.",
  },
};

// ─── Print record ─────────────────────────────────────────────────────────────
function printRecord({ lang, fullName, guardianName, isMinor, photo, sigData, photographer, project, location, timestamp }) {
  const c = CONSENT[lang];
  const dateStr = timestamp.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = timestamp.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Permiso — ${fullName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;font-size:13px;color:#0f172a;background:#fff;padding:48px;max-width:800px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #0f172a}
  .brand{font-family:'DM Serif Display',serif;font-size:26px}
  .brand span{color:#3b82f6}
  .meta{text-align:right;font-size:11px;color:#64748b;line-height:1.8}
  .subject-row{display:flex;gap:24px;align-items:flex-start;margin-bottom:24px;padding:18px;background:#f8fafc;border-radius:10px}
  .subject-photo{width:110px;height:110px;object-fit:cover;border-radius:8px;border:2px solid #e2e8f0;flex-shrink:0}
  .subject-photo-placeholder{width:110px;height:110px;border-radius:8px;border:2px dashed #e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:11px;text-align:center;flex-shrink:0;padding:8px}
  .field-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:2px}
  .field-value{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:10px}
  .consent-box{background:#eff6ff;border-left:4px solid #3b82f6;padding:18px 22px;border-radius:0 10px 10px 0;margin-bottom:20px}
  .consent-title{font-family:'DM Serif Display',serif;font-size:17px;margin-bottom:10px;color:#1e3a5f}
  .consent-body{font-size:12px;line-height:1.9;color:#334155;white-space:pre-wrap}
  .agree-box{display:flex;gap:10px;align-items:flex-start;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px}
  .checkmark{color:#16a34a;font-size:18px;flex-shrink:0}
  .agree-text{font-size:13px;color:#15803d;font-style:italic;line-height:1.5}
  .sig-row{display:flex;gap:28px;align-items:flex-end;margin-bottom:24px}
  .sig-block{flex:1}
  .sig-img{border-bottom:1.5px solid #0f172a;padding-bottom:4px;min-height:65px}
  .sig-img img{height:65px;max-width:100%}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;line-height:1.6}
  @media print{body{padding:24px}.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">Permiso<span>.</span></div>
    <div style="font-size:11px;color:#64748b;margin-top:3px;letter-spacing:1px;text-transform:uppercase">Registro de permiso fotográfico — World Renew</div>
  </div>
  <div class="meta">${dateStr}<br/>${timeStr}<br/>${photographer ? `<strong>${photographer}</strong>` : ""}</div>
</div>

<div class="subject-row">
  ${photo ? `<img class="subject-photo" src="${photo}" alt="Foto del sujeto"/>` : `<div class="subject-photo-placeholder">Sin foto</div>`}
  <div style="flex:1">
    <div class="field-label">${isMinor ? "Nombre del menor" : "Nombre"}</div>
    <div class="field-value">${fullName}</div>
    ${isMinor ? `<div class="field-label">Padre / Tutor</div><div class="field-value">${guardianName}</div>` : ""}
    ${project ? `<div class="field-label">Proyecto</div><div class="field-value">${project}</div>` : ""}
    ${location ? `<div class="field-label">Lugar</div><div class="field-value">${location}</div>` : ""}
  </div>
</div>

<div class="consent-box">
  <div class="consent-title">${c.title}</div>
  <div class="consent-body">${c.body}</div>
</div>

<div class="agree-box">
  <div class="checkmark">✓</div>
  <div class="agree-text">${c.agree}</div>
</div>

<div class="sig-row">
  <div class="sig-block">
    <div class="field-label">Firma — ${fullName}</div>
    <div class="sig-img">${sigData ? `<img src="${sigData}"/>` : ""}</div>
  </div>
  <div class="sig-block">
    <div class="field-label">Fecha</div>
    <div style="font-size:14px;font-weight:700">${dateStr}</div>
    <div style="color:#64748b;font-size:11px;margin-top:2px">${timeStr}</div>
  </div>
</div>

<div class="no-print" style="text-align:center;margin:20px 0">
  <button onclick="window.print()" style="background:#0f172a;color:#fff;border:none;padding:11px 32px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit">
    🖨 Imprimir / Guardar como PDF
  </button>
  <p style="font-size:11px;color:#94a3b8;margin-top:8px">Imprimir → "Guardar como PDF" → adjuntar al correo</p>
</div>

<div class="footer">
  Este documento es un registro de permiso dado voluntariamente. Guárdelo de forma segura. ID: ${fullName.replace(/\s+/g,"-").toLowerCase()}-${timestamp.getTime()}
</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ onSigned, resetKey }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onSigned(null);
  }, [resetKey]);

  const pos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (canvas.width / r.width), y: (src.clientY - r.top) * (canvas.height / r.height) };
  };

  const start = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e, canvasRef.current); };
  const move = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = pos(e, canvas);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.8; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    last.current = p; setHasStrokes(true); onSigned(canvas.toDataURL());
  };
  const end = (e) => { e.preventDefault(); drawing.current = false; };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} width={640} height={140}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{ width: "100%", height: 110, background: "#f8fafc", borderRadius: 8,
          border: "1.5px solid #e2e8f0", cursor: "crosshair", touchAction: "none", display: "block" }} />
      {!hasStrokes && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", pointerEvents: "none", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>
          Firme aquí
        </div>
      )}
    </div>
  );
}

// ─── Camera ───────────────────────────────────────────────────────────────────
function CameraCapture({ onCapture, photo }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const startCamera = async (facing = facingMode) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true); setErr(null);
    } catch {
      setErr("No se pudo acceder a la cámara. Por favor permita el acceso e intente de nuevo.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null; setActive(false);
  };

  const snap = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.92));
    stopCamera();
  };

  const flip = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next); startCamera(next);
  };

  useEffect(() => () => stopCamera(), []);

  if (photo) return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
      <img src={photo} alt="Foto" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
      <button onClick={() => onCapture(null)} style={{
        position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)",
        color: "#fff", border: "none", borderRadius: 16, padding: "5px 12px",
        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
      }}>Repetir</button>
    </div>
  );

  if (active) return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "#000" }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14 }}>
        <button onClick={flip} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: 44, height: 44, fontSize: 18, cursor: "pointer" }}>⇄</button>
        <button onClick={snap} style={{ background: "#fff", border: "4px solid rgba(255,255,255,0.5)", borderRadius: "50%", width: 60, height: 60, cursor: "pointer", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)" }} />
        <button onClick={stopCamera} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: 44, height: 44, fontSize: 16, cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );

  return (
    <div>
      <button onClick={() => startCamera()} style={{
        width: "100%", padding: "18px 0", border: "2px dashed #cbd5e1", borderRadius: 8,
        background: "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6, color: "#64748b", fontFamily: "inherit",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
      >
        <span style={{ fontSize: 28 }}>📷</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Tomar foto del sujeto</span>
      </button>
      {err && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{err}</p>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("es");
  const [photographer, setPhotographer] = useState("Sean Hawkey");
  const [project, setProject] = useState("Mundo Renovado Guatemala");
  const [location, setLocation] = useState("Guatemala");
  const [fullName, setFullName] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [checked, setChecked] = useState(false);
  const [sigData, setSigData] = useState(null);
  const [sigReset, setSigReset] = useState(0);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const c = CONSENT[lang];

  const reset = () => {
    setLang("es"); setPhotographer("Sean Hawkey"); setProject("Mundo Renovado Guatemala");
    setLocation("Guatemala"); setFullName(""); setIsMinor(false); setGuardianName("");
    setPhoto(null); setChecked(false); setSigData(null); setSigReset(r => r + 1);
    setErrors({}); setDone(false);
  };

  const handleSubmit = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Por favor ingrese el nombre completo";
    if (isMinor && !guardianName.trim()) e.guardianName = "Por favor ingrese el nombre del tutor";
    if (!photo) e.photo = "Se requiere una foto para identificar al sujeto";
    if (!checked) e.checked = "Por favor marque la casilla para confirmar";
    if (!sigData) e.sig = "Por favor firme para confirmar";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const ts = new Date();
    setDone(true);
    setTimeout(() => printRecord({ lang, fullName, guardianName, isMinor, photo, sigData, photographer, project, location, timestamp: ts }), 300);
  };

  const lbl = (txt, req) => (
    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.8px", color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>
      {txt}{req && <span style={{ color: "#ef4444" }}> *</span>}
    </div>
  );

  const inp = (value, onChange, placeholder, err) => (
    <>
      <input value={value} onChange={onChange} placeholder={placeholder} style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, boxSizing: "border-box",
        border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`, background: err ? "#fff5f5" : "#f8fafc",
        fontSize: 14, color: "#0f172a", fontFamily: "inherit", outline: "none",
      }}
        onFocus={e => e.target.style.borderColor = "#3b82f6"}
        onBlur={e => e.target.style.borderColor = err ? "#fca5a5" : "#e2e8f0"}
      />
      {err && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 3 }}>{err}</div>}
    </>
  );

  const divider = <div style={{ height: 1, background: "#f1f5f9", margin: "18px 0" }} />;

  if (done) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#f0fdf4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #86efac", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>✓</div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: "#0f172a", marginBottom: 8 }}>¡Permiso registrado!</div>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          El registro se ha abierto en una nueva pestaña.<br />
          Use <strong>Imprimir → Guardar como PDF</strong><br />para guardarlo y enviarlo por correo.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => printRecord({ lang, fullName, guardianName, isMinor, photo, sigData, photographer, project, location, timestamp: new Date() })}
            style={{ padding: "12px 0", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#334155" }}>
            🖨 Abrir registro de nuevo
          </button>
          <button onClick={reset} style={{ padding: "13px 0", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Nuevo permiso →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#f0fdf4)", padding: "24px 16px 48px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#0f172a" }}>
            Permiso<span style={{ color: "#3b82f6" }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>World Renew</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)", padding: "24px 20px" }}>

          {/* Idioma */}
          <div style={{ marginBottom: 4 }}>
            {lbl("Idioma / Language")}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(CONSENT).map(([k, v]) => (
                <button key={k} onClick={() => setLang(k)} style={{
                  padding: "5px 13px", borderRadius: 20, border: "1.5px solid",
                  borderColor: lang === k ? "#3b82f6" : "#e2e8f0",
                  background: lang === k ? "#eff6ff" : "#f8fafc",
                  color: lang === k ? "#1d4ed8" : "#64748b",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: lang === k ? 700 : 400,
                }}>{v.label}</button>
              ))}
            </div>
          </div>

          {divider}

          {/* Detalles de sesión */}
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a", marginBottom: 12 }}>Detalles de la sesión</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                {lbl("Fotógrafo / Organización")}
                {inp(photographer, e => setPhotographer(e.target.value), "Nombre")}
              </div>
              <div>
                {lbl("Proyecto")}
                {inp(project, e => setProject(e.target.value), "Nombre del proyecto")}
              </div>
            </div>
            {lbl("Lugar")}
            {inp(location, e => setLocation(e.target.value), "Lugar / Ciudad")}
          </div>

          {divider}

          {/* Texto de permiso */}
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a", marginBottom: 10 }}>{c.title}</div>
            <div style={{ background: "#eff6ff", borderLeft: "3px solid #3b82f6", borderRadius: "0 8px 8px 0", padding: "14px 16px", fontSize: 13, lineHeight: 1.85, color: "#334155", whiteSpace: "pre-wrap" }}>
              {c.body}
            </div>
          </div>

          {divider}

          {/* Foto */}
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a", marginBottom: 10 }}>
              Foto del sujeto <span style={{ color: "#ef4444", fontSize: 13 }}>*</span>
            </div>
            <CameraCapture photo={photo} onCapture={(p) => { setPhoto(p); setErrors(v => ({ ...v, photo: null })); }} />
            {errors.photo && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.photo}</div>}
          </div>

          {divider}

          {/* Datos del sujeto */}
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a", marginBottom: 10 }}>Datos del sujeto</div>
            <div style={{ marginBottom: 10 }}>
              {lbl("Nombre completo", true)}
              {inp(fullName, e => { setFullName(e.target.value); setErrors(v => ({ ...v, fullName: null })); }, "Nombre y apellido", errors.fullName)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1.5px solid #e2e8f0", cursor: "pointer", marginBottom: isMinor ? 10 : 0 }}
              onClick={() => setIsMinor(v => !v)}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isMinor ? "#3b82f6" : "#cbd5e1"}`, background: isMinor ? "#3b82f6" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isMinor && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: "#334155" }}>El sujeto es menor de 18 años (firmará el padre/tutor)</span>
            </div>
            {isMinor && (
              <div>
                {lbl("Nombre del padre / tutor", true)}
                {inp(guardianName, e => { setGuardianName(e.target.value); setErrors(v => ({ ...v, guardianName: null })); }, "Nombre completo del tutor", errors.guardianName)}
              </div>
            )}
          </div>

          {divider}

          {/* Acuerdo */}
          <div>
            <div onClick={() => { setChecked(v => !v); setErrors(v => ({ ...v, checked: null })); }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", background: checked ? "#f0fdf4" : errors.checked ? "#fff5f5" : "#f8fafc", border: `1.5px solid ${checked ? "#86efac" : errors.checked ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? "#16a34a" : "#cbd5e1"}`, background: checked ? "#16a34a" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{c.agree}</div>
            </div>
            {errors.checked && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.checked}</div>}
          </div>

          {divider}

          {/* Firma */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a" }}>
                Firma <span style={{ color: "#ef4444", fontSize: 13 }}>*</span>
              </div>
              <button onClick={() => { setSigReset(r => r + 1); setSigData(null); }}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
                Borrar firma
              </button>
            </div>
            <SignaturePad onSigned={d => { setSigData(d); setErrors(v => ({ ...v, sig: null })); }} resetKey={sigReset} />
            {errors.sig && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.sig}</div>}
          </div>

          {/* Botón */}
          <div style={{ marginTop: 22 }}>
            <button onClick={handleSubmit} style={{
              width: "100%", padding: "15px 0", background: "#0f172a", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e3a5f"}
              onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
            >
              Confirmar y abrir registro →
            </button>
          </div>

        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 10, color: "#cbd5e1" }}>
          Los datos no se guardan en línea · Todo permanece en su dispositivo
        </div>
      </div>
    </div>
  );
}
