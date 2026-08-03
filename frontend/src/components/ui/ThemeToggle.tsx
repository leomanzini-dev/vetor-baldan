import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = mode === "dark";

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label="Alternar tema"
      onClick={toggle}
      className="relative h-7 w-[50px] shrink-0 rounded-full border border-border-strong bg-app-alt transition-colors"
    >
      <span
        className={`absolute top-[3px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-surface text-primary shadow-token-sm transition-transform duration-300 ${
          isDark ? "translate-x-[25px]" : "translate-x-[3px]"
        }`}
      >
        {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      </span>
    </button>
  );
}
