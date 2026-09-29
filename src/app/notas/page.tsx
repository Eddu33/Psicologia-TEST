import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotesClient } from "./NotesClient";

export default async function NotasPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const notes = await db.note.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { sharedWith: { some: { id: user.id } } }
      ]
    },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      sharedWith: { select: { id: true, name: true, username: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const allUsers = await db.user.findMany({
    select: { id: true, name: true, username: true },
    where: { id: { not: user.id } }
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <NotesClient initialNotes={notes} allUsers={allUsers} currentUserId={user.id} />
    </DashboardLayout>
  );
}
