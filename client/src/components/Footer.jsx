import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">EventHive</h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover, create, and manage events in one simple platform.
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-slate-600">
          <Link to="/events" className="hover:text-indigo-600">
            Events
          </Link>
          <Link to="/create" className="hover:text-indigo-600">
            Create
          </Link>
          <a href="https://github.com" className="hover:text-indigo-600">
            GitHub
          </a>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} EventHive. All rights reserved.
      </div>
    </footer>
  );
}