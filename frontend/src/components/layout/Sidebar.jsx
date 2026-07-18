import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate("/");
  };

  const handleNavigate = () => {
    onClose?.();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[min(20rem,calc(100vw-2rem))] max-w-full flex-col border-r border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 transition-transform duration-300 sm:p-5 lg:sticky lg:top-[77px] lg:z-auto lg:min-h-[calc(100vh-77px)] lg:w-72 lg:shrink-0 lg:translate-x-0 lg:shadow-sm ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >

      <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
        <h2 className="text-lg font-bold text-[#1E3A8A]">Navigation</h2>
        <button
          aria-label="Close navigation menu"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl leading-none text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          ×
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-[#1E3A8A] p-5 text-white shadow-sm lg:mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
          Legal-Tech Suite
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          DigiStamp
        </h2>
        <p className="mt-2 text-sm leading-5 text-blue-100">
          Agreements, identity checks, verification, and document security.
        </p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">

        <Link
          to="/dashboard"
          onClick={handleNavigate}
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Dashboard
        </Link>

        <Link
          to="/create-deal"
          onClick={handleNavigate}
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Create Deal
        </Link>

        <Link
          to="/verify"
          onClick={handleNavigate}
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Verify Agreement
        </Link>

        <Link
          to="/verification"
          onClick={handleNavigate}
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Identity Verification
        </Link>

        <button
          onClick={handleLogout}
          className="mt-auto rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;
