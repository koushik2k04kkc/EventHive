import { useState } from "react";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

const options = [
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "not_going", label: "Not Going" }
];

export default function RSVPButton({ eventId, currentStatus = "", onChange }) {
  const [selected, setSelected] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  async function handleRSVP(status) {
    if (!isAuthenticated) {
      addNotification("Please login to RSVP.", "error");
      return;
    }

    if (!eventId || loading) return;

    const previous = selected;
    setSelected(status);
    setLoading(true);

    try {
      const data = await api.post(`/api/events/${eventId}/rsvp`, { status });
      addNotification("RSVP updated successfully.", "success");
      onChange?.(data, status);
    } catch (error) {
      setSelected(previous);
      addNotification(error.message || "Could not update RSVP.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700">Your RSVP</p>

      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isActive = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={loading}
              onClick={() => handleRSVP(option.value)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}