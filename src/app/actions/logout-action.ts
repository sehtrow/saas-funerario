"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(slug?: string) {
  const cookieStore = await cookies();
  
  // Borra la cookie de sesión
  cookieStore.delete("session_token");

  // Redirige según si hay un slug o hacia el login general
  if (slug) {
    redirect(`/admin/${slug}/login`);
  } else {
    redirect("/login");
  }
}