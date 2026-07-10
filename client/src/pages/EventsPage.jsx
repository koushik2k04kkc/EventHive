import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryFilter from "../components/CategoryFilter.jsx";
import EventCard from "../components/EventCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { api } from "../utils/api.js";

const PAGE_SIZE = 9;

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "date";

  const updateQuery = useCallback(
    (key, value) => {
      const nextParams = new URLSearchParams(searchParams);

      if (!value || value === "all") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }

      setVisibleCount(PAGE_SIZE);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams();

        if (category && category !== "all") {
          query.set("category", category);
        }

        if (search) {
          query.set("search", search);
        }

        if (sort) {
          query.set("sort", sort);
        }

        const data = await api.get(`/events?${query.toString()}`);
        const eventList = Array.isArray(data) ? data : data?.events || [];

        setEvents(eventList);
      } catch (err) {
        setEvents([]);
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [category, search, sort]);

  const visibleEvents = useMemo(
    () => events.slice(0, visibleCount),
    [events, visibleCount]
  );

  const hasMore = visibleCount < events.length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          Explore Events
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-900">
          Find events that match your interest
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Search by keyword, filter by category, and sort events by upcoming date.
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_220px]">
        <SearchBar
          value={search}
          onChange={(value) => updateQuery("search", value)}
          placeholder="Search by title, location, or keyword..."
        />

        <select
          value={sort}
          onChange={(event) => updateQuery("sort", event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="date">Upcoming first</option>
          <option value="newest">Newest first</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      <div className="mb-8">
        <CategoryFilter
          activeCategory={category}
          onChange={(value) => updateQuery("category", value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading events..." />
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h2 className="text-xl font-bold text-rose-700">Could not load events</h2>
          <p className="mt-2 text-rose-600">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-5xl">🔎</div>
          <h2 className="mt-4 text-2xl font-black text-slate-900">
            No matching events found
          </h2>
          <p className="mt-2 text-slate-500">
            Try another search keyword or choose a different category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="rounded-full bg-slate-900 px-7 py-3 font-bold text-white hover:bg-slate-700"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}