import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="text-green-600 font-bold text-lg">fleet</span>
        <span className="text-gray-700 font-semibold text-lg">flow</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-500">
            {user.username}
            <span className="ml-1.5 text-xs text-gray-400">({user.role})</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-150 cursor-pointer"
        >
          Logout
        </button>
        <button
          onClick={onSidebarOpen}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors duration-150 cursor-pointer text-gray-500"
          aria-label="Open navigation"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
