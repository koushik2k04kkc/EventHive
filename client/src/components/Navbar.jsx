import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

function getNavClass({ isActive }) {
  return isActive
    ? "text-indigo-600 font-semibold"
    : "text-slate-700 hover:text-indigo-600";
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-xl text-white">
            🎉
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900">
            EventHive
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={getNavClass}>
            Home
          </NavLink>
          <NavLink to="/events" className={getNavClass}>
            Events
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/create" className={getNavClass}>
              Create Event
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={markAllRead}
            className="relative rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50"
              >
                <img
                  src={
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=4f46e5&color=fff`
                  }
                  alt={user?.name || "User avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-700">
                  {user?.name || "User"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link
                    to={`/profile/${user?.id || ""}`}
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-xl border border-slate-200 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" onClick={() => setMobileOpen(false)} className={getNavClass}>
              Home
            </NavLink>

            <NavLink to="/events" onClick={() => setMobileOpen(false)} className={getNavClass}>
              Events
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/create" onClick={() => setMobileOpen(false)} className={getNavClass}>
                Create Event
              </NavLink>
            )}

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-center font-semibold text-white"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}