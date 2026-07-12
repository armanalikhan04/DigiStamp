function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">
        DigiStamp
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Welcome, Arman 👋
        </span>

        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </nav>
  );
}

export default Navbar;