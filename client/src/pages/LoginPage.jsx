import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login, register, isAuthenticated, authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const isRegisterMode = mode === "register";

  const title = useMemo(
    () => (isRegisterMode ? "Create your account" : "Welcome back"),
    [isRegisterMode]
  );

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (isRegisterMode && form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Invalid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm() || submitting) return;

    setSubmitting(true);

    try {
      if (isRegisterMode) {
        await register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password
        });

        addNotification("Account created successfully.", "success");
      } else {
        await login(form.email.trim().toLowerCase(), form.password);
        addNotification("Logged in successfully.", "success");
      }

      navigate("/");
    } catch (err) {
      addNotification(err.message || "Authentication failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrors({});
  }

  return (
    <section className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-xl text-white">
              🎉
            </span>
            <span className="text-xl font-black text-slate-900">EventHive</span>
          </Link>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
              {isRegisterMode ? "Join the community" : "Login"}
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">{title}</h1>

            <p className="mt-3 text-slate-600">
              {isRegisterMode
                ? "Create events, RSVP, and join event discussions."
                : "Login to manage your events and RSVPs."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegisterMode && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Your name"
                />
                {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please wait..."
                : isRegisterMode
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isRegisterMode ? "Already have an account?" : "Do not have an account?"}

            <button
              type="button"
              onClick={switchMode}
              className="ml-2 font-bold text-indigo-600 hover:text-indigo-700"
            >
              {isRegisterMode ? "Login" : "Register"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950 lg:block">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-20 top-20 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 h-56 w-56 rounded-full bg-purple-300 blur-3xl" />
        </div>

        <div className="relative flex h-full items-center justify-center p-14">
          <div className="max-w-lg rounded-[2rem] bg-white/10 p-8 text-white ring-1 ring-white/20 backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">
              EventHive
            </p>

            <h2 className="mt-4 text-5xl font-black leading-tight">
              Build your event community faster.
            </h2>

            <p className="mt-6 text-lg leading-8 text-indigo-100">
              EventHive helps users discover events, RSVP, comment, and receive
              real-time updates from one clean dashboard.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">RSVP</p>
                <p className="mt-1 text-xs text-indigo-100">Fast joining</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">Live</p>
                <p className="mt-1 text-xs text-indigo-100">Updates</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">Easy</p>
                <p className="mt-1 text-xs text-indigo-100">Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}