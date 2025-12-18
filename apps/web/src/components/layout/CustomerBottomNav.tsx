import React from "react";
import { Home, UtensilsCrossed, ClipboardList, User } from "lucide-react";
import Link from "next/link";

export const CustomerBottomNav = () => {
  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm safe-area-bottom">
      <div className="glass-panel rounded-full px-6 py-4 flex justify-between items-center shadow-soft bg-white/90 backdrop-blur-xl border-white/40">
        <NavItem icon={<Home className="w-6 h-6" />} href="/" />
        <NavItem icon={<UtensilsCrossed className="w-6 h-6" />} href="/menu" active />
        <div className="relative">
             <NavItem icon={<ClipboardList className="w-6 h-6" />} href="/orders" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        </div>
        <NavItem icon={<User className="w-6 h-6" />} href="/profile" />
      </div>
    </nav>
  );
};

const NavItem = ({ icon, href, active }: { icon: React.ReactNode; href: string; active?: boolean }) => (
  <Link href={href} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${active ? "bg-primary text-white shadow-md transform -translate-y-2 scale-110" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
    {icon}
  </Link>
);
