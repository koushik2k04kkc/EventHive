import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { api } from "../utils/api.js";

const featuredCategories = [
  { name: "Tech", icon: "💻", text: "Hackathons, meetups, and workshops" },
  { name: "Music", icon: "🎵", text: "Concerts, jam sessions, and shows" },
  { name: "Sports", icon: "⚽", text: "Matches, tournaments, and fitness events" },
  { name: "Food", icon: "🍔", text: "Food festivals, tastings, and pop-ups" }
];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.get("/api/events?sort=date&limit=6");
        setEvents(Array.isArray(data) ? data : data?.events || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              Discover events near you
            </p>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Find your next favorite event with EventHive.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Browse events, RSVP in seconds, create your own event, and join live
              conversations with the community.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/events"
                className="rounded-full bg-white px-7 py-3 font-bold text-indigo-700 shadow-lg hover:bg-indigo-50"
              >
                Explore Events
              </Link>

              <Link
                to="/create"
                className="rounded-full border border-white/40 px-7 py-3 font-bold text-white hover:bg-white/10"
              >
                Create Event
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/10 p-4 shadow-2xl ring-1 ring-white/20">
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80"
              alt="People attending an event"
              className="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
              Upcoming Events
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Happening soon
            </h2>
          </div>

          <Link to="/events" className="font-bold text-indigo-600 hover:text-indigo-700">
            View all events →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading upcoming events..." />
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-slate-900">No events yet</h3>
            <p className="mt-2 text-slate-500">
              Create the first event and start the community.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
              Featured Categories
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Explore by interest
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name.toLowerCase()}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-lg"
              >
                <div className="text-4xl">{category.icon}</div>
                <h3 className="mt-4 text-xl font-black text-slate-900">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{category.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}