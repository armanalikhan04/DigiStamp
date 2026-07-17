import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;
