import { useState, useRef, useEffect, useCallback } from "react";

// ─── Consent text ─────────────────────────────────────────────────────────────
const CONSENT = {
  es: {
    label: "Español",
    title: "Permiso para fotos y video",
    body: [
      "Para promover el trabajo de World Renew, a veces tomamos fotografías y video en los proyectos que apoyamos.",
      "Si Ud quiere darnos permiso para tomarle fotos o video:",
      "• Las fotos o el video pueden ser publicados para promover nuestro trabajo.",
      "• No hay pago por esto.",
      "• Puede hacer preguntas si quiere",
    ],
    agree: "He leído esto, lo entiendo y doy mi permiso.",
  },
  en: {
    label: "English",
    title: "Photo & Video Permission",
    body: [
      "To promote the work of World Renew, we sometimes take photographs and video in the projects we support.",
      "If you'd like to give permission for us to take photos or video of you:",
      "• Photos or video may be published to promote our work.",
      "• There's no payment for this.",
      "• You can ask questions if you'd like.",
    ],
    agree: "I've read this, I understand it, and I give my permission.",
  },
  fr: {
    label: "Français",
    title: "Permission photos et vidéo",
    body: [
      "Pour promouvoir le travail de World Renew, nous prenons parfois des photos et des vidéos dans les projets que nous soutenons.",
      "Si vous souhaitez nous donner la permission de vous photographier ou filmer :",
      "• Les photos ou vidéos peuvent être publiées pour promouvoir notre travail.",
      "• Il n'y a pas de paiement pour cela.",
      "• Vous pouvez poser des questions si vous le souhaitez.",
    ],
    agree: "J'ai lu ceci, je le comprends et je donne ma permission.",
  },
  ar: {
    label: "العربية",
    title: "إذن التصوير والفيديو",
    body: [
      "لتعزيز عمل World Renew، نأخذ أحياناً صوراً ومقاطع فيديو في المشاريع التي ندعمها.",
      "إذا كنت تريد منحنا إذناً لتصويرك:",
      "• قد يتم نشر الصور أو الفيديو للترويج لعملنا.",
      "• لا يوجد دفع لهذا.",
      "• يمكنك طرح الأسئلة إذا أردت.",
    ],
    agree: "قرأت هذا وفهمته وأعطي إذني.",
  },
};

// ─── Load jsPDF from CDN ──────────────────────────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Generate PDF blob ────────────────────────────────────────────────────────
async function generatePDFBlob({ lang, fullName, guardianName, isMinor, photo, sigData, photographer, project, location, timestamp }) {
  const JsPDF = await loadJsPDF();
  const c = CONSENT[lang];
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const W = 210; // A4 width mm
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 18;

  // Colours
  const navy = [15, 23, 42];
  const blue = [59, 130, 246];
  const slate = [100, 116, 139];
  const lightBlue = [239, 246, 255];
  const green = [22, 163, 74];
  const lightGreen = [240, 253, 244];
  const lightSlate = [248, 250, 252];
  const border = [226, 232, 240];

  // ── Header ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...navy);
  doc.text("Permiso.", margin, y);
  // blue dot
  const titleW = doc.getTextWidth("Permiso");
  doc.setTextColor(...blue);
  doc.text(".", margin + titleW, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  const dateStr = timestamp.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = timestamp.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
  doc.text(`${dateStr}  ${timeStr}`, W - margin, y - 6, { align: "right" });
  if (photographer) {
    doc.setFont("helvetica", "bold");
    doc.text(photographer, W - margin, y - 1, { align: "right" });
  }

  y += 4;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 8;

  // ── Subject row ──
  const rowH = 34;
  doc.setFillColor(...lightSlate);
  doc.roundedRect(margin, y, contentW, rowH, 3, 3, "F");

  // Photo
  if (photo) {
    try {
      doc.addImage(photo, "JPEG", margin + 3, y + 3, 28, 28, undefined, "MEDIUM");
    } catch {}
  } else {
    doc.setFillColor(...border);
    doc.roundedRect(margin + 3, y + 3, 28, 28, 2, 2, "F");
  }

  const infoX = margin + 35;
  let iy = y + 8;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text(isMinor ? "NOMBRE DEL MENOR" : "NOMBRE", infoX, iy);
  iy += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text(fullName, infoX, iy);
  iy += 5;

  if (isMinor && guardianName) {
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
    doc.text("PADRE / TUTOR", infoX, iy); iy += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...navy);
    doc.text(guardianName, infoX, iy); iy += 5;
  }

  // Right side: project + location
  const col2X = margin + contentW / 2 + 10;
  let cy = y + 8;
  if (project) {
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
    doc.text("ORGANIZACIÓN", col2X, cy); cy += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...navy);
    const projLines = doc.splitTextToSize(project, contentW / 2 - 12);
    doc.text(projLines, col2X, cy); cy += projLines.length * 4 + 2;
  }
  if (location) {
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
    doc.text("LUGAR", col2X, cy); cy += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...navy);
    doc.text(location, col2X, cy);
  }

  y += rowH + 7;

  // ── Consent box ──
  const bodyText = c.body.join("\n");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...[51, 65, 85]);
  const bodyLines = doc.splitTextToSize(bodyText, contentW - 14);
  const boxH = bodyLines.length * 5 + 16;
  doc.setFillColor(...lightBlue);
  doc.roundedRect(margin, y, contentW, boxH, 3, 3, "F");
  doc.setFillColor(...blue);
  doc.rect(margin, y, 3, boxH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 95);
  doc.text(c.title, margin + 7, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...[51, 65, 85]);
  doc.text(bodyLines, margin + 7, y + 15);
  y += boxH + 6;

  // ── Agreement tick ──
  const agreeLines = doc.splitTextToSize(c.agree, contentW - 16);
  const agreeH = agreeLines.length * 5 + 12;
  doc.setFillColor(...lightGreen);
  doc.roundedRect(margin, y, contentW, agreeH, 3, 3, "F");
  doc.setTextColor(...green);
  doc.setFontSize(13);
  doc.text("✓", margin + 4, y + agreeH / 2 + 2);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(9.5);
  doc.text(agreeLines, margin + 12, y + 8);
  y += agreeH + 8;

  // ── Signature ──
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...lightSlate);
  doc.roundedRect(margin, y, contentW * 0.6, 28, 2, 2, "F");
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
  doc.text("FIRMA — " + fullName.toUpperCase(), margin + 4, y + 6);
  if (sigData) {
    try {
      doc.addImage(sigData, "PNG", margin + 4, y + 9, 80, 16, undefined, "MEDIUM");
    } catch {}
  }
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.4);
  doc.line(margin + 4, y + 26, margin + contentW * 0.6 - 4, y + 26);

  // Date block
  const dateX = margin + contentW * 0.65;
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
  doc.text("FECHA", dateX, y + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...navy);
  doc.text(dateStr, dateX, y + 15);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...slate);
  doc.text(timeStr, dateX, y + 21);
  y += 36;

  // ── Footer ──
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  const refId = `${fullName.replace(/\s+/g, "-").toLowerCase()}-${timestamp.getTime()}`;
  doc.text("Registro de permiso dado voluntariamente. World Renew. ID: " + refId, margin, y);

  return doc.output("blob");
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
        style={{ width: "100%", height: 110, background: "#f8fafc", borderRadius: 8, border: "1.5px solid #e2e8f0", cursor: "crosshair", touchAction: "none", display: "block" }} />
      {!hasStrokes && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } } });
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

  const flip = () => { const next = facingMode === "user" ? "environment" : "user"; setFacingMode(next); startCamera(next); };
  useEffect(() => () => stopCamera(), []);

  if (photo) return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
      <img src={photo} alt="Foto" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
      <button onClick={() => onCapture(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 16, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Repetir</button>
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
      <button onClick={() => startCamera()} style={{ width: "100%", padding: "18px 0", border: "2px dashed #cbd5e1", borderRadius: 8, background: "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#64748b", fontFamily: "inherit" }}
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

// ─── Done screen ──────────────────────────────────────────────────────────────
function DoneScreen({ pdfBlob, filename, onReset }) {
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canShare = !!navigator.share && !!navigator.canShare;

  const download = () => {
    setDownloading(true);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => { URL.revokeObjectURL(url); setDownloading(false); }, 1000);
  };

  const share = async () => {
    setSharing(true);
    try {
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Permiso fotográfico — World Renew" });
      } else {
        // Fallback: download if share not supported
        download();
      }
    } catch (e) {
      if (e.name !== "AbortError") download();
    }
    setSharing(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#f0fdf4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>

        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #86efac", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>✓</div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: "#0f172a", marginBottom: 8 }}>¡Permiso registrado!</div>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          El PDF está listo. Descárguelo o compártalo<br />directamente por correo, WhatsApp, etc.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>

          {/* Share button — primary on mobile */}
          <button onClick={share} disabled={sharing} style={{
            padding: "16px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: sharing ? 0.7 : 1,
          }}>
            <span style={{ fontSize: 18 }}>↑</span>
            {sharing ? "Compartiendo..." : "Compartir PDF"}
          </button>

          {/* Download button */}
          <button onClick={download} disabled={downloading} style={{
            padding: "14px 0", background: "#fff", color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: downloading ? 0.7 : 1,
          }}>
            <span style={{ fontSize: 16 }}>⬇</span>
            {downloading ? "Descargando..." : "Descargar PDF"}
          </button>

          {/* New consent */}
          <button onClick={onReset} style={{
            padding: "13px 0", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Nuevo permiso →
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
          El PDF se guarda en su dispositivo.<br />
          "Compartir" abre su app de correo, WhatsApp, Drive, etc.
        </p>
      </div>
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
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [generating, setGenerating] = useState(false);

  const c = CONSENT[lang];

  const reset = () => {
    setLang("es"); setPhotographer("Sean Hawkey"); setProject("Mundo Renovado Guatemala");
    setLocation("Guatemala"); setFullName(""); setIsMinor(false); setGuardianName("");
    setPhoto(null); setChecked(false); setSigData(null); setSigReset(r => r + 1);
    setErrors({}); setPdfBlob(null); setPdfFilename(""); setGenerating(false);
  };

  const handleSubmit = async () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Por favor ingrese el nombre completo";
    if (isMinor && !guardianName.trim()) e.guardianName = "Por favor ingrese el nombre del tutor";
    if (!photo) e.photo = "Se requiere una foto para identificar al sujeto";
    if (!checked) e.checked = "Por favor marque la casilla para confirmar";
    if (!sigData) e.sig = "Por favor firme para confirmar";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setGenerating(true);
    try {
      const ts = new Date();
      const blob = await generatePDFBlob({ lang, fullName, guardianName, isMinor, photo, sigData, photographer, project, location, timestamp: ts });
      const safeName = fullName.replace(/\s+/g, "-").toLowerCase();
      const dateTag = ts.toISOString().slice(0, 10);
      setPdfFilename(`permiso-${safeName}-${dateTag}.pdf`);
      setPdfBlob(blob);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Hubo un error al generar el PDF. Por favor intente de nuevo.");
    }
    setGenerating(false);
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

  if (pdfBlob) return <DoneScreen pdfBlob={pdfBlob} filename={pdfFilename} onReset={reset} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#f0fdf4)", padding: "24px 16px 48px", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

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
                {lbl("Fotógrafo")}
                {inp(photographer, e => setPhotographer(e.target.value), "Nombre")}
              </div>
              <div>
                {lbl("Organización")}
                {inp(project, e => setProject(e.target.value), "Nombre de la organización")}
              </div>
            </div>
            {lbl("Lugar")}
            {inp(location, e => setLocation(e.target.value), "Lugar / Ciudad")}
          </div>

          {divider}

          {/* Texto de permiso */}
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: "#0f172a", marginBottom: 10 }}>{c.title}</div>
            <div style={{ background: "#eff6ff", borderLeft: "3px solid #3b82f6", borderRadius: "0 8px 8px 0", padding: "14px 16px", fontSize: 13, lineHeight: 1.85, color: "#334155" }}>
              {c.body.map((line, i) => <div key={i}>{line}</div>)}
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
              <div style={{ marginTop: 10 }}>
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

          {/* Submit */}
          <div style={{ marginTop: 22 }}>
            <button onClick={handleSubmit} disabled={generating} style={{
              width: "100%", padding: "15px 0", background: generating ? "#94a3b8" : "#0f172a", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {generating ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Generando PDF...
                </>
              ) : "Confirmar y generar PDF →"}
            </button>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 10, color: "#cbd5e1" }}>
          Los datos no se guardan en línea · Todo permanece en su dispositivo
        </div>
      </div>
    </div>
  );
}
