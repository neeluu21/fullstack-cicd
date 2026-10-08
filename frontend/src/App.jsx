import { useEffect, useState } from "react";
import "./App.css";

const COURSES = ["Computer Engineering", "IT", "Mechanical", "Civil", "Electrical"];
const EMPTY = { name: "", rollNo: "", email: "", course: COURSES[0] };

function App() {
  const [form, setForm] = useState(EMPTY);
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null); // { ok: true/false, text }

  const loadStudents = () => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `/api/students/${editId}` : "/api/students";
    try {
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.saved) {
        setStatus({ ok: true, text: `Saved in database: true` });
        setForm(EMPTY);
        setEditId(null);
        loadStudents();
      } else {
        setStatus({ ok: false, text: `Saved in database: false (${data.error})` });
      }
    } catch {
      setStatus({ ok: false, text: "Saved in database: false (backend not reachable)" });
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm({ name: s.name, rollNo: s.rollNo, email: s.email, course: s.course });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    loadStudents();
  };

  const filtered = students.filter((s) =>
    `${s.name} ${s.rollNo} ${s.email} ${s.course}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <header>
        <h1>Student Management</h1>
        <p>React · Node.js · MongoDB · Docker · GitHub Actions · AWS EC2</p>
      </header>

      <section className="card">
        <h2>{editId ? "Edit Student" : "Add Student"}</h2>
        <form onSubmit={handleSubmit} className="form">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input name="rollNo" placeholder="Roll number" value={form.rollNo} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <select name="course" value={form.course} onChange={handleChange}>
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="actions">
            <button type="submit" className="btn primary">
              {editId ? "Update" : "Save"}
            </button>
            {editId && (
              <button type="button" className="btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {status && <p className={status.ok ? "msg ok" : "msg err"}>{status.text}</p>}
      </section>

      <section className="card">
        <div className="table-head">
          <h2>Students ({filtered.length})</h2>
          <input
            className="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty">No students found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Email</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s._id}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.email}</td>
                  <td>{s.course}</td>
                  <td>
                    <button className="btn small" onClick={() => handleEdit(s)}>Edit</button>
                    <button className="btn small danger" onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
