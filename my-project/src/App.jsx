import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000";

/* ───── tiny SVG icons (no deps needed) ───── */
const Icons = {
  plus: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
  ),
  edit: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17 3l4 4L7 21H3v-4L17 3z" /></svg>
  ),
  trash: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" /><path d="M10 11v6M14 11v6" /></svg>
  ),
  search: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
  ),
  students: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  close: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
  ),
  refresh: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
  ),
};

/* ───── Toast notification ───── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-emerald-500/90"
      : type === "error"
      ? "bg-red-500/90"
      : "bg-amber-500/90";

  return (
    <div className={`toast-enter fixed top-6 right-6 z-50 ${bg} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
        {Icons.close}
      </button>
    </div>
  );
}

/* ───── Modal wrapper ───── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-backdrop" />
      <div
        className="relative z-50 w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer">
            {Icons.close}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───── Student Form (used in create + edit modals) ───── */
function StudentForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !age || !department.trim()) return;
    onSubmit({ name: name.trim(), age: Number(age), department: department.trim() });
  };

  const inputClass =
    "w-full bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Full Name</label>
        <input id="input-name" type="text" className={inputClass} placeholder="e.g. Hari Prasath" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Age</label>
        <input id="input-age" type="number" className={inputClass} placeholder="e.g. 21" value={age} onChange={(e) => setAge(e.target.value)} min="1" max="120" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Department</label>
        <input id="input-department" type="text" className={inputClass} placeholder="e.g. Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} required />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" id="btn-submit" className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.97] cursor-pointer">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[var(--color-surface-lighter)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] font-semibold py-3 rounded-xl transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ───── Confirm delete modal ───── */
function ConfirmDelete({ open, student, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title="Delete Student">
      <p className="text-[var(--color-text-muted)] mb-6">
        Are you sure you want to delete <span className="text-white font-semibold">{student?.name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button id="btn-confirm-delete" onClick={onConfirm} className="flex-1 bg-[var(--color-danger)] hover:bg-[var(--color-danger-dark)] text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.97] cursor-pointer">
          Delete
        </button>
        <button onClick={onCancel} className="flex-1 bg-[var(--color-surface-lighter)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] font-semibold py-3 rounded-xl transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </Modal>
  );
}

/* ───── Student Card ───── */
function StudentCard({ student, onEdit, onDelete, index }) {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  const accentColor = colors[index % colors.length];

  return (
    <div className="student-card group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)` }}
          >
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-[15px] leading-tight">{student.name}</h3>
            <p className="text-[var(--color-text-muted)] text-sm mt-0.5">{student.department}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`btn-edit-${student.id}`}
            onClick={() => onEdit(student)}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all cursor-pointer"
            title="Edit"
          >
            {Icons.edit}
          </button>
          <button
            id={`btn-delete-${student.id}`}
            onClick={() => onDelete(student)}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all cursor-pointer"
            title="Delete"
          >
            {Icons.trash}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-muted)]">
          ID <span className="text-white font-medium">#{student.id}</span>
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          Age <span className="text-white font-medium">{student.age}</span>
        </span>
      </div>
    </div>
  );
}

/* ───── Empty state ───── */
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-surface-light)] flex items-center justify-center mb-5">
        {Icons.students}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No students yet</h3>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-sm">
        Get started by adding your first student to the system.
      </p>
      <button
        id="btn-add-first"
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.97] cursor-pointer"
      >
        {Icons.plus} Add Student
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*                         APP                             */
/* ──────────────────────────────────────────────────────── */
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  /* ── Fetch all students ── */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* ── Create ── */
  const handleCreate = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Create failed");
      }
      setShowCreate(false);
      showToast("Student created successfully!");
      fetchStudents();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /* ── Update ── */
  const handleUpdate = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/students/${editStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Update failed");
      }
      setEditStudent(null);
      showToast("Student updated successfully!");
      fetchStudents();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/students/${deleteStudent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Delete failed");
      }
      setDeleteStudent(null);
      showToast("Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /* ── Filter ── */
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      String(s.id).includes(search)
  );

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0f0c1a]/80 border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center">
              {Icons.students}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Student Manager</h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                {students.length} student{students.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            id="btn-add-student"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-[var(--color-primary)]/25 cursor-pointer"
          >
            {Icons.plus}
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search + refresh */}
        {students.length > 0 && (
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">{Icons.search}</span>
              <input
                id="input-search"
                type="text"
                placeholder="Search by name, department, or ID…"
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              id="btn-refresh"
              onClick={fetchStudents}
              className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-primary)]/50 transition-all cursor-pointer"
              title="Refresh"
            >
              {Icons.refresh}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-muted)]">No students match "<span className="text-white">{search}</span>"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <StudentCard
                key={s.id}
                student={s}
                index={i}
                onEdit={setEditStudent}
                onDelete={setDeleteStudent}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Student">
        <StudentForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create Student"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        {editStudent && (
          <StudentForm
            initial={editStudent}
            onSubmit={handleUpdate}
            onCancel={() => setEditStudent(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDelete
        open={!!deleteStudent}
        student={deleteStudent}
        onConfirm={handleDelete}
        onCancel={() => setDeleteStudent(null)}
      />
    </div>
  );
}

export default App;