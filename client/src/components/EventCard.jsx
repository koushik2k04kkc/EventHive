import { Link } from "react-router-dom";
import { formatShortDate } from "../utils/formatDate.js";

export default function EventCard({ event }) {
  if (!event) return null;

  const attendeeCount =
    event.attendee_count || event.total_attendees || event.rsvp_count || 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img
          src={
            event.banner_url ||
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"
          }
          alt={event.title || "Event banner"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
          {event.category || "General"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-black text-slate-900">
          {event.title || "Untitled Event"}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>📅 {formatShortDate(event.event_date || event.date)}</p>
          <p>📍 {event.location || "Location not set"}</p>
          <p>👥 {attendeeCount} attending</p>
        </div>
      </div>
    </Link>
  );
}