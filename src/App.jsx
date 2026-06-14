import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EAF3DE", text: "#27500A" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#FBEAF0", text: "#72243E" },
];

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200.06 408.506" width="100%" style="display:block;">
  <defs>
    <linearGradient id="elg" x1="0.243" y1="1.304" x2="0.76" y2="-0.316" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#29abe2"/>
      <stop offset="0.11" stop-color="#379de3"/>
      <stop offset="0.518" stop-color="#6a6de8"/>
      <stop offset="0.828" stop-color="#8950ea"/>
      <stop offset="1" stop-color="#9545ec"/>
    </linearGradient>
  </defs>
  <g transform="translate(0 229.649)">
    <g transform="translate(0 0)">
      <path d="M787.131-36.232H900.408v19.18h-91.76V38.678h89.94V57.858h-89.94v59.617h91.76v19.181H787.131Z" transform="translate(-787.131 39.089)" fill="#2d2d38"/>
      <path d="M806.423-36.232h21.526V117.475h80.344v19.181H806.423Z" transform="translate(-669.325 39.089)" fill="#2d2d38"/>
      <path d="M823.565-36.232H936.842v19.18H845.09V38.678h89.934V57.858H845.09v59.617h91.752v19.181H823.565Z" transform="translate(-564.648 39.089)" fill="#2d2d38"/>
      <path d="M841.87,52.794c0-53.135,39.158-89.428,88.15-89.428,31.353,0,52.61,14.774,66.354,34.211L978.229,7.7a58.693,58.693,0,0,0-48.21-25.15c-37.073,0-65.849,29.03-65.849,70.248,0,40.955,28.776,70.248,65.849,70.248,20.461,0,38.362-10.376,48.21-25.15l18.392,10.12c-14.5,19.692-35.248,34.211-66.6,34.211C881.027,142.223,841.87,105.93,841.87,52.794Z" transform="translate(-452.868 36.634)" fill="#2d2d38"/>
      <path d="M919.056-17.052H864.373v-19.18H995.531v19.18H940.582V136.655H919.056Z" transform="translate(-315.455 39.089)" fill="#2d2d38"/>
      <path d="M941.372,67.964H906.906v68.692H885.38V-36.232h69.473c31.623,0,54.173,20.218,54.173,52.091,0,31.112-21.264,48.225-44.835,50.293l46.654,70.5H985.433Zm10.88-85.015H906.906V49.039h45.346c20.482,0,34.488-13.73,34.488-33.18S972.734-17.052,952.252-17.052Z" transform="translate(-187.177 39.089)" fill="#2d2d38"/>
      <path d="M906.1-36.232h21.526V69c0,31.624,17.1,51.586,48.985,51.586,31.872,0,48.992-19.962,48.992-51.586V-36.232h21.5v105.5c0,43.03-23.586,70.5-70.5,70.5S906.1,112.031,906.1,69.52Z" transform="translate(-60.675 39.089)" fill="#2d2d38"/>
      <path d="M1077.91-7.2l-58.835,143.857h-8.81L951.692-7.2V136.655H930.167V-36.232H961.01l53.661,131.67,53.923-131.67h30.842V136.655H1077.91Z" transform="translate(86.313 39.089)" fill="#2d2d38"/>
    </g>
  </g>
  <path d="M1390.819-52.889a9.7,9.7,0,0,1,6.895,2.857l70.58,70.582a9.757,9.757,0,0,1,0,13.786l-75.448,75.457a9.747,9.747,0,0,1-13.788,0L1308.469,39.2a9.756,9.756,0,0,1,0-13.787l75.457-75.45a9.681,9.681,0,0,1,6.892-2.857M1195.427-35.578a5.2,5.2,0,0,1,3.695,1.528l58.224,58.224a5.216,5.216,0,0,1,0,7.391L1195.115,93.8a5.223,5.223,0,0,1-7.4,0L1129.493,35.58a5.243,5.243,0,0,1,0-7.391l62.238-62.239a5.226,5.226,0,0,1,3.7-1.528M1036.847-16.22a5.187,5.187,0,0,1,3.695,1.535l40.87,40.87a5.23,5.23,0,0,1,0,7.391l-40.87,40.87a5.232,5.232,0,0,1-7.39,0l-40.87-40.87a5.228,5.228,0,0,1,0-7.391l40.87-40.87a5.186,5.186,0,0,1,3.695-1.535M916.4-1.452A5.226,5.226,0,0,1,920.1.075l26.1,26.109a5.234,5.234,0,0,1,0,7.391l-26.1,26.1a5.224,5.224,0,0,1-7.4,0l-26.1-26.1a5.227,5.227,0,0,1,0-7.391L912.7.075a5.224,5.224,0,0,1,3.7-1.528m474.42-67.5a25.725,25.725,0,0,0-18.249,7.561l-75.457,75.45a25.812,25.812,0,0,0,0,36.5l70.589,70.589a25.82,25.82,0,0,0,36.5,0l75.45-75.457a25.8,25.8,0,0,0,0-36.5l-70.58-70.582a25.742,25.742,0,0,0-18.251-7.561ZM1195.427-51.638a21.247,21.247,0,0,0-15.05,6.232l-62.233,62.239a21.286,21.286,0,0,0,0,30.1l58.217,58.224a21.292,21.292,0,0,0,30.1,0L1268.7,42.921a21.286,21.286,0,0,0,0-30.1l-58.223-58.224a21.23,21.23,0,0,0-15.053-6.232ZM1036.847-32.28a21.217,21.217,0,0,0-15.052,6.239l-40.87,40.87a21.284,21.284,0,0,0,0,30.1l40.87,40.87a21.291,21.291,0,0,0,30.1,0l40.868-40.87a21.281,21.281,0,0,0,0-30.1L1051.9-26.041a21.229,21.229,0,0,0-15.051-6.239ZM916.4-17.513a21.25,21.25,0,0,0-15.051,6.232l-26.1,26.109a21.281,21.281,0,0,0,0,30.1l26.1,26.1a21.29,21.29,0,0,0,30.1,0l26.109-26.1a21.3,21.3,0,0,0,0-30.1L931.45-11.281A21.227,21.227,0,0,0,916.4-17.513Z" transform="translate(-287.154 68.95)" fill="url(#elg)"/>
</svg>`;

const CLAUDE_SYSTEM = `You are a helpful assistant for a manager preparing for 1:1 meetings with direct reports. Be concise and direct. When asked to suggest agenda items or to-dos, you MUST respond with ONLY a raw JSON object and nothing else - no markdown backticks, no explanation, no preamble, no text before or after: {"agenda": ["item 1", "item 2"], "todos": ["todo 1", "todo 2"]}. For other questions, respond in plain text.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = name => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

async function callClaude(userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: CLAUDE_SYSTEM, messages: [{ role: "user", content: userMessage }] })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = {
  app: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 14, color: "#2d2d38", background: "#fff" },
  sidebar: { borderRight: "1px solid #e8e8f0", background: "#fafafe", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  sidebarHeader: { padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e8f0" },
  sidebarLabel: { fontSize: 11, fontWeight: 600, color: "#8888aa", letterSpacing: "0.06em", textTransform: "uppercase" },
  personList: { flex: 1, overflowY: "auto", padding: 8 },
  personRow: active => ({ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: active ? "#fff" : "transparent", border: active ? "1px solid #e8e8f0" : "1px solid transparent" }),
  avatar: c => ({ width: 32, height: 32, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }),
  avatarLg: c => ({ width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }),
  main: { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  mainHeader: { padding: "18px 32px 14px", borderBottom: "1px solid #e8e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px 6px", borderRadius: 6, display: "flex", alignItems: "center" },
  btn: { fontSize: 13, padding: "6px 14px", border: "1px solid #e8e8f0", borderRadius: 7, background: "none", cursor: "pointer", color: "#2d2d38", display: "flex", alignItems: "center", gap: 6 },
  btnPrimary: { fontSize: 13, padding: "6px 14px", border: "none", borderRadius: 7, background: "linear-gradient(135deg, #29abe2 0%, #6a6de8 50%, #9545ec 100%)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { fontSize: 13, padding: "6px 10px", border: "none", borderRadius: 7, background: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 6 },
  btnAccent: { fontSize: 13, padding: "6px 14px", border: "none", borderRadius: 7, background: "linear-gradient(135deg, #6a6de8 0%, #9545ec 100%)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #e8e8f0", borderRadius: 8, fontSize: 14, background: "#fff", color: "#2d2d38", outline: "none", boxSizing: "border-box", fontFamily: "system-ui,-apple-system,sans-serif" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#aaa", fontSize: 14 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#8888aa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 },
  tab: active => ({ fontSize: 13, padding: "10px 14px", border: "none", borderBottom: active ? "2px solid #6a6de8" : "2px solid transparent", background: "none", cursor: "pointer", color: active ? "#2d2d38" : "#888", fontWeight: active ? 500 : 400 }),
  badge: { background: "#6a6de8", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px", marginLeft: 4 },
  meetingRow: { display: "grid", gridTemplateColumns: "110px 1fr 20px", alignItems: "center", gap: 20, padding: "14px 0", borderBottom: "1px solid #f0f0f8", cursor: "pointer" },
  todoRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f4fa" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  Plus: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Back: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Trash: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Chevron: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  People: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true); setError(""); setMessage("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafe", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div style={{ width: 360, background: "#fff", border: "1px solid #e8e8f0", borderRadius: 16, padding: "32px 32px 28px", boxShadow: "0 4px 24px rgba(106,109,232,0.08)" }}>
        <div style={{ marginBottom: 24 }}>
          <div dangerouslySetInnerHTML={{ __html: LOGO_SVG }} style={{ width: "75%", overflow: "hidden", lineHeight: 0, marginBottom: 24 }} />
          <div style={{ fontSize: 18, fontWeight: 500, color: "#2d2d38" }}>{mode === "login" ? "Sign in" : "Create account"}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>1:1 Meeting Manager</div>
        </div>

        {error && <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#276749", marginBottom: 16 }}>{message}</div>}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Password</div>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !email || !password} style={{ width: "100%", padding: "10px", border: "none", borderRadius: 8, background: "linear-gradient(135deg, #29abe2 0%, #6a6de8 50%, #9545ec 100%)", color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
          {mode === "login" ? <>Don't have an account? <button onClick={() => { setMode("signup"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6a6de8", fontWeight: 500, fontSize: 13 }}>Sign up</button></> : <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6a6de8", fontWeight: 500, fontSize: 13 }}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RichEditor({ value, onChange, placeholder, minHeight = 120 }) {
  const ref = useRef(null);
  const isInternal = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternal.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    isInternal.current = false;
  }, [value]);

  function handleInput() { isInternal.current = true; onChange(ref.current.innerHTML); }
  function handleKeyDown(e) { if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;"); } }
  function execCmd(cmd) { ref.current?.focus(); document.execCommand(cmd, false, null); isInternal.current = true; onChange(ref.current.innerHTML); }

  const TB = ({ cmd, label }) => (
    <button onMouseDown={e => { e.preventDefault(); execCmd(cmd); }} style={{ background: "none", border: "1px solid #e8e8f0", borderRadius: 5, padding: "3px 8px", fontSize: 12, cursor: "pointer", color: "#555", fontWeight: cmd === "bold" ? 700 : 400, fontStyle: cmd === "italic" ? "italic" : "normal", textDecoration: cmd === "underline" ? "underline" : "none" }}>{label}</button>
  );

  return (
    <div style={{ border: "1px solid #e8e8f0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", borderBottom: "1px solid #e8e8f0", background: "#fafafe", flexWrap: "wrap" }}>
        <TB cmd="bold" label="B" />
        <TB cmd="italic" label="I" />
        <TB cmd="underline" label="U" />
        <TB cmd="insertUnorderedList" label="• List" />
        <TB cmd="insertOrderedList" label="1. List" />
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={handleInput} onKeyDown={handleKeyDown} data-placeholder={placeholder}
        style={{ minHeight, padding: "10px 14px", outline: "none", fontSize: 14, lineHeight: 1.7, color: "#2d2d38", fontFamily: "system-ui,-apple-system,sans-serif", overflowY: "auto", textAlign: "left" }} />
      <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #bbb; pointer-events: none; }`}</style>
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({ onSave }) {
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);
  function handle() { onSave(); setSaved(true); clearTimeout(timer.current); timer.current = setTimeout(() => setSaved(false), 2000); }
  return (
    <button onClick={handle} style={{ fontSize: 12, padding: "4px 10px", border: `1px solid ${saved ? "#c8e6c9" : "#e8e8f0"}`, borderRadius: 6, background: saved ? "#f1f8f1" : "none", cursor: saved ? "default" : "pointer", color: saved ? "#4caf50" : "#888", display: "flex", alignItems: "center", gap: 4 }}>
      {saved ? <><Icons.Check /> Saved</> : "Save"}
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ label, value, onChange, onSave, placeholder, minHeight }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={css.sectionLabel}>{label}</div>
        <SaveButton onSave={onSave} />
      </div>
      <RichEditor value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} />
    </div>
  );
}

// ─── Todo List ────────────────────────────────────────────────────────────────

function TodoList({ todos, onAdd, onToggle, onDelete, onUpdateDue, showMeetingDate = false }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");

  function handleAdd() {
    if (!text.trim()) return;
    onAdd(text.trim(), due || null);
    setText(""); setDue("");
  }

  const open = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);

  function renderTodo(todo) {
    return (
      <div key={todo.id} style={css.todoRow}>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} style={{ marginTop: 3, cursor: "pointer", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: todo.done ? "#aaa" : "#2d2d38", textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.5 }}>{todo.text}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
            {showMeetingDate && todo.meetingDate && <span style={{ fontSize: 12, color: "#bbb" }}>From {fmtDate(todo.meetingDate)}</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#bbb" }}>Due:</span>
              <input type="date" value={todo.due || ""} onChange={e => onUpdateDue(todo.id, e.target.value || null)}
                style={{ fontSize: 12, border: "1px solid #e8e8f0", borderRadius: 5, padding: "2px 6px", color: todo.due ? (new Date(todo.due) < new Date() && !todo.done ? "#c0392b" : "#555") : "#bbb", background: "none", cursor: "pointer" }} />
            </div>
          </div>
        </div>
        <button style={{ ...css.iconBtn, opacity: 0.35 }} onClick={() => onDelete(todo.id)}><Icons.Trash size={13} /></button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="Add a to-do…" style={{ ...css.input, flex: 1, minWidth: 160 }} />
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...css.input, width: "auto", fontSize: 13, color: due ? "#2d2d38" : "#bbb" }} />
        <button style={css.btnPrimary} onClick={handleAdd} disabled={!text.trim()}><Icons.Plus /> Add</button>
      </div>
      {todos.length === 0 && <div style={{ fontSize: 13, color: "#bbb", padding: "4px 0 8px" }}>No to-dos yet.</div>}
      {open.map(renderTodo)}
      {done.length > 0 && <><div style={{ ...css.sectionLabel, marginTop: 16, marginBottom: 8 }}>Completed</div>{done.map(renderTodo)}</>}
    </div>
  );
}

// ─── Agenda Prep Modal ────────────────────────────────────────────────────────

function AgendaPrepModal({ person, onClose, onCreate }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [agendaChecked, setAgendaChecked] = useState({});
  const [todosChecked, setTodosChecked] = useState({});

  useEffect(() => { generate(); }, []);

  async function generate() {
    setLoading(true); setError(null);
    const recent = person.meetings.slice(0, 5);
    if (recent.length === 0) { setError("No past meetings to review. Add some meeting notes first."); setLoading(false); return; }
    const context = recent.map(m => {
      const a = (m.agenda || "").replace(/<[^>]+>/g, "");
      const n = (m.notes || "").replace(/<[^>]+>/g, "");
      const todos = (m.todos || []).map(t => `- [${t.done ? "done" : "open"}] ${t.text}${t.due ? ` (due ${fmtDate(t.due)})` : ""}`).join("\n");
      return `Meeting: ${fmtDate(m.date)}\nAgenda: ${a || "(none)"}\nNotes: ${n || "(none)"}\nTo-dos:\n${todos || "(none)"}`;
    }).join("\n\n---\n\n");
    const prompt = `Review these past 1:1 meetings with ${person.name} and suggest agenda items and to-dos for the next meeting. Focus on open to-dos, unresolved topics, and follow-ups.\n\n${context}\n\nRespond ONLY with JSON: {"agenda": ["item1"], "todos": ["todo1"]}`;
    try {
      const text = await callClaude(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");
      const parsed = JSON.parse(match[0]);
      setSuggestions(parsed);
      setAgendaChecked(Object.fromEntries((parsed.agenda || []).map((_, i) => [i, true])));
      setTodosChecked(Object.fromEntries((parsed.todos || []).map((_, i) => [i, true])));
    } catch { setError("Couldn't parse suggestions. Try again."); }
    setLoading(false);
  }

  function handleCreate() {
    const agenda = (suggestions.agenda || []).filter((_, i) => agendaChecked[i]).map(a => `<li>${a}</li>`).join("");
    const todos = (suggestions.todos || []).filter((_, i) => todosChecked[i]);
    onCreate(`<ul>${agenda}</ul>`, todos);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(106,109,232,0.15)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e8e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 15 }}>Prep next meeting with {person.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Based on the last {Math.min(person.meetings.length, 5)} meetings</div>
          </div>
          <button style={css.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0", color: "#888" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #e8e8f0", borderTopColor: "#6a6de8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 14 }}>Reviewing past meetings…</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {error && <div style={{ fontSize: 14, color: "#c0392b", padding: "16px 0" }}>{error}</div>}
          {suggestions && !loading && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={css.sectionLabel}>Suggested agenda items</div>
                {(suggestions.agenda || []).map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f4fa", cursor: "pointer" }}>
                    <input type="checkbox" checked={!!agendaChecked[i]} onChange={e => setAgendaChecked(p => ({ ...p, [i]: e.target.checked }))} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </label>
                ))}
              </div>
              <div>
                <div style={css.sectionLabel}>Suggested to-dos</div>
                {(suggestions.todos || []).map((todo, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f4fa", cursor: "pointer" }}>
                    <input type="checkbox" checked={!!todosChecked[i]} onChange={e => setTodosChecked(p => ({ ...p, [i]: e.target.checked }))} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{todo}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        {suggestions && !loading && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e8e8f0", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={css.btnGhost} onClick={onClose}>Cancel</button>
            <button style={css.btnAccent} onClick={handleCreate}><Icons.Plus /> Create meeting with these</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Meeting Detail ───────────────────────────────────────────────────────────

function MeetingDetail({ person, meeting, onBack, onDelete, onUpdate }) {
  const color = COLORS[person.colorIdx];
  const [agenda, setAgenda] = useState(meeting.agenda || "");
  const [notes, setNotes] = useState(meeting.notes || "");
  const [tab, setTab] = useState("meeting");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { setAgenda(meeting.agenda || ""); setNotes(meeting.notes || ""); }, [meeting.id]);

  function addTodo(text, due) {
    const todo = { id: crypto.randomUUID(), text, done: false, due, meetingDate: meeting.date };
    onUpdate(meeting.id, { todos: [...(meeting.todos || []), todo] });
  }
  function toggleTodo(id) { onUpdate(meeting.id, { todos: (meeting.todos || []).map(t => t.id === id ? { ...t, done: !t.done } : t) }); }
  function deleteTodo(id) { onUpdate(meeting.id, { todos: (meeting.todos || []).filter(t => t.id !== id) }); }
  function updateDue(id, due) { onUpdate(meeting.id, { todos: (meeting.todos || []).map(t => t.id === id ? { ...t, due } : t) }); }

  async function askClaude() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResponse("");
    const a = agenda.replace(/<[^>]+>/g, "");
    const n = notes.replace(/<[^>]+>/g, "");
    const ctx = `Meeting on ${fmtDate(meeting.date)} with ${person.name}.\n\nAgenda:\n${a}\n\nNotes:\n${n}`;
    try { const text = await callClaude(`${ctx}\n\n---\n\n${aiPrompt}`); setAiResponse(text); }
    catch { setAiResponse("Something went wrong. Please try again."); }
    setAiLoading(false);
  }

  const openCount = (meeting.todos || []).filter(t => !t.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={css.mainHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={css.iconBtn} onClick={onBack}><Icons.Back /></button>
          <div style={css.avatarLg(color)}>{getInitials(person.name)}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{person.name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{fmtDate(meeting.date)}</div>
          </div>
        </div>
        <button style={css.btnGhost} onClick={() => { if (window.confirm("Delete this meeting?")) onDelete(meeting.id); }}><Icons.Trash /> Delete</button>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8f0", padding: "0 32px", flexShrink: 0 }}>
        <button style={css.tab(tab === "meeting")} onClick={() => setTab("meeting")}>Meeting</button>
        <button style={css.tab(tab === "todos")} onClick={() => setTab("todos")}>To-dos {openCount > 0 && <span style={css.badge}>{openCount}</span>}</button>
        <button style={css.tab(tab === "claude")} onClick={() => setTab("claude")}>Ask Claude</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {tab === "meeting" && (
          <>
            <Section label="Agenda" value={agenda} onChange={setAgenda} onSave={() => onUpdate(meeting.id, { agenda })} placeholder="Topics to cover…" minHeight={120} />
            <Section label="Notes" value={notes} onChange={setNotes} onSave={() => onUpdate(meeting.id, { notes })} placeholder="Notes from this meeting…" minHeight={180} />
          </>
        )}
        {tab === "todos" && (
          <><div style={css.sectionLabel}>To-dos from this meeting</div>
          <TodoList todos={meeting.todos || []} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} onUpdateDue={updateDue} /></>
        )}
        {tab === "claude" && (
          <div>
            <div style={css.sectionLabel}>Ask Claude about this meeting</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && askClaude()} placeholder="Summarize action items, suggest follow-ups…" style={{ ...css.input, flex: 1 }} autoFocus />
              <button style={css.btnPrimary} onClick={askClaude} disabled={aiLoading || !aiPrompt.trim()}>{aiLoading ? "Thinking…" : "Ask"}</button>
            </div>
            {aiResponse && <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", background: "#fafafe", border: "1px solid #e8e8f0", borderRadius: 10, padding: "16px 20px" }}>{aiResponse}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ directs, selectedId, onSelect, onAdd, onDelete, onLogout, userEmail }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName(""); setAdding(false);
  }

  return (
    <div style={css.sidebar}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #e8e8f0" }}>
        <div dangerouslySetInnerHTML={{ __html: LOGO_SVG }} style={{ width: "75%", overflow: "hidden", lineHeight: 0 }} />
      </div>
      <div style={css.sidebarHeader}>
        <span style={css.sidebarLabel}>Directs</span>
        <button style={css.iconBtn} onClick={() => setAdding(true)}><Icons.Plus /></button>
      </div>

      {adding && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e8f0", background: "#fff" }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ ...css.input, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <div style={{ display: "flex", gap: 6 }}>
            <button style={css.btnPrimary} onClick={handleAdd} disabled={!name.trim()}>Add</button>
            <button style={css.btnGhost} onClick={() => { setAdding(false); setName(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={css.personList}>
        {directs.length === 0 && !adding && <div style={{ padding: "24px 12px", color: "#aaa", fontSize: 13, textAlign: "center" }}>Add your first direct report to get started.</div>}
        {directs.map(d => (
          <div key={d.id} style={css.personRow(d.id === selectedId)} onClick={() => onSelect(d.id)}>
            <div style={css.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{d.meetings?.[0] ? `Last met ${fmtDate(d.meetings[0].date)}` : "No meetings yet"}</div>
            </div>
            <button style={{ ...css.iconBtn, opacity: 0.35 }} onClick={e => { e.stopPropagation(); onDelete(d.id); }}><Icons.Trash size={13} /></button>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #e8e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{userEmail}</div>
        <button style={{ ...css.iconBtn, flexShrink: 0 }} onClick={onLogout} title="Sign out"><Icons.Logout /></button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [directs, setDirects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [personTab, setPersonTab] = useState("meetings");
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [showPrep, setShowPrep] = useState(false);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  // Load data when session changes
  useEffect(() => { if (session) loadAll(); else setDirects([]); }, [session]);

  async function loadAll() {
    setLoading(true);
    const { data: directsData } = await supabase.from("directs").select("*").order("created_at");
    const { data: meetingsData } = await supabase.from("meetings").select("*").order("date", { ascending: false });
    const { data: todosData } = await supabase.from("todos").select("*").order("created_at");

    const merged = (directsData || []).map((d, i) => ({
      ...d,
      colorIdx: i % COLORS.length,
      meetings: (meetingsData || []).filter(m => m.direct_id === d.id).map(m => ({
        ...m,
        todos: (todosData || []).filter(t => t.meeting_id === m.id).map(t => ({ ...t, meetingDate: m.date }))
      }))
    }));
    setDirects(merged);
    setLoading(false);
  }

  async function addPerson(name) {
    const colorIdx = directs.length % COLORS.length;
    const { data, error } = await supabase.from("directs").insert({ name, color_idx: colorIdx, user_id: session.user.id }).select().single();
    if (error) { console.error(error); return; }
    const newDirect = { ...data, colorIdx, meetings: [] };
    setDirects(prev => [...prev, newDirect]);
    setSelectedId(data.id);
  }

  async function deletePerson(id) {
    if (!window.confirm("Remove this person and all their meetings?")) return;
    await supabase.from("directs").delete().eq("id", id);
    setDirects(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function addMeeting(agenda = "", preTodos = []) {
    const { data, error } = await supabase.from("meetings").insert({ direct_id: selectedId, date: meetingDate, agenda, notes: "" }).select().single();
    if (error) { console.error(error); return; }
    const todos = [];
    for (const text of preTodos) {
      const { data: td } = await supabase.from("todos").insert({ meeting_id: data.id, text, done: false }).select().single();
      if (td) todos.push({ ...td, meetingDate: data.date });
    }
    const newMeeting = { ...data, todos };
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: [newMeeting, ...d.meetings] } : d));
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setAddingMeeting(false);
    setSelectedMeetingId(data.id);
  }

  async function deleteMeeting(id) {
    await supabase.from("meetings").delete().eq("id", id);
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: d.meetings.filter(m => m.id !== id) } : d));
    setSelectedMeetingId(null);
  }

  async function updateMeeting(meetingId, fields) {
    // Separate todos from db fields
    const { todos, ...dbFields } = fields;
    if (Object.keys(dbFields).length > 0) {
      await supabase.from("meetings").update(dbFields).eq("id", meetingId);
    }
    if (todos !== undefined) {
      // Sync todos: delete all and re-insert (simple approach)
      await supabase.from("todos").delete().eq("meeting_id", meetingId);
      for (const t of todos) {
        await supabase.from("todos").insert({ id: t.id, meeting_id: meetingId, text: t.text, done: t.done, due: t.due || null });
      }
    }
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, ...fields } : m)
    } : d));
  }

  function toggleGlobalTodo(meetingId, todoId) {
    const meeting = selected?.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    updateMeeting(meetingId, { todos: (meeting.todos || []).map(t => t.id === todoId ? { ...t, done: !t.done } : t) });
  }

  function deleteGlobalTodo(meetingId, todoId) {
    const meeting = selected?.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    updateMeeting(meetingId, { todos: (meeting.todos || []).filter(t => t.id !== todoId) });
  }

  function updateGlobalDue(meetingId, todoId, due) {
    const meeting = selected?.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    updateMeeting(meetingId, { todos: (meeting.todos || []).map(t => t.id === todoId ? { ...t, due } : t) });
  }

  function exportNotes() {
    if (!selected) return;
    const content = selected.meetings.map(m => {
      const a = (m.agenda || "").replace(/<[^>]+>/g, "");
      const n = (m.notes || "").replace(/<[^>]+>/g, "");
      const todos = (m.todos || []).map(t => `- [${t.done ? "x" : " "}] ${t.text}${t.due ? ` (due ${fmtDate(t.due)})` : ""}`).join("\n");
      return `## ${fmtDate(m.date)}\n\n### Agenda\n${a || "(none)"}\n\n### Notes\n${n || "(none)"}${todos ? `\n\n### To-dos\n${todos}` : ""}`;
    }).join("\n\n---\n\n");
    const blob = new Blob([`# 1:1 Notes — ${selected.name}\n\n${content}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `1-1_${selected.name.replace(/\s+/g, "_")}.md`; a.click();
  }

  const selected = directs.find(d => d.id === selectedId);
  const selectedMeeting = selected?.meetings.find(m => m.id === selectedMeetingId);
  const allTodos = !selected ? [] : selected.meetings.flatMap(m => (m.todos || []).map(t => ({ ...t, meetingId: m.id })));
  const openTodoCount = allTodos.filter(t => !t.done).length;

  if (authLoading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#888" }}>Loading…</div>;
  if (!session) return <AuthScreen />;

  if (selected && selectedMeeting) {
    return (
      <div style={css.app}>
        <Sidebar directs={directs} selectedId={selectedId} onSelect={id => { setSelectedId(id); setSelectedMeetingId(null); }} onAdd={addPerson} onDelete={deletePerson} onLogout={() => supabase.auth.signOut()} userEmail={session.user.email} />
        <MeetingDetail person={selected} meeting={selectedMeeting} onBack={() => setSelectedMeetingId(null)} onDelete={deleteMeeting} onUpdate={updateMeeting} />
      </div>
    );
  }

  return (
    <div style={css.app}>
      <Sidebar directs={directs} selectedId={selectedId} onSelect={id => { setSelectedId(id); setSelectedMeetingId(null); setPersonTab("meetings"); }} onAdd={addPerson} onDelete={deletePerson} onLogout={() => supabase.auth.signOut()} userEmail={session.user.email} />

      <div style={css.main}>
        {loading ? (
          <div style={css.emptyState}><div style={{ fontSize: 14, color: "#aaa" }}>Loading…</div></div>
        ) : !selected ? (
          <div style={css.emptyState}><Icons.People /><div>Select a direct report to view meetings</div></div>
        ) : (
          <>
            <div style={css.mainHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={css.avatarLg(COLORS[selected.colorIdx])}>{getInitials(selected.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{selected.meetings.length} meeting{selected.meetings.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.meetings.length > 0 && <button style={css.btn} onClick={exportNotes}><Icons.Download /> Export</button>}
                {selected.meetings.length > 0 && <button style={css.btnAccent} onClick={() => setShowPrep(true)}><Icons.Sparkle /> Prep next meeting</button>}
                <button style={css.btnPrimary} onClick={() => setAddingMeeting(true)}><Icons.Plus /> New meeting</button>
              </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #e8e8f0", padding: "0 32px", flexShrink: 0 }}>
              <button style={css.tab(personTab === "meetings")} onClick={() => setPersonTab("meetings")}>Meetings</button>
              <button style={css.tab(personTab === "todos")} onClick={() => setPersonTab("todos")}>All to-dos {openTodoCount > 0 && <span style={css.badge}>{openTodoCount}</span>}</button>
            </div>

            {addingMeeting && (
              <div style={{ padding: "16px 32px", borderBottom: "1px solid #e8e8f0", background: "#fafafe", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <div style={css.sectionLabel}>Date</div>
                  <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ ...css.input, width: "auto" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={css.btnPrimary} onClick={() => addMeeting()}>Create meeting</button>
                  <button style={css.btnGhost} onClick={() => setAddingMeeting(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "0 32px" }}>
              {personTab === "meetings" && (
                selected.meetings.length === 0 && !addingMeeting ? (
                  <div style={{ ...css.emptyState, paddingTop: 60 }}>No meetings yet — add one above</div>
                ) : (
                  selected.meetings.map(m => {
                    const open = (m.todos || []).filter(t => !t.done).length;
                    return (
                      <div key={m.id} style={css.meetingRow} onClick={() => setSelectedMeetingId(m.id)} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <div style={{ fontSize: 13, color: "#888" }}>{fmtDate(m.date)}</div>
                        <div>
                          {open > 0 ? <span style={{ background: "#f5f5ff", border: "1px solid #e8e8f0", borderRadius: 5, fontSize: 12, padding: "2px 7px", color: "#6a6de8" }}>{open} open to-do{open !== 1 ? "s" : ""}</span>
                            : <span style={{ fontSize: 13, color: "#bbb" }}>No open to-dos</span>}
                        </div>
                        <div style={{ color: "#ccc" }}><Icons.Chevron /></div>
                      </div>
                    );
                  })
                )
              )}

              {personTab === "todos" && (
                <div style={{ paddingTop: 20 }}>
                  <div style={css.sectionLabel}>All to-dos — {selected.name}</div>
                  {allTodos.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#bbb", paddingTop: 8 }}>No to-dos yet. Add them from within a meeting.</div>
                  ) : (() => {
                    const open = allTodos.filter(t => !t.done);
                    const done = allTodos.filter(t => t.done);
                    return (
                      <>
                        {open.map(todo => (
                          <div key={`${todo.meetingId}-${todo.id}`} style={css.todoRow}>
                            <input type="checkbox" checked={false} onChange={() => toggleGlobalTodo(todo.meetingId, todo.id)} style={{ marginTop: 3, cursor: "pointer", flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{todo.text}</div>
                              <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: "#bbb" }}>From {fmtDate(todo.meetingDate)}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 12, color: "#bbb" }}>Due:</span>
                                  <input type="date" value={todo.due || ""} onChange={e => updateGlobalDue(todo.meetingId, todo.id, e.target.value || null)}
                                    style={{ fontSize: 12, border: "1px solid #e8e8f0", borderRadius: 5, padding: "2px 6px", color: todo.due ? (new Date(todo.due) < new Date() ? "#c0392b" : "#555") : "#bbb", background: "none", cursor: "pointer" }} />
                                </div>
                              </div>
                            </div>
                            <button style={{ ...css.iconBtn, opacity: 0.35 }} onClick={() => deleteGlobalTodo(todo.meetingId, todo.id)}><Icons.Trash size={13} /></button>
                          </div>
                        ))}
                        {done.length > 0 && (
                          <>
                            <div style={{ ...css.sectionLabel, marginTop: 20, marginBottom: 8 }}>Completed</div>
                            {done.map(todo => (
                              <div key={`${todo.meetingId}-${todo.id}`} style={css.todoRow}>
                                <input type="checkbox" checked={true} onChange={() => toggleGlobalTodo(todo.meetingId, todo.id)} style={{ marginTop: 3, cursor: "pointer", flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, lineHeight: 1.5, color: "#aaa", textDecoration: "line-through" }}>{todo.text}</div>
                                  <span style={{ fontSize: 12, color: "#bbb" }}>From {fmtDate(todo.meetingDate)}</span>
                                </div>
                                <button style={{ ...css.iconBtn, opacity: 0.35 }} onClick={() => deleteGlobalTodo(todo.meetingId, todo.id)}><Icons.Trash size={13} /></button>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showPrep && selected && (
        <AgendaPrepModal person={selected} onClose={() => setShowPrep(false)} onCreate={(agenda, todos) => { setShowPrep(false); setMeetingDate(new Date().toISOString().slice(0, 10)); addMeeting(agenda, todos); }} />
      )}
    </div>
  );
}
