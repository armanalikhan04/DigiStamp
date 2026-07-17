import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="hidden min-h-[calc(100vh-76px)] w-72 shrink-0 border-r border-slate-200 bg-white p-5 shadow-sm lg:block">

      <div className="mb-8 rounded-2xl bg-[#1E3A8A] p-5 text-white shadow-sm">
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

      <nav className="flex flex-col gap-2">

        <Link
          to="/dashboard"
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Dashboard
        </Link>

        <Link
          to="/create-deal"
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Create Deal
        </Link>

        <Link
          to="/verify"
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Verify Agreement
        </Link>

        <Link
          to="/verification"
          className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1E3A8A]"
        >
          Identity Verification
        </Link>

        <button
          onClick={handleLogout}
          className="mt-4 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;
