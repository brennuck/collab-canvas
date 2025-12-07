import { useState, useRef, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute left-2 top-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "light" ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
          >
            Light
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "dark" ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
          >
            Dark
          </button>
          <button
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "system" ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}
