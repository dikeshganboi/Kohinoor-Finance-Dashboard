import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

const tabs = [
  { to: "/dashboard",    label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/insights",     label: "Insights" },
];

function Navbar() {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const bellRef = useRef(null);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ── */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img
                src="/logo.png"
                alt="Kohinoor Finance Dashboard"
                className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow"
              />
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Kohinoor
              </span>
            </div>
          </div>

          {/* ── Desktop tabs ── */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Role pill */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
                         bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                         border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>

            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setBellOpen((p) => !p); setAvatarOpen(false); }}
                className="relative h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Notifications</p>
                  </div>
                  <div className="px-4 py-6 text-center">
                    <svg className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <p className="text-sm text-slate-400 dark:text-slate-500">No notifications</p>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Profile avatar */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => { setAvatarOpen((p) => !p); setBellOpen(false); }}
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer hover:shadow-emerald-500/40 transition-shadow"
              >
                {role === "admin" ? "A" : "V"}
              </button>
              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {role === "admin" ? "Admin" : "Viewer"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {role === "admin" ? "Full access — add, edit, delete" : "Read-only access"}
                    </p>
                  </div>
                  <div className="px-2 py-1.5">
                    <button
                      onClick={() => { setRole(role === "admin" ? "viewer" : "admin"); setAvatarOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Switch to {role === "admin" ? "Viewer" : "Admin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-current transition-transform ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-transform ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium
                         bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                         border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
