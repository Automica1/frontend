import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default async function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();

  // Check authentication
  if (!user) {
    redirect("/api/auth/login");
  }

  // Check admin role
  const hasAdminRole = roles?.some(role => 
    role.key === 'admin' 
    // || role.name === 'Admin'
  );

  if (!hasAdminRole) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}