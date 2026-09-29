"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(data: FormData) {
  const username = data.get("username") as string;
  const password = data.get("password") as string;

  const user = await db.user.findUnique({
    where: { username }
  });

  if (user && user.password === password) {
    const cookieStore = await cookies();
    cookieStore.set("auth_user_id", user.id);
    
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else if (user.role === "ADMISIONISTA") {
      redirect("/admisionista");
    } else {
      redirect("/profesional");
    }
  }

  return { error: "Credenciales inválidas" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_user_id");
  redirect("/");
}
