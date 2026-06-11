import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are a helpful assistant for a manager preparing for or reflecting on 1:1 meetings with direct reports. Your role is to help summarize notes, suggest follow-ups, or provide coaching insights based on meeting content. Be concise and direct.`;

const COLORS = ["#CECBF6", "#9FE1CB", "#F5C4B3", "#B5D4F4", "#C0DD97", "#FAC775", "#F4C0D1"];
const TEXT_COLORS = ["#3C3489", "#085041", "#712B13", "#0C447C", "#3B6D11", "#633806", "#72243E"];

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

export default function App() {
  const [directs, setDirects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("list"); // list | person | meeting
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [addingPerson, setAddingPerson] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [meetingNotes, setMeetingNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [loaded, setLoaded] = useState(false);
  const notesRef = useRef(null);

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

  function addPerson() {
    if (!newName.trim()) return;
    const colorIdx = directs.length % COLORS.length;
    const person = { id: Date.now().toString(), name: newName.trim(), role: newRole.trim(), colorIdx, meetings: [] };
    setDirects(prev => [...prev, person]);
    setNewName(""); setNewRole(""); setAddingPerson(false);
  }

  function deletePerson(id) {
    setDirects(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) { setSelectedId(null); setView("list"); }
  }

  function addMeeting() {
    if (!meetingNotes.trim()) return;
    const meeting = { id: Date.now().toString(), date: meetingDate, notes: meetingNotes.trim(), createdAt: new Date().toISOString() };
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: [meeting, ...d.meetings] } : d));
    setMeetingNotes(""); setMeetingDate(new Date().toISOString().slice(0, 10)); setAddingMeeting(false);
  }

  function deleteMeeting(meetingId) {
    setDirects(prev => prev.map(d => d.id === selectedId ? { ...d, meetings: d.meetings.filter(m => m.id !== meetingId) } : d));
    if (selectedMeeting?.id === meetingId) { setSelectedMeeting(null); setView("person"); }
  }

  function updateMeetingNotes(meetingId, notes) {
    setDirects(prev => prev.map(d => d.id === selectedId ? {
      ...d, meetings: d.meetings.map(m => m.id === meetingId ? { ...m, notes } : m)
    } : d));
    setSelectedMeeting(prev => ({ ...prev, notes }));
  }

  async function askClaude() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResponse("");
    const context = selectedMeeting ? `Meeting on ${formatDate(selectedMeeting.date)} with ${selected.name} (${selected.role}):\n\n${selectedMeeting.notes}` : "";
    try {
      const text = await callClaude([{ role: "user", content: context ? `${context}\n\n---\n\n${aiPrompt}` : aiPrompt }]);
      setAiResponse(text);
    } catch { setAiResponse("Something went wrong. Please try again."); }
    setAiLoading(false);
  }

  async function exportToGoogleDocs() {
    if (!selected || selected.meetings.length === 0) return;
    const content = selected.meetings.map(m =>
      `## ${formatDate(m.date)}\n\n${m.notes}`
    ).join("\n\n---\n\n");
    const title = `1:1 Notes — ${selected.name}`;
    const fullText = `# ${title}\n\n${content}`;
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click(); URL.revokeObjectURL(url);
  }

  // VIEWS
  if (view === "meeting" && selectedMeeting && selected) {
    const color = COLORS[selected.colorIdx];
    const tcolor = TEXT_COLORS[selected.colorIdx];
    return (
      <div style={{ padding: "1.5rem 0" }}>
        <h2 className="sr-only">Meeting notes editor</h2>
        <button onClick={() => { setView("person"); setAiResponse(""); setAiPrompt(""); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)", fontSize: 14, padding: 0, marginBottom: "1.5rem" }}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i> Back to {selected.name}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: tcolor, flexShrink: 0 }}>{getInitials(selected.name)}</div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{selected.name}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{formatDate(selectedMeeting.date)}</p>
          </div>
          <button onClick={() => { if (confirm("Delete this meeting?")) deleteMeeting(selectedMeeting.id); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4 }} aria-label="Delete meeting">
            <i className="ti ti-trash" style={{ fontSize: 18 }} aria-hidden="true"></i>
          </button>
        </div>

        <textarea
          value={selectedMeeting.notes}
          onChange={e => updateMeetingNotes(selectedMeeting.id, e.target.value)}
          style={{ width: "100%", minHeight: 220, fontSize: 15, lineHeight: 1.7, padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
          placeholder="Meeting notes..."
        />

        <div style={{ marginTop: "1.5rem", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>Ask Claude about this meeting</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && askClaude()} placeholder="E.g. summarize action items, suggest follow-ups…" style={{ flex: 1, fontSize: 14 }} />
            <button onClick={askClaude} disabled={aiLoading || !aiPrompt.trim()} style={{ whiteSpace: "nowrap" }}>
              {aiLoading ? "Thinking…" : "Ask ↗"}
            </button>
          </div>
          {aiResponse && (
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", whiteSpace: "pre-wrap" }}>{aiResponse}</div>
          )}
        </div>
      </div>
    );
  }

  if (view === "person" && selected) {
    const color = COLORS[selected.colorIdx];
    const tcolor = TEXT_COLORS[selected.colorIdx];
    return (
      <div style={{ padding: "1.5rem 0" }}>
        <h2 className="sr-only">Direct report meetings</h2>
        <button onClick={() => { setView("list"); setSelectedId(null); setAddingMeeting(false); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)", fontSize: 14, padding: 0, marginBottom: "1.5rem" }}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i> All directs
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500, color: tcolor, flexShrink: 0 }}>{getInitials(selected.name)}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 18 }}>{selected.name}</p>
            {selected.role && <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>{selected.role}</p>}
          </div>
          <button onClick={exportToGoogleDocs} title="Export notes" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4 }} aria-label="Export notes">
            <i className="ti ti-download" style={{ fontSize: 20 }} aria-hidden="true"></i>
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>{selected.meetings.length} meeting{selected.meetings.length !== 1 ? "s" : ""}</p>
          <button onClick={() => setAddingMeeting(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-plus" aria-hidden="true"></i> New meeting
          </button>
        </div>

        {addingMeeting && (
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 16, border: "0.5px solid var(--color-border-tertiary)" }}>
            <p style={{ margin: "0 0 10px", fontWeight: 500, fontSize: 14 }}>New meeting</p>
            <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ marginBottom: 10, fontSize: 14 }} />
            <textarea
              value={meetingNotes}
              onChange={e => setMeetingNotes(e.target.value)}
              placeholder="Notes from this meeting…"
              style={{ width: "100%", minHeight: 120, fontSize: 14, lineHeight: 1.7, padding: "10px 12px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={addMeeting} disabled={!meetingNotes.trim()}>Save meeting</button>
              <button onClick={() => { setAddingMeeting(false); setMeetingNotes(""); }} style={{ background: "none" }}>Cancel</button>
            </div>
          </div>
        )}

        {selected.meetings.length === 0 && !addingMeeting && (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
            No meetings yet. Add your first one above.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {selected.meetings.map(m => (
            <div key={m.id} onClick={() => { setSelectedMeeting(m); setView("meeting"); setAiResponse(""); setAiPrompt(""); }} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14 }}>{formatDate(m.date)}</p>
                <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--color-text-secondary)" }} aria-hidden="true"></i>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.notes}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <h2 className="sr-only">1:1 meeting manager</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Your directs</p>
        <button onClick={() => setAddingPerson(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-plus" aria-hidden="true"></i> Add person
        </button>
      </div>

      {addingPerson && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 16, border: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 500, fontSize: 14 }}>Add direct report</p>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === "Enter" && addPerson()} style={{ marginBottom: 8, fontSize: 14, width: "100%", boxSizing: "border-box" }} />
          <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role (optional)" onKeyDown={e => e.key === "Enter" && addPerson()} style={{ marginBottom: 12, fontSize: 14, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addPerson} disabled={!newName.trim()}>Add</button>
            <button onClick={() => { setAddingPerson(false); setNewName(""); setNewRole(""); }} style={{ background: "none" }}>Cancel</button>
          </div>
        </div>
      )}

      {directs.length === 0 && !addingPerson && (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
          No direct reports yet. Add someone to get started.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {directs.map(d => {
          const color = COLORS[d.colorIdx];
          const tcolor = TEXT_COLORS[d.colorIdx];
          const lastMeeting = d.meetings[0];
          return (
            <div key={d.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => { setSelectedId(d.id); setView("person"); setAddingMeeting(false); }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: tcolor, flexShrink: 0 }}>{getInitials(d.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{d.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  {d.role ? `${d.role} · ` : ""}{d.meetings.length} meeting{d.meetings.length !== 1 ? "s" : ""}
                  {lastMeeting ? ` · Last: ${formatDate(lastMeeting.date)}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={e => { e.stopPropagation(); if (confirm(`Remove ${d.name}?`)) deletePerson(d.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4 }} aria-label={`Remove ${d.name}`}>
                  <i className="ti ti-trash" style={{ fontSize: 16 }} aria-hidden="true"></i>
                </button>
                <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--color-text-secondary)" }} aria-hidden="true"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
