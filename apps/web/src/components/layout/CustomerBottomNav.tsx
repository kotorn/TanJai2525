import React from "react";
import { Home, UtensilsCrossed, ClipboardList, User } from "lucide-react";
import Link from "next/link";

export const CustomerBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-bottom">
      <div className="flex justify-around items-center px-4 py-3">
        <NavItem icon={<Home className="w-6 h-6" />} label="Home" href="/" />
        <NavItem icon={<UtensilsCrossed className="w-6 h-6" />} label="Menu" href="/menu" active />
        <div className="relative w-full">
          <NavItem icon={<ClipboardList className="w-6 h-6" />} label="Orders" href="/orders" />
          <span className="absolute top-0 right-[25%] -mr-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-glow" />
        </div>
        <NavItem icon={<User className="w-6 h-6" />} label="Profile" href="/profile" />
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) => (
  <Link href={href} className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${active ? "text-primary scale-110" : "text-muted-foreground hover:text-white"}`}>
    {icon}
    <span className="text-[10px] mt-1 font-medium tracking-wide">{label}</span>
  </Link>
);
