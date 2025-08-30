import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AdminDashboard from "./AdminDashboard"; // Import the client component

export default async function AdminPage() {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();

  // Pass the server-side data to the client component
  return <AdminDashboard initialUser={user} initialRoles={roles} />;
}