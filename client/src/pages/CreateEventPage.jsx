import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { api } from "../utils/api.js";

const initialForm = {
  title: "",
  description: "",
  location: "",
  event_date: "",
  category: "tech",
  max_attendees: "",
  banner_url: ""
};

export default function CreateEventPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [form, setForm] = useState(initialForm);
  const [bannerFile, setBannerFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(editId);

  useEffect(() => {
    async function loadEventForEdit() {
      if (!editId) return;

      setPageLoading(true);

      try {
        const data = await api.get(`/api/events/${editId}`);
        const event = data?.event || data;

        setForm({
          title: event.title || "",
          description: event.description || "",
          location: event.location || "",
          event_date: event.event_date
            ? new Date(event.event_date).toISOString().slice(0, 16)
            : "",
          category: event.category || "tech",
          max_attendees: event.max_attendees || "",
          banner_url: event.banner_url || ""
        });

        setPreview(event.banner_url || "");
      } catch (err) {
        addNotification(err.message || "Could not load event.", "error");
        navigate("/events");
      } finally {
        setPageLoading(false);
      }
    }

    loadEventForEdit();
  }, [editId, addNotification, navigate]);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.location.trim() &&
      form.event_date &&
      form.category
    );
  }, [form]);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setBannerFile(null);
      setPreview(form.banner_url || "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        banner: "Only image files are allowed."
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        banner: "Image must be less than 2MB."
      }));
      return;
    }

    setBannerFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.event_date) {
      nextErrors.event_date = "Event date is required.";
    } else if (new Date(form.event_date).getTime() < Date.now()) {
      nextErrors.event_date = "Event date must be in the future.";
    }

    if (
      form.max_attendees &&
      (!Number.isInteger(Number(form.max_attendees)) || Number(form.max_attendees) < 1)
    ) {
      nextErrors.max_attendees = "Max attendees must be a positive number.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function uploadBannerIfNeeded() {
    if (!bannerFile) {
      return form.banner_url;
    }

    const formData = new FormData();
    formData.append("file", bannerFile);

    const uploadData = await api.post("/api/upload", formData);
    return uploadData?.url || uploadData?.fileUrl || uploadData?.banner_url || "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm() || submitting) return;

    setSubmitting(true);

    try {
      const bannerUrl = await uploadBannerIfNeeded();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        event_date: new Date(form.event_date).toISOString(),
        category: form.category,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
        banner_url: bannerUrl
      };

      const data = isEditMode
        ? await api.put(`/api/events/${editId}`, payload)
        : await api.post("/api/events", payload);

      const savedEvent = data?.event || data;

      addNotification(
        isEditMode ? "Event updated successfully." : "Event created successfully.",
        "success"
      );

      navigate(`/events/${savedEvent.id || editId}`);
    } catch (err) {
      addNotification(err.message || "Failed to save event.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading) {
    return <LoadingSpinner label="Loading event form..." />;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          {isEditMode ? "Edit Event" : "Create Event"}
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-900">
          {isEditMode ? "Update your event" : "Create a new event"}
        </h1>

        <p className="mt-3 text-slate-600">
          Add clear information so people can understand and join your event easily.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:grid-cols-[1fr_340px]"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Event Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Example: Dhaka Tech Meetup"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Description
            </label>
            <textarea
              rows="6"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Write event details..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Venue or online link"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-rose-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={(event) => updateField("event_date", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {errors.event_date && (
                <p className="mt-1 text-sm text-rose-600">{errors.event_date}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Category
              </label>
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="tech">Tech</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="food">Food</option>
                <option value="art">Art</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Max Attendees
              </label>
              <input
                type="number"
                min="1"
                value={form.max_attendees}
                onChange={(event) => updateField("max_attendees", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Optional"
              />
              {errors.max_attendees && (
                <p className="mt-1 text-sm text-rose-600">{errors.max_attendees}</p>
              )}
            </div>
          </div>
        </div>

        <aside>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Banner Image
          </label>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            {preview ? (
              <img
                src={preview}
                alt="Banner preview"
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="grid h-56 place-items-center text-center text-slate-500">
                <div>
                  <div className="text-4xl">🖼️</div>
                  <p className="mt-2 text-sm font-medium">Image preview</p>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-indigo-700"
          />

          {errors.banner && <p className="mt-1 text-sm text-rose-600">{errors.banner}</p>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-8 w-full rounded-full bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : isEditMode
              ? "Update Event"
              : "Create Event"}
          </button>
        </aside>
      </form>
    </section>
  );
}