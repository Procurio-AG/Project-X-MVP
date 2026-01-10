// src/components/MobileBottomNav.tsx

import { NavLink } from "react-router-dom";
import {
  Radio,
  Users,
  Newspaper,
  MessageCircle,
  Calendar
} from "lucide-react";

const tabs = [
  { to: "/live", icon: Radio, label: "Live" },
  { to: "/buzz", icon: Users, label: "Feed" },
  { to: "/news", icon: Newspaper, label: "News" },
  { to: "/chatroom", icon: MessageCircle, label: "Chat" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-background/90 backdrop-blur-md
        border-t border-border
        md:hidden
      "
    >
      <div className="flex justify-around py-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `
                flex flex-col items-center gap-1 text-[11px]
                transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
