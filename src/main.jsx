import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Activity, Search, Plus, Users, Trophy, GraduationCap, Pencil, Trash2,
  X, ChevronDown, LoaderCircle, AlertCircle, CheckCircle2, RefreshCw,
  Dumbbell, Filter, ArrowUpRight
} from "lucide-react";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const SPORTS = ["Badminton", "Basketball", "Chess", "Football", "Sepak Takraw", "Swimming", "Table Tennis", "Taekwondo", "Volleyball", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const EMPTY_FORM = { name: "", age: "", course: "", year_level: "", sport: "" };

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("All sports");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadStudents() {
    if (!supabase) {
      setLoading(false);
      setError("Connect Supabase to load your student records. Add your project URL and key to the environment variables.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: fetchError } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => { loadStudents(); }, []);

  const sportsCount = new Set(students.map(s => s.sport)).size;
  const coursesCount = new Set(students.map(s => s.course.trim().toLowerCase())).size;
  const filtered = useMemo(() => students.filter(s => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [s.name, s.course, s.year_level, s.sport].some(v => String(v || "").toLowerCase().includes(term));
    return matchesQuery && (sportFilter === "All sports" || s.sport === sportFilter);
  }), [students, query, sportFilter]);

  function openAdd() {
    setEditing(null); setForm(EMPTY_FORM); setModalOpen(true);
  }
  function openEdit(student) {
    setEditing(student);
    setForm({ name: student.name, age: String(student.age), course: student.course, year_level: student.year_level, sport: student.sport });
    setModalOpen(true);
  }
  function updateField(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }
  async function saveStudent(event) {
    event.preventDefault();
    if (!supabase) return setError("Supabase is not configured yet.");
    const record = { name: form.name.trim(), age: Number(form.age), course: form.course.trim(), year_level: form.year_level, sport: form.sport };
    if (!record.name || !record.course || !record.year_level || !record.sport || !record.age) return;
    setSaving(true); setError("");
    const result = editing
      ? await supabase.from("students").update(record).eq("id", editing.id)
      : await supabase.from("students").insert(record);
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setModalOpen(false);
    setNotice(editing ? "Student details updated." : "Student added to the roster.");
    window.setTimeout(() => setNotice(""), 3000);
    await loadStudents();
  }
  async function deleteStudent(student) {
    if (!supabase) return;
    if (!window.confirm(`Delete ${student.name} from the roster? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from("students").delete().eq("id", student.id);
    if (deleteError) setError(deleteError.message);
    else { setStudents(current => current.filter(s => s.id !== student.id)); setNotice("Student removed from the roster."); window.setTimeout(() => setNotice(""), 3000); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Activity size={19} strokeWidth={2.5}/></div><span>roster<span className="brand-dot">.</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><Users size={17}/><span>Student directory</span><span className="nav-count">{students.length}</span></div>
        <div className="sidebar-bottom">
          <div className="side-help-icon"><Dumbbell size={18}/></div>
          <div><strong>Sports & student life</strong><p>One place for your roster.</p></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Student directory</strong></div>
          <div className="top-right"><span className={`connection-dot ${supabase ? "connected" : ""}`}></span><span>{supabase ? "Supabase configured" : "Backend not connected"}</span><div className="avatar">R</div></div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div><div className="eyebrow">STUDENT MANAGEMENT</div><h1>Student directory</h1><p className="subtitle">Keep track of students and the sports they represent.</p></div>
            <button className="primary-btn" onClick={openAdd}><Plus size={17}/> Add student</button>
          </div>

          {error && <div className="alert error-alert"><AlertCircle size={18}/><span>{error}</span>{supabase && <button className="icon-btn alert-action" onClick={loadStudents} aria-label="Retry"><RefreshCw size={16}/></button>}</div>}
          {notice && <div className="alert success-alert"><CheckCircle2 size={18}/>{notice}</div>}

          <div className="stats-grid">
            <Stat icon={<Users size={18}/>} label="Total students" value={students.length} detail="Registered in directory"/>
            <Stat icon={<Trophy size={18}/>} label="Sports represented" value={sportsCount} detail="Unique sports"/>
            <Stat icon={<GraduationCap size={19}/>} label="Courses" value={coursesCount} detail="Academic programs"/>
          </div>

          <section className="directory-panel">
            <div className="panel-heading"><div><h2>All students</h2><p>A complete list of registered students.</p></div><span className="record-count">{filtered.length} RECORDS</span></div>
            <div className="toolbar">
              <div className="search-wrap"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, course, year or sport..." /></div>
              <div className="filter-wrap"><Filter size={15}/><select value={sportFilter} onChange={e => setSportFilter(e.target.value)}><option>All sports</option>{SPORTS.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14} className="select-chevron"/></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>STUDENT</th><th>COURSE</th><th>YEAR LEVEL</th><th>SPORT</th><th className="actions-head">ACTIONS</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="5"><div className="empty-state"><LoaderCircle className="spin" size={22}/><span>Loading student records...</span></div></td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon"><Users size={22}/></div><strong>{students.length ? "No matching students" : "Your directory is empty"}</strong><span>{students.length ? "Try another search or filter." : "Add your first student to get started."}</span>{!students.length && <button className="text-btn" onClick={openAdd}><Plus size={15}/> Add first student</button>}</div></td></tr>
                  : filtered.map(student => <tr key={student.id}>
                    <td><div className="student-cell"><div className="student-avatar">{student.name.trim().charAt(0).toUpperCase()}</div><div><strong>{student.name}</strong><span>{student.age} years old</span></div></div></td>
                    <td><span className="course-text">{student.course}</span></td>
                    <td><span className="year-pill">{student.year_level}</span></td>
                    <td><span className="sport-cell"><span className="sport-dot"></span>{student.sport}</span></td>
                    <td><div className="row-actions"><button className="icon-btn" onClick={() => openEdit(student)} title="Edit student" aria-label={`Edit ${student.name}`}><Pencil size={15}/></button><button className="icon-btn delete-btn" onClick={() => deleteStudent(student)} title="Delete student" aria-label={`Delete ${student.name}`}><Trash2 size={15}/></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="panel-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> students</span><button className="refresh-btn" onClick={loadStudents}><RefreshCw size={14}/> Refresh</button></div>
          </section>
          <footer className="footer"><span>ROSTER <span className="brand-dot">·</span> STUDENT SPORTS REGISTRY</span><span>Simple records. Better organized.</span></footer>
        </section>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal">
          <div className="modal-head"><div><div className="eyebrow">{editing ? "UPDATE RECORD" : "NEW RECORD"}</div><h2>{editing ? "Edit student" : "Add a student"}</h2><p>Enter the student's information below.</p></div><button className="icon-btn close-btn" onClick={() => setModalOpen(false)} aria-label="Close"><X size={19}/></button></div>
          <form onSubmit={saveStudent}>
            <label>Full name<input autoFocus name="name" value={form.name} onChange={updateField} placeholder="e.g. Alex Santos" required maxLength="120"/></label>
            <div className="form-row"><label>Age<input name="age" type="number" min="1" max="120" value={form.age} onChange={updateField} placeholder="e.g. 20" required/></label><label>Course<input name="course" value={form.course} onChange={updateField} placeholder="e.g. BSIT" required maxLength="100"/></label></div>
            <div className="form-row"><label>Year level<div className="select-field"><select name="year_level" value={form.year_level} onChange={updateField} required><option value="">Select year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select><ChevronDown size={15}/></div></label><label>Sport<input name="sport" value={form.sport} onChange={updateField} placeholder="e.g. Basketball, Badminton, Athletics" required maxLength="100"/></label></div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? <><LoaderCircle size={16} className="spin"/> Saving...</> : <><Plus size={16}/>{editing ? "Save changes" : "Add student"}</>}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}

function Stat({ icon, label, value, detail }) {
  return <div className="stat-card"><div className="stat-top"><div className="stat-icon">{icon}</div><ArrowUpRight size={15} className="stat-arrow"/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div></div>;
}

createRoot(document.getElementById("root")).render(<App />);
