"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/app/actions/logout-action";

interface LogoutButtonProps {
  slug: string;
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({
  slug,
  className = "",
  showText = true,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAction(slug);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      title="Cerrar sesión"
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm font-medium w-full cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-red-400" />
      ) : (
        <LogOut className="w-4 h-4 shrink-0" />
      )}
      {showText && (
        <span>{isLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
      )}
    </button>
  );
}