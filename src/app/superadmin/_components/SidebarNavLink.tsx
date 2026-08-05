'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, BarChart3, Users } from "lucide-react";

interface SidebarNavLinkProps {
  name: string;
  href: string;
  icon: "Building2" | "CreditCard" | "BarChart3" | "Users";
}

export default function SidebarNavLink({ name, href, icon }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/superadmin" && pathname.startsWith(href));
  
  // Renderizado del icono según el string recibido
  const renderIcon = () => {
    const className = `w-4 h-4 transition-colors ${
      isActive ? "text-amber-500" : "text-slate-500 group-hover:text-amber-500"
    }`;

    switch (icon) {
      case "Building2":
        return <Building2 className={className} />;
      case "CreditCard":
        return <CreditCard className={className} />;
      case "BarChart3":
        return <BarChart3 className={className} />;
      case "Users":
        return <Users className={className} />;
      default:
        return <Building2 className={className} />;
    }
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? "bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-sm"
          : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
      }`}
    >
      {renderIcon()}
      {name}
    </Link>
  );
}