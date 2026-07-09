import { useEffect, useState } from "react";

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search events..."
}) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange?.(input.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [input, onChange]);

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>

      <input
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}