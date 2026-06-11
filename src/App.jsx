import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are a helpful assistant for a manager preparing for or reflecting on 1:1 meetings with direct reports. Your role is to help summarize notes, suggest follow-ups, or provide coaching insights based on meeting content. Be concise and direct.`;

const COLORS = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EAF3DE", text: "#27500A" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#FBEAF0", text: "#72243E" },
];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STORAGE_KEY = "one-on-one-app-v2";

async function loadFromStorage() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    return result ? JSON.parse(result.value) : null;
  } catch { return null; }
}

async function saveToStorage(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { console.error("Storage error", e); }
}

async function callClaude(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

const s = {
  app: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 14, color: "#111", background: "#fff" },
  sidebar: { borderRight: "1px solid #e5e5e5", background: "#fafafa", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  sidebarHeader: { padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e5e5" },
  sidebarLabel: { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px 6px", borderRadius: 6, display: "flex", alignItems: "center", fontSize: 16 },
  personList: { flex: 1, overflowY: "auto", padding: 8 },
  personRow: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: active ? "#fff" : "transparent", border: active ? "1px solid #e5e5e5" : "1px solid transparent" }),
  avatar: (c) => ({ width: 32, height: 32, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }),
  avatarLg: (c) => ({ width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }),
  main: { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  mainHeader: { padding: "18px 32px 14px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  btn: { fontSize: 13, padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: 7, background: "none", cursor: "pointer", color: "#111", display: "flex", alignItems: "center", gap: 6 },
  btnPrimary: { fontSize: 13, padding: "6px 14px", border: "1px solid #111", borderRadius: 7, background: "#111", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { fontSize: 13, padding: "6px 10px", border: "none", borderRadius: 7, background: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 6 },
  btnSave: { fontSize: 12, padding: "4px 10px", border: "1px solid #e5e5e5", borderRadius: 6, background: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 4 },
  btnSaved: { fontSize: 12, padding: "4px 10px", border: "1px solid #c8e6c9", borderRadius: 6, background: "#f1f8f1", cursor: "default", color: "#4caf50", display: "flex", alignItems: "center", gap: 4 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, background: "#fff", color: "#111", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, lineHeight: 1.7, background: "#fff", color: "#111", resize: "vertical", outline: "none", fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box" },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#aaa", fontSize: 14 },
  meetingRow: { display: "grid", gridTemplateColumns: "110px 1fr 20px", alignItems: "start", gap: 20, padding: "14px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
  todoRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: "1px solid #f5f5f5" },
};

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function TrashIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function ChevronRight() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}

function SaveButton({ saved, onClick }) {
  return (
    <button style={saved ? s.btnSaved : s.btnSave} onClick={onClick} disabled={saved}>
      {saved ? <><CheckIcon /> Saved</> : "Save"}
    </button>
  );
}

function EditableSection({ label, value, onChange, onSave, placeholder, minHeight = 100 }) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  function handleSave() {
    onSave(value);
    setSaved(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={s.sectionLabel}>{label}</div>
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...s.textarea, minHeight }}
      />
    </div>
  );
}

function TodoList({ todos, onAdd, onToggle, onDelete, showMeetingDate = false }) {
  const [input, setInput] = useState("");

  function handleAdd() {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput("");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add a to-do…"
          style={{ ...s.input, flex: 1 }}
        />
        <button style={s.btnPrimary} onClick={handleAdd} disabled={!input.trim()}>
          <PlusIcon /> Add
        </button>
      </div>
      {todos.length === 0 && (
        <div style={{ fontSize: 13, color: "#bbb", padding: "8px 0" }}>No to-dos yet.</div>
      )}
      {todos.map(todo => (
        <div key={todo.id} style={s.todoRow}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => onToggle(todo.id)}
            style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: todo.done ? "#aaa" : "#111", textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.5 }}>{todo.text}</div>
            {showMeetingDate && todo.meetingDate && (
              <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>From {formatDate(todo.meetingDate)}</div>
            )}
          </div>
          <button style={{ ...s.iconBtn, opacity: 0.4 }} onClick={() => onDelete(todo.id)} aria-label="Delete to-do">
            <TrashIcon size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function MeetingDetail({ person, meeting, onBack, onDelete, onUpdate }) {
  const color = COLORS[person.colorIdx];
  const [agenda, setAgenda] = useState(meeting.agenda || "");
  const [notes, setNotes] = useState(meeting.notes || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("meeting");

  function handleSaveAgenda(val) { onUpdate(meeting.id, { agenda: val }); }
  function handleSaveNotes(val) { onUpdate(meeting.id, { notes: val }); }

  function handleAddTodo(text) {
    const todo = { id: Date.now().toString(), text, done: false, meetingDate: meeting.date };
    onUpdate(meeting.id, { todos: [...(meeting.todos || []), todo] });
  }
  function handleToggleTodo(todoId) {
    onUpdate(meeting.id, { todos: (meeting.todos || []).map(t => t.id === todoId ? { ...t, done: !t.done } : t) });
  }
  function handleDeleteTodo(todoId) {
    onUpdate(meeting.id, { todos: (meeting.todos || []).filter(t => t.id !== todoId) });
  }

  async function askClaude() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResponse("");
    const context = `Meeting on ${formatDate(meeting.date)} with ${person.name}${person.role ? ` (${person.role})` : ""}.\n\nAgenda:\n${agenda}\n\nNotes:\n${notes}`;
    try {
      const text = await callClaude([{ role: "user", content: `${context}\n\n---\n\n${aiPrompt}` }]);
      setAiResponse(text);
    } catch { setAiResponse("Something went wrong. Please try again."); }
    setAiLoading(false);
  }

  const tabStyle = (active) => ({
    fontSize: 13, padding: "6px 14px", border: "none", borderBottom: active ? "2px solid #111" : "2px solid transparent",
    background: "none", cursor: "pointer", color: active ? "#111" : "#888", fontWeight: active ? 500 : 400,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={s.mainHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={s.iconBtn} onClick={onBack} aria-label="Back"><BackIcon /></button>
          <div style={s.avatarLg(color)}>{getInitials(person.name)}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{person.name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{formatDate(meeting.date)}</div>
          </div>
        </div>
        <button style={s.btnGhost} onClick={() => { if (window.confirm("Delete this meeting?")) onDelete(meeting.id); }}>
          <TrashIcon /> Delete meeting
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", padding: "0 32px", flexShrink: 0 }}>
        <button style={tabStyle(activeTab === "meeting")} onClick={() => setActiveTab("meeting")}>Meeting</button>
        <button style={tabStyle(activeTab === "todos")} onClick={() => setActiveTab("todos")}>
          To-dos {(meeting.todos || []).filter(t => !t.done).length > 0 && (
            <span style={{ background: "#111", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px", marginLeft: 4 }}>
              {(meeting.todos || []).filter(t => !t.done).length}
            </span>
          )}
        </button>
        <button style={tabStyle(activeTab === "claude")} onClick={() => setActiveTab("claude")}>Ask Claude</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {activeTab === "meeting" && (
          <>
            <EditableSection
              label="Agenda"
              value={agenda}
              onChange={setAgenda}
              onSave={handleSaveAgenda}
              placeholder="Topics to cover in this meeting…"
              minHeight={120}
            />
            <EditableSection
              label="Notes"
              value={notes}
              onChange={setNotes}
              onSave={handleSaveNotes}
              placeholder="Notes from this meeting…"
              minHeight={180}
            />
          </>
        )}

        {activeTab === "todos" && (
          <>
            <div style={s.sectionLabel}>To-dos from this meeting</div>
            <TodoList
              todos={meeting.todos || []}
              onAdd={handleAddTodo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          </>
        )}

        {activeTab === "claude" && (
          <div>
            <div style={s.sectionLabel}>Ask Claude about this meeting</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === "Enter" && askClaude()}
                placeholder="Summarize action items, suggest follow-ups…"
                style={{ ...s.input, flex: 1 }}
                autoFocus
              />
              <button style={s.btnPrimary} onClick={askClaude} disabled={aiLoading || !aiPrompt.trim()}>
                {aiLoading ? "Thinking…" : "Ask"}
              </button>
            </div>
            {aiResponse && (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: "16px 20px" }}>
                {aiResponse}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [directs, setDirects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [personView, setPersonView] = useState("meetings"); // meetings | todos
  const [addingPerson, setAddingPerson] = useState(false);
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().then(data => {
      if (data?.directs) setDirects(data.directs);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveToStorage({ directs });
  }, [directs, loaded]);

  const selected = directs.find(d => d.id === selectedId);
  const selectedMeeting = selected?.meetings.find(m => m.id === selectedMeetingId);

  function addPerson() {
    if (!newName.trim()) return;
    const colorIdx = directs.length % COLORS.length;
    const person = { id: Date.now().toString(), name: newName.trim(), role: newRole.trim(), colorIdx, meetings: [] };
    setDirects(prev => [...prev, person]);
    setSelectedId(person.id);
    setNewName(""); setNewRole(""); setAddingPerson(false);
  }

  function deletePerson(id) {
    if (!window.confirm("Remove this person and all their meetings?")) return;
    setDirects(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addMeeting() {
    const meeting = { id: Date.now().toString(), date: meetingDate, agenda: "", notes: "", todos: [] };
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: [meeting, ...d.meetings] } : d));
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setAddingMeeting(false);
    setSelectedMeetingId(meeting.id);
  }

  function deleteMeeting(meetingId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: d.meetings.filter(m => m.id !== meetingId) } : d));
    setSelectedMeetingId(null);
  }

  function updateMeeting(meetingId, fields) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, ...fields } : m)
    } : d));
    if (fields.todos !== undefined && selectedMeeting) {
      // keep selectedMeeting in sync via directs
    }
  }

  // Aggregate all todos across all meetings for a person
  function getAllTodos() {
    if (!selected) return [];
    return selected.meetings.flatMap(m => (m.todos || []).map(t => ({ ...t, meetingId: m.id, meetingDate: m.date })));
  }

  function toggleGlobalTodo(meetingId, todoId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? {
        ...m, todos: (m.todos || []).map(t => t.id === todoId ? { ...t, done: !t.done } : t)
      } : m)
    } : d));
  }

  function deleteGlobalTodo(meetingId, todoId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? {
        ...m, todos: (m.todos || []).filter(t => t.id !== todoId)
      } : m)
    } : d));
  }

  function exportNotes() {
    if (!selected) return;
    const content = selected.meetings.map(m => {
      const todos = (m.todos || []).map(t => `- [${t.done ? "x" : " "}] ${t.text}`).join("\n");
      return `## ${formatDate(m.date)}\n\n### Agenda\n${m.agenda || "(none)"}\n\n### Notes\n${m.notes || "(none)"}${todos ? `\n\n### To-dos\n${todos}` : ""}`;
    }).join("\n\n---\n\n");
    const blob = new Blob([`# 1:1 Notes — ${selected.name}\n\n${content}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `1-1_${selected.name.replace(/\s+/g, "_")}.md`;
    a.click();
  }

  const tabStyle = (active) => ({
    fontSize: 13, padding: "6px 14px", border: "none",
    borderBottom: active ? "2px solid #111" : "2px solid transparent",
    background: "none", cursor: "pointer", color: active ? "#111" : "#888",
    fontWeight: active ? 500 : 400,
  });

  const allTodos = getAllTodos();
  const openTodos = allTodos.filter(t => !t.done);

  if (selected && selectedMeeting) {
    return (
      <div style={s.app}>
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={s.sidebarLabel}>Directs</span>
          </div>
          <div style={s.personList}>
            {directs.map(d => (
              <div key={d.id} style={s.personRow(d.id === selectedId)} onClick={() => { setSelectedId(d.id); setSelectedMeetingId(null); }}>
                <div style={s.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{d.meetings[0] ? `Last met ${formatDate(d.meetings[0].date)}` : "No meetings yet"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <MeetingDetail
          person={selected}
          meeting={selected.meetings.find(m => m.id === selectedMeetingId)}
          onBack={() => setSelectedMeetingId(null)}
          onDelete={deleteMeeting}
          onUpdate={updateMeeting}
        />
      </div>
    );
  }

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <span style={s.sidebarLabel}>Directs</span>
          <button style={s.iconBtn} onClick={() => setAddingPerson(true)} aria-label="Add person"><PlusIcon /></button>
        </div>

        {addingPerson && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" style={{ ...s.input, marginBottom: 8 }} onKeyDown={e => e.key === "Enter" && addPerson()} />
            <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role (optional)" style={{ ...s.input, marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && addPerson()} />
            <div style={{ display: "flex", gap: 6 }}>
              <button style={s.btnPrimary} onClick={addPerson} disabled={!newName.trim()}>Add</button>
              <button style={s.btnGhost} onClick={() => { setAddingPerson(false); setNewName(""); setNewRole(""); }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={s.personList}>
          {directs.length === 0 && !addingPerson && (
            <div style={{ padding: "24px 12px", color: "#aaa", fontSize: 13, textAlign: "center" }}>Add your first direct report to get started.</div>
          )}
          {directs.map(d => (
            <div key={d.id} style={s.personRow(d.id === selectedId)} onClick={() => { setSelectedId(d.id); setSelectedMeetingId(null); setPersonView("meetings"); }}>
              <div style={s.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{d.meetings[0] ? `Last met ${formatDate(d.meetings[0].date)}` : "No meetings yet"}</div>
              </div>
              <button style={{ ...s.iconBtn, opacity: 0.35 }} onClick={e => { e.stopPropagation(); deletePerson(d.id); }} aria-label={`Remove ${d.name}`}>
                <TrashIcon size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={s.main}>
        {!selected ? (
          <div style={s.emptyState}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div>Select a direct report to view meetings</div>
          </div>
        ) : (
          <>
            <div style={s.mainHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={s.avatarLg(COLORS[selected.colorIdx])}>{getInitials(selected.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{selected.role ? `${selected.role} · ` : ""}{selected.meetings.length} meeting{selected.meetings.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.meetings.length > 0 && (
                  <button style={s.btn} onClick={exportNotes}><DownloadIcon /> Export</button>
                )}
                <button style={s.btnPrimary} onClick={() => setAddingMeeting(true)}><PlusIcon /> New meeting</button>
              </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", padding: "0 32px", flexShrink: 0 }}>
              <button style={tabStyle(personView === "meetings")} onClick={() => setPersonView("meetings")}>Meetings</button>
              <button style={tabStyle(personView === "todos")} onClick={() => setPersonView("todos")}>
                All to-dos {openTodos.length > 0 && (
                  <span style={{ background: "#111", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px", marginLeft: 4 }}>{openTodos.length}</span>
                )}
              </button>
            </div>

            {addingMeeting && (
              <div style={{ padding: "16px 32px", borderBottom: "1px solid #e5e5e5", background: "#fafafa", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <div style={s.sectionLabel}>Date</div>
                  <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ ...s.input, width: "auto" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.btnPrimary} onClick={addMeeting}>Create meeting</button>
                  <button style={s.btnGhost} onClick={() => setAddingMeeting(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "0 32px" }}>
              {personView === "meetings" && (
                selected.meetings.length === 0 && !addingMeeting ? (
                  <div style={{ ...s.emptyState, paddingTop: 60 }}>
                    <div>No meetings yet — add one above</div>
                  </div>
                ) : (
                  selected.meetings.map(m => {
                    const openCount = (m.todos || []).filter(t => !t.done).length;
                    return (
                      <div key={m.id} style={s.meetingRow} onClick={() => setSelectedMeetingId(m.id)} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <div style={{ fontSize: 13, color: "#888", paddingTop: 2 }}>{formatDate(m.date)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{formatDate(m.date)}</div>
                          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {m.agenda || m.notes || <span style={{ color: "#bbb" }}>No content yet</span>}
                          </div>
                          {openCount > 0 && (
                            <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                              <span style={{ background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 5, padding: "2px 7px" }}>{openCount} open to-do{openCount !== 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ color: "#ccc", paddingTop: 2 }}><ChevronRight /></div>
                      </div>
                    );
                  })
                )
              )}

              {personView === "todos" && (
                <div style={{ paddingTop: 20 }}>
                  <div style={s.sectionLabel}>All to-dos — {selected.name}</div>
                  {allTodos.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#bbb", paddingTop: 8 }}>No to-dos yet. Add them from within a meeting.</div>
                  ) : (
                    allTodos.map(todo => (
                      <div key={`${todo.meetingId}-${todo.id}`} style={s.todoRow}>
                        <input type="checkbox" checked={todo.done} onChange={() => toggleGlobalTodo(todo.meetingId, todo.id)} style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: todo.done ? "#aaa" : "#111", textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.5 }}>{todo.text}</div>
                          <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>From {formatDate(todo.meetingDate)}</div>
                        </div>
                        <button style={{ ...s.iconBtn, opacity: 0.35 }} onClick={() => deleteGlobalTodo(todo.meetingId, todo.id)} aria-label="Delete to-do">
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
