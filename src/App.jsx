import { useState, useEffect } from "react";

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

const STORAGE_KEY = "one-on-one-app-data";

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

const styles = {
  app: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: 14,
    color: "#111",
    background: "#fff",
  },
  sidebar: {
    borderRight: "1px solid #e5e5e5",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  sidebarHeader: {
    padding: "20px 16px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e5e5",
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    padding: "4px 6px",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    fontSize: 16,
  },
  personList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  personRow: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    background: active ? "#fff" : "transparent",
    border: active ? "1px solid #e5e5e5" : "1px solid transparent",
  }),
  avatar: (color) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: color.bg,
    color: color.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  }),
  avatarLg: (color) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: color.bg,
    color: color.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 600,
    flexShrink: 0,
  }),
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  mainHeader: {
    padding: "20px 32px 16px",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  btn: {
    fontSize: 13,
    padding: "6px 14px",
    border: "1px solid #e5e5e5",
    borderRadius: 7,
    background: "none",
    cursor: "pointer",
    color: "#111",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  btnPrimary: {
    fontSize: 13,
    padding: "6px 14px",
    border: "1px solid #111",
    borderRadius: 7,
    background: "#111",
    cursor: "pointer",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  btnGhost: {
    fontSize: 13,
    padding: "6px 10px",
    border: "none",
    borderRadius: 7,
    background: "none",
    cursor: "pointer",
    color: "#888",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  meetingList: {
    flex: 1,
    overflowY: "auto",
    padding: "0 32px",
  },
  meetingRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr 20px",
    alignItems: "start",
    gap: 20,
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    color: "#aaa",
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.7,
    background: "#fff",
    color: "#111",
    resize: "vertical",
    outline: "none",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
  },
};

function AddPersonForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        style={{ ...styles.input, marginBottom: 8 }}
        onKeyDown={e => e.key === "Enter" && name.trim() && onAdd(name.trim(), role.trim())}
      />
      <input
        value={role}
        onChange={e => setRole(e.target.value)}
        placeholder="Role (optional)"
        style={{ ...styles.input, marginBottom: 10 }}
        onKeyDown={e => e.key === "Enter" && name.trim() && onAdd(name.trim(), role.trim())}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button style={styles.btnPrimary} onClick={() => name.trim() && onAdd(name.trim(), role.trim())}>Add</button>
        <button style={styles.btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function MeetingDetail({ person, meeting, onBack, onDelete, onUpdate }) {
  const color = COLORS[person.colorIdx];
  const [notes, setNotes] = useState(meeting.notes);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => onUpdate(meeting.id, notes), 600);
    return () => clearTimeout(t);
  }, [notes]);

  async function askClaude() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResponse("");
    const context = `Meeting on ${formatDate(meeting.date)} with ${person.name}${person.role ? ` (${person.role})` : ""}:\n\n${notes}`;
    try {
      const text = await callClaude([{ role: "user", content: `${context}\n\n---\n\n${aiPrompt}` }]);
      setAiResponse(text);
    } catch { setAiResponse("Something went wrong. Please try again."); }
    setAiLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={styles.mainHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={styles.iconBtn} onClick={onBack} aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={styles.avatarLg(color)}>{getInitials(person.name)}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{person.name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{formatDate(meeting.date)}</div>
          </div>
        </div>
        <button style={styles.btnGhost} onClick={() => { if (window.confirm("Delete this meeting?")) onDelete(meeting.id); }} aria-label="Delete meeting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ ...styles.textarea, minHeight: 240 }}
          placeholder="Meeting notes…"
        />

        <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Ask Claude</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askClaude()}
              placeholder="Summarize action items, suggest follow-ups…"
              style={{ ...styles.input, flex: 1 }}
            />
            <button style={styles.btnPrimary} onClick={askClaude} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? "Thinking…" : "Ask"}
            </button>
          </div>
          {aiResponse && (
            <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap" }}>{aiResponse}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [directs, setDirects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [addingPerson, setAddingPerson] = useState(false);
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [meetingNotes, setMeetingNotes] = useState("");
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

  function addPerson(name, role) {
    const colorIdx = directs.length % COLORS.length;
    const person = { id: Date.now().toString(), name, role, colorIdx, meetings: [] };
    setDirects(prev => [...prev, person]);
    setSelectedId(person.id);
    setAddingPerson(false);
  }

  function deletePerson(id) {
    if (!window.confirm("Remove this person and all their meetings?")) return;
    setDirects(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addMeeting() {
    if (!meetingNotes.trim()) return;
    const meeting = { id: Date.now().toString(), date: meetingDate, notes: meetingNotes.trim() };
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: [meeting, ...d.meetings] } : d));
    setMeetingNotes(""); setMeetingDate(new Date().toISOString().slice(0, 10));
    setAddingMeeting(false);
    setSelectedMeetingId(meeting.id);
  }

  function deleteMeeting(meetingId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: d.meetings.filter(m => m.id !== meetingId) } : d));
    setSelectedMeetingId(null);
  }

  function updateMeetingNotes(meetingId, notes) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, notes } : m)
    } : d));
  }

  function exportNotes() {
    if (!selected || selected.meetings.length === 0) return;
    const content = selected.meetings.map(m => `## ${formatDate(m.date)}\n\n${m.notes}`).join("\n\n---\n\n");
    const blob = new Blob([`# 1:1 Notes — ${selected.name}\n\n${content}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `1-1_${selected.name.replace(/\s+/g, "_")}.md`; a.click();
  }

  if (selected && selectedMeeting) {
    return (
      <div style={styles.app}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Directs</span>
          </div>
          <div style={styles.personList}>
            {directs.map(d => (
              <div key={d.id} style={styles.personRow(d.id === selectedId)} onClick={() => { setSelectedId(d.id); setSelectedMeetingId(null); }}>
                <div style={styles.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
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
          meeting={selectedMeeting}
          onBack={() => setSelectedMeetingId(null)}
          onDelete={deleteMeeting}
          onUpdate={updateMeetingNotes}
        />
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarTitle}>Directs</span>
          <button style={styles.iconBtn} onClick={() => setAddingPerson(true)} aria-label="Add person">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {addingPerson && <AddPersonForm onAdd={addPerson} onCancel={() => setAddingPerson(false)} />}

        <div style={styles.personList}>
          {directs.length === 0 && !addingPerson && (
            <div style={{ padding: "24px 12px", color: "#aaa", fontSize: 13, textAlign: "center" }}>
              Add your first direct report to get started.
            </div>
          )}
          {directs.map(d => (
            <div
              key={d.id}
              style={styles.personRow(d.id === selectedId)}
              onClick={() => { setSelectedId(d.id); setSelectedMeetingId(null); setAddingMeeting(false); }}
            >
              <div style={styles.avatar(COLORS[d.colorIdx])}>{getInitials(d.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{d.meetings[0] ? `Last met ${formatDate(d.meetings[0].date)}` : "No meetings yet"}</div>
              </div>
              <button
                style={{ ...styles.iconBtn, opacity: 0.4 }}
                onClick={e => { e.stopPropagation(); deletePerson(d.id); }}
                aria-label={`Remove ${d.name}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.main}>
        {!selected ? (
          <div style={styles.emptyState}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div>Select a direct report to view meetings</div>
          </div>
        ) : (
          <>
            <div style={styles.mainHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.avatarLg(COLORS[selected.colorIdx])}>{getInitials(selected.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {selected.role ? `${selected.role} · ` : ""}{selected.meetings.length} meeting{selected.meetings.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div style={styles.headerActions}>
                {selected.meetings.length > 0 && (
                  <button style={styles.btn} onClick={exportNotes}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export
                  </button>
                )}
                <button style={styles.btnPrimary} onClick={() => setAddingMeeting(true)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  New meeting
                </button>
              </div>
            </div>

            {addingMeeting && (
              <div style={{ padding: "20px 32px", borderBottom: "1px solid #e5e5e5", background: "#fafafa", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ ...styles.input, width: "auto" }} />
                </div>
                <textarea
                  autoFocus
                  value={meetingNotes}
                  onChange={e => setMeetingNotes(e.target.value)}
                  placeholder="Notes from this meeting…"
                  style={{ ...styles.textarea, minHeight: 120, marginBottom: 12 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.btnPrimary} onClick={addMeeting} disabled={!meetingNotes.trim()}>Save meeting</button>
                  <button style={styles.btnGhost} onClick={() => { setAddingMeeting(false); setMeetingNotes(""); }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={styles.meetingList}>
              {selected.meetings.length === 0 && !addingMeeting ? (
                <div style={{ ...styles.emptyState, paddingTop: 60 }}>
                  <div>No meetings yet — add one above</div>
                </div>
              ) : (
                selected.meetings.map(m => (
                  <div
                    key={m.id}
                    style={styles.meetingRow}
                    onClick={() => setSelectedMeetingId(m.id)}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <div style={{ fontSize: 13, color: "#888", paddingTop: 1 }}>{formatDate(m.date)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{formatDate(m.date)}</div>
                      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.notes}</div>
                    </div>
                    <div style={{ color: "#ccc", paddingTop: 2 }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
