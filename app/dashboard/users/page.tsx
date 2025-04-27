import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { UserRole } from "@prisma/client";
import { UsersForm } from "@/components/dashboard/users-form";
import { UsersList } from "@/components/dashboard/users-list";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPERADMIN)) {
    redirect("/dashboard");
  }
  return (
    <div className="container py-6 space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Personal</h1>
      <UsersForm />
      <UsersList />
    </div>
  );
}