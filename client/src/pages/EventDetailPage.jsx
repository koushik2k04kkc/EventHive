import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import RSVPButton from "../components/RSVPButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { api } from "../utils/api.js";
import { formatDate } from "../utils/formatDate.js";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const data = await api.get(`/api/events/${id}`);
        setEvent(data?.event || data);
      } catch (err) {
        setError(err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id]);

  const creatorId = event?.creator_id || event?.user_id || event?.created_by;
  const isCreator = isAuthenticated && user?.id && Number(user.id) === Number(creatorId);

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this event?");

    if (!confirmed || deleting) return;

    setDeleting(true);

    try {
      await api.delete(`/api/events/${id}`);
      addNotification("Event deleted successfully.", "success");
      navigate("/events");
    } catch (err) {
      addNotification(err.message || "Failed to delete event.", "error");
    } finally {
      setDeleting(false);
    }
  }

  function handleRSVPChange(data) {
    if (!event) return;

    const updatedCount =
      data?.attendee_count ||
      data?.total_attendees ||
      data?.event?.attendee_count ||
      event.attendee_count;

    setEvent((prev) => ({
      ...prev,
      attendee_count: updatedCount
    }));
  }

  if (loading) {
    return <LoadingSpinner label="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-2xl font-black text-rose-700">Event not found</h1>
          <p className="mt-2 text-rose-600">{error || "This event does not exist."}</p>

          <Link
            to="/events"
            className="mt-6 inline-block rounded-full bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700"
          >
            Back to Events
          </Link>
        </div>
      </section>
    );
  }

  const attendeeCount =
    event.attendee_count || event.total_attendees || event.rsvp_count || 0;

  return (
    <section className="bg-slate-50">
      <div className="h-[320px] w-full overflow-hidden bg-slate-200 md:h-[430px]">
        <img
          src={
            event.banner_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80"
          }
          alt={event.title || "Event banner"}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <article className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-indigo-700">
              {event.category || "General"}
            </span>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {event.status || "active"}
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {event.title}
          </h1>

          <div className="mt-6 grid gap-4 text-slate-700 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Date & Time</p>
              <p className="mt-1 font-semibold">
                {formatDate(event.event_date || event.date)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Location</p>
              <p className="mt-1 font-semibold">
                {event.location || "Location not set"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-slate-900">About this event</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
              {event.description || "No description added yet."}
            </p>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black text-slate-900">Comments</h2>

            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
              Person 3 will connect CommentList and CommentForm here.
            </div>
          </div>
        </article>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-500">Created by</p>

            <Link
              to={`/profile/${creatorId || ""}`}
              className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-indigo-50"
            >
              <img
                src={
                  event.creator_avatar ||
                  event.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    event.creator_name || "Creator"
                  )}&background=4f46e5&color=fff`
                }
                alt={event.creator_name || "Creator"}
                className="h-12 w-12 rounded-full object-cover"
              />

              <div>
                <p className="font-bold text-slate-900">
                  {event.creator_name || event.creator || "Event Creator"}
                </p>
                <p className="text-sm text-slate-500">View profile</p>
              </div>
            </Link>
          </div>

          <div className="mb-6 rounded-2xl bg-indigo-50 p-4">
            <p className="text-sm font-bold text-indigo-700">Total Attendees</p>
            <p className="mt-1 text-3xl font-black text-indigo-900">
              {attendeeCount}
            </p>
          </div>

          <RSVPButton
            eventId={event.id}
            currentStatus={event.my_rsvp_status || ""}
            onChange={handleRSVPChange}
          />

          {isCreator && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="mb-3 text-sm font-bold text-slate-500">Creator Actions</p>

              <div className="flex gap-3">
                <Link
                  to={`/create?edit=${event.id}`}
                  className="flex-1 rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-700"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}