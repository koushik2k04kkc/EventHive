const defaultCategories = [
  { name: "all", label: "All", icon: "✨" },
  { name: "tech", label: "Tech", icon: "💻" },
  { name: "music", label: "Music", icon: "🎵" },
  { name: "sports", label: "Sports", icon: "⚽" },
  { name: "food", label: "Food", icon: "🍔" },
  { name: "art", label: "Art", icon: "🎨" }
];

export default function CategoryFilter({
  activeCategory = "all",
  onChange,
  categories = defaultCategories
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.name;

        return (
          <button
            key={category.name}
            type="button"
            onClick={() => onChange?.(category.name)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
}