"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(slug: string) {
  const cookieStore = await cookies();

  // Eliminamos la cookie de sesión asociada al slug de la funeraria
  cookieStore.delete({
    name: `session_${slug}`,
    path: `/admin/${slug}`,
  });

  // Redirigimos al usuario al login general
  redirect("/login");
}