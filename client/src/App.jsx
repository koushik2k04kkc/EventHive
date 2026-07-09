import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import CreateEventPage from "./pages/CreateEventPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col">
      {!hideLayout && <Navbar />}

      <main className="flex-1">
        <Outlet />
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Profile Page</h1>
        <p className="mt-3 text-slate-600">
          This route is ready. Person 3 will add the full profile page here.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/:id" element={<ProfilePlaceholder />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/create" element={<CreateEventPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}