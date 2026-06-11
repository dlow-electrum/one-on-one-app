import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "one-on-one-app-v3";

const COLORS = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EAF3DE", text: "#27500A" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#FBEAF0", text: "#72243E" },
];

const CLAUDE_SYSTEM = `You are a helpful assistant for a manager preparing for 1:1 meetings with direct reports. Be concise and direct. When asked to suggest agenda items or to-dos, you MUST respond with ONLY a raw JSON object and nothing else - no markdown backticks, no explanation, no preamble, no text before or after: {"agenda": ["item 1", "item 2"], "todos": ["todo 1", "todo 2"]}. For other questions, respond in plain text.`;

// ─── Storage ──────────────────────────────────────────────────────────────────

async function loadFromStorage() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function saveToStorage(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { console.error("Storage error", e); }
}

// ─── Claude ───────────────────────────────────────────────────────────────────

async function callClaude(userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: CLAUDE_SYSTEM,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = name => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = {
  app: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 14, color: "#111", background: "#fff" },
  sidebar: { borderRight: "1px solid #e5e5e5", background: "#fafafa", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  sidebarHeader: { padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e5e5" },
  sidebarLabel: { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" },
  personList: { flex: 1, overflowY: "auto", padding: 8 },
  personRow: active => ({ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: active ? "#fff" : "transparent", border: active ? "1px solid #e5e5e5" : "1px solid transparent" }),
  avatar: c => ({ width: 32, height: 32, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }),
  avatarLg: c => ({ width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }),
  main: { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  mainHeader: { padding: "18px 32px 14px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px 6px", borderRadius: 6, display: "flex", alignItems: "center" },
  btn: { fontSize: 13, padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: 7, background: "none", cursor: "pointer", color: "#111", display: "flex", alignItems: "center", gap: 6 },
  btnPrimary: { fontSize: 13, padding: "6px 14px", border: "1px solid #111", borderRadius: 7, background: "#111", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { fontSize: 13, padding: "6px 10px", border: "none", borderRadius: 7, background: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 6 },
  btnAccent: { fontSize: 13, padding: "6px 14px", border: "1px solid #6c5ce7", borderRadius: 7, background: "#6c5ce7", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, background: "#fff", color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "system-ui,-apple-system,sans-serif" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#aaa", fontSize: 14 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 },
  tab: active => ({ fontSize: 13, padding: "10px 14px", border: "none", borderBottom: active ? "2px solid #111" : "2px solid transparent", background: "none", cursor: "pointer", color: active ? "#111" : "#888", fontWeight: active ? 500 : 400 }),
  badge: { background: "#111", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px", marginLeft: 4 },
  meetingRow: { display: "grid", gridTemplateColumns: "110px 1fr 20px", alignItems: "center", gap: 20, padding: "14px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
  todoRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" },
};

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RichEditor({ value, onChange, placeholder, minHeight = 120 }) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternalChange.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  function handleInput() {
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  }

  function execCmd(cmd, val = null) {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
  }

  const toolbarBtn = (cmd, label, val = null) => (
    <button
      onMouseDown={e => { e.preventDefault(); execCmd(cmd, val); }}
      style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 5, padding: "3px 8px", fontSize: 12, cursor: "pointer", color: "#555", fontWeight: cmd === "bold" ? 700 : cmd === "italic" ? "italic" : 400, fontStyle: cmd === "italic" ? "italic" : "normal" }}
      title={label}
    >{label}</button>
  );

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", borderBottom: "1px solid #e5e5e5", background: "#fafafa", flexWrap: "wrap" }}>
        {toolbarBtn("bold", "B")}
        {toolbarBtn("italic", "I")}
        {toolbarBtn("underline", "U")}
        {toolbarBtn("insertUnorderedList", "• List")}
        {toolbarBtn("insertOrderedList", "1. List")}

      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          minHeight, padding: "10px 14px", outline: "none", fontSize: 14, lineHeight: 1.7,
          color: "#111", fontFamily: "system-ui,-apple-system,sans-serif",
          overflowY: "auto", textAlign: "left",
        }}
      />
      <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #bbb; pointer-events: none; }`}</style>
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({ onSave }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);
  function handle() {
    onSave();
    setState("saved");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }
  const saved = state === "saved";
  return (
    <button onClick={handle} style={{ fontSize: 12, padding: "4px 10px", border: `1px solid ${saved ? "#c8e6c9" : "#e5e5e5"}`, borderRadius: 6, background: saved ? "#f1f8f1" : "none", cursor: saved ? "default" : "pointer", color: saved ? "#4caf50" : "#888", display: "flex", alignItems: "center", gap: 4 }}>
      {saved ? <><Icons.Check /> Saved</> : "Save"}
    </button>
  );
}

// ─── Editable Section ─────────────────────────────────────────────────────────

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

// ─── To-do List ───────────────────────────────────────────────────────────────

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
          <div style={{ fontSize: 14, color: todo.done ? "#aaa" : "#111", textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.5 }}>{todo.text}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
            {showMeetingDate && todo.meetingDate && (
              <span style={{ fontSize: 12, color: "#bbb" }}>From {fmtDate(todo.meetingDate)}</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#bbb" }}>Due:</span>
              <input
                type="date"
                value={todo.due || ""}
                onChange={e => onUpdateDue(todo.id, e.target.value || null)}
                style={{ fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 5, padding: "2px 6px", color: todo.due ? (new Date(todo.due) < new Date() && !todo.done ? "#c0392b" : "#555") : "#bbb", background: "none", cursor: "pointer" }}
              />
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
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...css.input, width: "auto", fontSize: 13, color: due ? "#111" : "#bbb" }} />
        <button style={css.btnPrimary} onClick={handleAdd} disabled={!text.trim()}><Icons.Plus /> Add</button>
      </div>
      {todos.length === 0 && <div style={{ fontSize: 13, color: "#bbb", padding: "4px 0 8px" }}>No to-dos yet.</div>}
      {open.map(renderTodo)}
      {done.length > 0 && (
        <>
          <div style={{ ...css.sectionLabel, marginTop: 16, marginBottom: 8 }}>Completed</div>
          {done.map(renderTodo)}
        </>
      )}
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

  useEffect(() => {
    generateSuggestions();
  }, []);

  async function generateSuggestions() {
    setLoading(true); setError(null);
    const recentMeetings = person.meetings.slice(0, 5);
    if (recentMeetings.length === 0) {
      setError("No past meetings to review. Add some meeting notes first.");
      setLoading(false); return;
    }

    const context = recentMeetings.map(m => {
      const agendaText = m.agenda ? m.agenda.replace(/<[^>]+>/g, "") : "";
      const notesText = m.notes ? m.notes.replace(/<[^>]+>/g, "") : "";
      const todos = (m.todos || []).map(t => `- [${t.done ? "done" : "open"}] ${t.text}${t.due ? ` (due ${fmtDate(t.due)})` : ""}`).join("\n");
      return `Meeting: ${fmtDate(m.date)}\nAgenda: ${agendaText || "(none)"}\nNotes: ${notesText || "(none)"}\nTo-dos:\n${todos || "(none)"}`;
    }).join("\n\n---\n\n");

    const prompt = `Review these past 1:1 meetings with ${person.name}${person.role ? ` (${person.role})` : ""} and suggest agenda items and to-dos for the next meeting. Focus on: open to-dos, unresolved topics, patterns, and anything that needs follow-up.\n\n${context}\n\nRespond ONLY with a JSON object: {"agenda": ["item1", "item2"], "todos": ["todo1", "todo2"]}`;

    try {
      const text = await callClaude(prompt);
      // Extract JSON even if Claude wraps it in text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      setSuggestions(parsed);
      setAgendaChecked(Object.fromEntries((parsed.agenda || []).map((_, i) => [i, true])));
      setTodosChecked(Object.fromEntries((parsed.todos || []).map((_, i) => [i, true])));
    } catch {
      setError("Couldn't parse suggestions. Try again.");
    }
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
      <div style={{ background: "#fff", borderRadius: 12, width: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 15 }}>Prep next meeting with {person.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Based on the last {Math.min(person.meetings.length, 5)} meetings</div>
          </div>
          <button style={css.iconBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 0", color: "#888" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #e5e5e5", borderTopColor: "#6c5ce7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 14 }}>Reviewing past meetings…</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && <div style={{ fontSize: 14, color: "#c0392b", padding: "16px 0" }}>{error}</div>}

          {suggestions && !loading && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={css.sectionLabel}>Suggested agenda items</div>
                {(suggestions.agenda || []).length === 0 && <div style={{ fontSize: 13, color: "#bbb" }}>No suggestions.</div>}
                {(suggestions.agenda || []).map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                    <input type="checkbox" checked={!!agendaChecked[i]} onChange={e => setAgendaChecked(p => ({ ...p, [i]: e.target.checked }))} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </label>
                ))}
              </div>

              <div>
                <div style={css.sectionLabel}>Suggested to-dos</div>
                {(suggestions.todos || []).length === 0 && <div style={{ fontSize: 13, color: "#bbb" }}>No suggestions.</div>}
                {(suggestions.todos || []).map((todo, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                    <input type="checkbox" checked={!!todosChecked[i]} onChange={e => setTodosChecked(p => ({ ...p, [i]: e.target.checked }))} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{todo}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {suggestions && !loading && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e5e5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
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

  // Keep local state in sync if parent updates
  useEffect(() => { setAgenda(meeting.agenda || ""); setNotes(meeting.notes || ""); }, [meeting.id]);

  function save(fields) { onUpdate(meeting.id, fields); }

  function addTodo(text, due) {
    const todo = { id: Date.now().toString(), text, done: false, due, meetingDate: meeting.date };
    save({ todos: [...(meeting.todos || []), todo] });
  }
  function toggleTodo(id) { save({ todos: (meeting.todos || []).map(t => t.id === id ? { ...t, done: !t.done } : t) }); }
  function deleteTodo(id) { save({ todos: (meeting.todos || []).filter(t => t.id !== id) }); }
  function updateDue(id, due) { save({ todos: (meeting.todos || []).map(t => t.id === id ? { ...t, due } : t) }); }

  async function askClaude() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResponse("");
    const agendaText = agenda.replace(/<[^>]+>/g, "");
    const notesText = notes.replace(/<[^>]+>/g, "");
    const ctx = `Meeting on ${fmtDate(meeting.date)} with ${person.name}${person.role ? ` (${person.role})` : ""}.\n\nAgenda:\n${agendaText}\n\nNotes:\n${notesText}`;
    try {
      const text = await callClaude(`${ctx}\n\n---\n\n${aiPrompt}`);
      setAiResponse(text);
    } catch { setAiResponse("Something went wrong. Please try again."); }
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
        <button style={css.btnGhost} onClick={() => { if (window.confirm("Delete this meeting?")) onDelete(meeting.id); }}>
          <Icons.Trash /> Delete
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", padding: "0 32px", flexShrink: 0 }}>
        <button style={css.tab(tab === "meeting")} onClick={() => setTab("meeting")}>Meeting</button>
        <button style={css.tab(tab === "todos")} onClick={() => setTab("todos")}>
          To-dos {openCount > 0 && <span style={css.badge}>{openCount}</span>}
        </button>
        <button style={css.tab(tab === "claude")} onClick={() => setTab("claude")}>Ask Claude</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {tab === "meeting" && (
          <>
            <Section label="Agenda" value={agenda} onChange={setAgenda} onSave={() => save({ agenda })} placeholder="Topics to cover…" minHeight={120} />
            <Section label="Notes" value={notes} onChange={setNotes} onSave={() => save({ notes })} placeholder="Notes from this meeting…" minHeight={180} />
          </>
        )}
        {tab === "todos" && (
          <>
            <div style={css.sectionLabel}>To-dos from this meeting</div>
            <TodoList todos={meeting.todos || []} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} onUpdateDue={updateDue} />
          </>
        )}
        {tab === "claude" && (
          <div>
            <div style={css.sectionLabel}>Ask Claude about this meeting</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && askClaude()} placeholder="Summarize action items, suggest follow-ups…" style={{ ...css.input, flex: 1 }} autoFocus />
              <button style={css.btnPrimary} onClick={askClaude} disabled={aiLoading || !aiPrompt.trim()}>{aiLoading ? "Thinking…" : "Ask"}</button>
            </div>
            {aiResponse && <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: "16px 20px" }}>{aiResponse}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ directs, selectedId, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim(), role.trim());
    setName(""); setRole(""); setAdding(false);
  }

  return (
    <div style={css.sidebar}>
      <div style={css.sidebarHeader}>
        <span style={css.sidebarLabel}>Directs</span>
        <button style={css.iconBtn} onClick={() => setAdding(true)}><Icons.Plus /></button>
      </div>

      {adding && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ ...css.input, marginBottom: 8 }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role (optional)" style={{ ...css.input, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <div style={{ display: "flex", gap: 6 }}>
            <button style={css.btnPrimary} onClick={handleAdd} disabled={!name.trim()}>Add</button>
            <button style={css.btnGhost} onClick={() => { setAdding(false); setName(""); setRole(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={css.personList}>
        {directs.length === 0 && !adding && (
          <div style={{ padding: "24px 12px", color: "#aaa", fontSize: 13, textAlign: "center" }}>Add your first direct report to get started.</div>
        )}
        {directs.map(d => (
          <div key={d.id} style={css.personRow(d.id === selectedId)} onClick={() => onSelect(d.id)}>
            <div style={css.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{d.meetings[0] ? `Last met ${fmtDate(d.meetings[0].date)}` : "No meetings yet"}</div>
            </div>
            <button style={{ ...css.iconBtn, opacity: 0.35 }} onClick={e => { e.stopPropagation(); onDelete(d.id); }}><Icons.Trash size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [directs, setDirects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [personTab, setPersonTab] = useState("meetings");
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [showPrep, setShowPrep] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().then(data => { if (data?.directs) setDirects(data.directs); setLoaded(true); });
  }, []);

  useEffect(() => { if (loaded) saveToStorage({ directs }); }, [directs, loaded]);

  const selected = directs.find(d => d.id === selectedId);
  const selectedMeeting = selected?.meetings.find(m => m.id === selectedMeetingId);

  function addPerson(name, role) {
    const colorIdx = directs.length % COLORS.length;
    const p = { id: Date.now().toString(), name, role, colorIdx, meetings: [] };
    setDirects(prev => [...prev, p]);
    setSelectedId(p.id);
  }

  function deletePerson(id) {
    if (!window.confirm("Remove this person and all their meetings?")) return;
    setDirects(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addMeeting(agenda = "", preTodos = []) {
    const todos = preTodos.map(t => ({ id: Date.now().toString() + Math.random(), text: t, done: false, due: null, meetingDate: meetingDate }));
    const m = { id: Date.now().toString(), date: meetingDate, agenda, notes: "", todos };
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: [m, ...d.meetings] } : d));
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setAddingMeeting(false);
    setSelectedMeetingId(m.id);
  }

  function deleteMeeting(id) {
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: d.meetings.filter(m => m.id !== id) } : d));
    setSelectedMeetingId(null);
  }

  function updateMeeting(meetingId, fields) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, ...fields } : m)
    } : d));
  }

  function toggleGlobalTodo(meetingId, todoId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, todos: (m.todos || []).map(t => t.id === todoId ? { ...t, done: !t.done } : t) } : m)
    } : d));
  }

  function deleteGlobalTodo(meetingId, todoId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, todos: (m.todos || []).filter(t => t.id !== todoId) } : m)
    } : d));
  }

  function updateGlobalDue(meetingId, todoId, due) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, todos: (m.todos || []).map(t => t.id === todoId ? { ...t, due } : t) } : m)
    } : d));
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

  const allTodos = !selected ? [] : selected.meetings.flatMap(m => (m.todos || []).map(t => ({ ...t, meetingId: m.id })));
  const openTodoCount = allTodos.filter(t => !t.done).length;

  // Meeting detail view
  if (selected && selectedMeeting) {
    return (
      <div style={css.app}>
        <Sidebar directs={directs} selectedId={selectedId} onSelect={id => { setSelectedId(id); setSelectedMeetingId(null); }} onAdd={addPerson} onDelete={deletePerson} />
        <MeetingDetail person={selected} meeting={selectedMeeting} onBack={() => setSelectedMeetingId(null)} onDelete={deleteMeeting} onUpdate={updateMeeting} />
      </div>
    );
  }

  // Person view
  return (
    <div style={css.app}>
      <Sidebar directs={directs} selectedId={selectedId} onSelect={id => { setSelectedId(id); setSelectedMeetingId(null); setPersonTab("meetings"); }} onAdd={addPerson} onDelete={deletePerson} />

      <div style={css.main}>
        {!selected ? (
          <div style={css.emptyState}><Icons.People /><div>Select a direct report to view meetings</div></div>
        ) : (
          <>
            <div style={css.mainHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={css.avatarLg(COLORS[selected.colorIdx])}>{getInitials(selected.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{selected.role ? `${selected.role} · ` : ""}{selected.meetings.length} meeting{selected.meetings.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.meetings.length > 0 && <button style={css.btn} onClick={exportNotes}><Icons.Download /> Export</button>}
                {selected.meetings.length > 0 && <button style={css.btnAccent} onClick={() => setShowPrep(true)}><Icons.Sparkle /> Prep next meeting</button>}
                <button style={css.btnPrimary} onClick={() => setAddingMeeting(true)}><Icons.Plus /> New meeting</button>
              </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", padding: "0 32px", flexShrink: 0 }}>
              <button style={css.tab(personTab === "meetings")} onClick={() => setPersonTab("meetings")}>Meetings</button>
              <button style={css.tab(personTab === "todos")} onClick={() => setPersonTab("todos")}>
                All to-dos {openTodoCount > 0 && <span style={css.badge}>{openTodoCount}</span>}
              </button>
            </div>

            {addingMeeting && (
              <div style={{ padding: "16px 32px", borderBottom: "1px solid #e5e5e5", background: "#fafafa", flexShrink: 0 }}>
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
                          {open > 0 && <span style={{ background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 5, fontSize: 12, padding: "2px 7px", color: "#666" }}>{open} open to-do{open !== 1 ? "s" : ""}</span>}
                          {open === 0 && <span style={{ fontSize: 13, color: "#bbb" }}>No open to-dos</span>}
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
                  ) : (
                    (() => {
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
                                    <input type="date" value={todo.due || ""} onChange={e => updateGlobalDue(todo.meetingId, todo.id, e.target.value || null)} style={{ fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 5, padding: "2px 6px", color: todo.due ? (new Date(todo.due) < new Date() ? "#c0392b" : "#555") : "#bbb", background: "none", cursor: "pointer" }} />
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
                    })()
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showPrep && selected && (
        <AgendaPrepModal
          person={selected}
          onClose={() => setShowPrep(false)}
          onCreate={(agenda, todos) => {
            setShowPrep(false);
            setMeetingDate(new Date().toISOString().slice(0, 10));
            addMeeting(agenda, todos);
          }}
        />
      )}
    </div>
  );
}
