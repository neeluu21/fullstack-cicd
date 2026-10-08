import { useEffect, useMemo, useState } from "react";
import "./App.css";

const COURSES = [
  "Computer Engineering",
  "Information Technology",
  "Mechanical",
  "Civil",
  "Electrical",
];

const initialForm = {
  name: "",
  rollNo: "",
  email: "",
  course: "Computer Engineering",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // -----------------------------
  // GET STUDENTS
  // -----------------------------
  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/students");

      if (!response.ok) {
        throw new Error("Failed to load students");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Student API error:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // -----------------------------
  // INPUT CHANGE
  // -----------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------
  // ADD STUDENT
  // -----------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.rollNo || !form.email) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create student");
      }

      const data = await response.json();

      const newStudent = data.student || data;

      setStudents((previous) => [
        ...previous,
        newStudent,
      ]);

      setForm(initialForm);

      setMessage("Student added successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Create student error:", error);

      setMessage(
        "Unable to add student. Please check the backend."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // DELETE STUDENT
  // -----------------------------
  const deleteStudent = async (student) => {
    const id = student._id || student.id;

    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${student.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/students/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setStudents((previous) =>
        previous.filter(
          (item) =>
            item._id !== id &&
            item.id !== id
        )
      );
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Unable to delete student.");
    }
  };

  // -----------------------------
  // FILTER STUDENTS
  // -----------------------------
  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return students.filter((student) => {
      const name =
        student.name?.toLowerCase() || "";

      const rollNo =
        String(student.rollNo || "").toLowerCase();

      const email =
        student.email?.toLowerCase() || "";

      const studentCourse =
        student.course || "";

      const searchMatch =
        !query ||
        name.includes(query) ||
        rollNo.includes(query) ||
        email.includes(query);

      const courseMatch =
        course === "All" ||
        studentCourse === course;

      return searchMatch && courseMatch;
    });
  }, [students, search, course]);

  // -----------------------------
  // STATISTICS
  // -----------------------------
  const totalStudents = students.length;

  const activeCourses = new Set(
    students
      .map((student) => student.course)
      .filter(Boolean)
  ).size;

  const latestStudent =
    students.length > 0
      ? students[students.length - 1]
      : null;

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  const navigation = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Students",
      icon: "♙",
    },
    {
      name: "Add Student",
      icon: "+",
    },
  ];

  return (
    <div className="app">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">

        <div className="logo-area">

          <div className="logo">
            SH
          </div>

          <div>
            <h2>
              Student<span>Hub</span>
            </h2>

            <p>
              Management System
            </p>
          </div>

        </div>

        <div className="menu-title">
          MAIN MENU
        </div>

        <nav className="navigation">

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-button ${
                activePage === item.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(item.name)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

              {item.name === "Students" && (
                <span className="count">
                  {students.length}
                </span>
              )}
            </button>
          ))}

        </nav>

        <div className="sidebar-footer">

          <div className="server-status">

            <span className="online-dot"></span>

            <div>
              <strong>
                System Online
              </strong>

              <small>
                API & Database connected
              </small>
            </div>

          </div>

          <div className="admin">

            <div className="admin-avatar">
              NS
            </div>

            <div>
              <strong>
                Neel Solanki
              </strong>

              <small>
                Administrator
              </small>
            </div>

          </div>

        </div>

      </aside>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="main">

        {/* TOP HEADER */}

        <header className="header">

          <div>

            <div className="breadcrumb">
              StudentHub
              <span>/</span>
              {activePage}
            </div>

            <h1>
              {activePage === "Dashboard"
                ? "Welcome back, Neel 👋"
                : activePage}
            </h1>

            <p>
              {activePage === "Dashboard"
                ? "Manage your students from one simple dashboard."
                : "Manage your student information and records."}
            </p>

          </div>

          <button
            className="add-top-button"
            onClick={() =>
              setActivePage("Add Student")
            }
          >
            <span>+</span>
            Add Student
          </button>

        </header>

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        {activePage === "Dashboard" && (
          <>

            <section className="stats">

              <div className="stat purple">

                <div className="stat-icon">
                  ♙
                </div>

                <div className="stat-content">
                  <span>
                    Total Students
                  </span>

                  <strong>
                    {totalStudents}
                  </strong>

                  <small>
                    Registered students
                  </small>
                </div>

              </div>

              <div className="stat blue">

                <div className="stat-icon">
                  ◈
                </div>

                <div className="stat-content">
                  <span>
                    Active Courses
                  </span>

                  <strong>
                    {activeCourses}
                  </strong>

                  <small>
                    Courses currently used
                  </small>
                </div>

              </div>

              <div className="stat green">

                <div className="stat-icon">
                  ✓
                </div>

                <div className="stat-content">
                  <span>
                    System Status
                  </span>

                  <strong>
                    Online
                  </strong>

                  <small>
                    Backend services running
                  </small>
                </div>

              </div>

              <div className="stat orange">

                <div className="stat-icon">
                  ◷
                </div>

                <div className="stat-content">
                  <span>
                    Latest Student
                  </span>

                  <strong className="latest">
                    {latestStudent?.name || "None"}
                  </strong>

                  <small>
                    {latestStudent?.course ||
                      "No students yet"}
                  </small>
                </div>

              </div>

            </section>

            <StudentSection
              students={filteredStudents.slice(0, 5)}
              loading={loading}
              search={search}
              setSearch={setSearch}
              course={course}
              setCourse={setCourse}
              deleteStudent={deleteStudent}
              setActivePage={setActivePage}
            />

          </>
        )}

        {/* ==========================================
            STUDENTS
        ========================================== */}

        {activePage === "Students" && (
          <StudentSection
            students={filteredStudents}
            loading={loading}
            search={search}
            setSearch={setSearch}
            course={course}
            setCourse={setCourse}
            deleteStudent={deleteStudent}
            setActivePage={setActivePage}
            full
          />
        )}

        {/* ==========================================
            ADD STUDENT
        ========================================== */}

        {activePage === "Add Student" && (

          <section className="add-page">

            <div className="add-info">

              <div className="big-add-icon">
                +
              </div>

              <h2>
                Add New Student
              </h2>

              <p>
                Add a student to your management
                system and keep all records
                organized in one place.
              </p>

              <div className="tip">

                <span>
                  💡
                </span>

                <div>
                  <strong>
                    Quick Tip
                  </strong>

                  <p>
                    Use a unique roll number and
                    email address for every student.
                  </p>
                </div>

              </div>

            </div>

            <form
              className="student-form"
              onSubmit={handleSubmit}
            >

              <div className="form-heading">

                <div>
                  <h2>
                    Student Information
                  </h2>

                  <p>
                    Enter the details below.
                  </p>
                </div>

                <span>
                  REQUIRED *
                </span>

              </div>

              <div className="form-grid">

                <div className="field">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Neel Solanki"
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Roll Number *
                  </label>

                  <input
                    type="text"
                    name="rollNo"
                    value={form.rollNo}
                    onChange={handleChange}
                    placeholder="e.g. 101"
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Course *
                  </label>

                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                  >
                    {COURSES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

              {message && (
                <div className="message">
                  {message}
                </div>
              )}

              <div className="form-actions">

                <button
                  type="button"
                  className="clear-button"
                  onClick={() => {
                    setForm(initialForm);
                    setMessage("");
                  }}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Student →"}
                </button>

              </div>

            </form>

          </section>

        )}

        <footer className="footer">
          <span>
            © 2026 StudentHub
          </span>

          <span>
            React • Node.js • MongoDB • Docker • AWS
          </span>
        </footer>

      </main>

    </div>
  );
}


/* ======================================================
   STUDENT SECTION
====================================================== */

function StudentSection({
  students,
  loading,
  search,
  setSearch,
  course,
  setCourse,
  deleteStudent,
  setActivePage,
  full = false,
}) {
  return (

    <section
      className={`student-section ${
        full ? "full" : ""
      }`}
    >

      <div className="section-heading">

        <div>
          <h2>
            Students
          </h2>

          <p>
            View and manage student records.
          </p>
        </div>

        {!full && (
          <button
            className="view-button"
            onClick={() =>
              setActivePage("Students")
            }
          >
            View All →
          </button>
        )}

      </div>

      <div className="controls">

        <div className="search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search name, roll number or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="filters">

          <button
            className={
              course === "All"
                ? "selected"
                : ""
            }
            onClick={() => setCourse("All")}
          >
            All
          </button>

          {COURSES.map((item) => (
            <button
              key={item}
              className={
                course === item
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setCourse(item)
              }
            >
              {item ===
              "Information Technology"
                ? "IT"
                : item.split(" ")[0]}
            </button>
          ))}

        </div>

      </div>

      {loading ? (

        <div className="loading">
          <div className="spinner"></div>
          Loading students...
        </div>

      ) : students.length === 0 ? (

        <div className="empty">

          <div className="empty-icon">
            ♙
          </div>

          <h3>
            No students found
          </h3>

          <p>
            Add your first student to get started.
          </p>

          <button
            onClick={() =>
              setActivePage("Add Student")
            }
          >
            + Add Student
          </button>

        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>STUDENT</th>
                <th>ROLL NO.</th>
                <th>EMAIL</th>
                <th>COURSE</th>
                <th>ACTION</th>
              </tr>

            </thead>

            <tbody>

              {students.map((student, index) => (

                <tr
                  key={
                    student._id ||
                    student.id ||
                    index
                  }
                >

                  <td>

                    <div className="student">

                      <div className="student-avatar">
                        {student.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "S"}
                      </div>

                      <div>
                        <strong>
                          {student.name}
                        </strong>

                        <small>
                          Student #{index + 1}
                        </small>
                      </div>

                    </div>

                  </td>

                  <td>
                    <span className="roll">
                      {student.rollNo}
                    </span>
                  </td>

                  <td>
                    {student.email}
                  </td>

                  <td>

                    <span className="course-badge">
                      {student.course}
                    </span>

                  </td>

                  <td>

                    <button
                      className="delete"
                      onClick={() =>
                        deleteStudent(student)
                      }
                      title="Delete"
                    >
                      ×
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}

export default App;
