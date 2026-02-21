import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ALL_PAGES = [
  { label: "Dashboard",        path: "/dashboard" },
  { label: "Vehicle Registry", path: "/vehicle-registry" },
  { label: "Trip Dispatcher",  path: "/trip-dispatcher" },
  { label: "Maintenance",      path: "/maintenance" },
  { label: "Trip and Expense", path: "/trip-expense" },
  { label: "Performance",      path: "/performance" },
  { label: "Analytics",        path: "/analytics" },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const pages = ALL_PAGES.filter((p) => p.path !== location.pathname);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-[250ms] ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {pages.map((page) => (
            <button
              key={page.path}
              onClick={() => handleNavigate(page.path)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-green-50 hover:text-green-700 transition-colors duration-150 cursor-pointer"
            >
              {page.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            fleet <span className="text-green-500 font-medium">flow</span>
          </p>
        </div>
      </aside>
    </>
  );
}
