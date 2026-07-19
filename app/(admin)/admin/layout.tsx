import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AdminAuthGuard from "../components/AdminAuthGuard";
import { AdminFeedbackProvider } from "../components/AdminFeedback";
import AdminHeader from "../components/AdminHeader";
import AdminMainFrame from "../components/AdminMainFrame";
import AdminSidebar from "../components/AdminSidebar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <AdminAuthGuard>
      <AdminFeedbackProvider>
        <div className="relative flex h-full min-h-screen overflow-hidden bg-admin-bg selection:bg-admin-primary/20">
          <div className="pointer-events-none absolute inset-0 admin-grid opacity-[0.08]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.10),transparent_22%),linear-gradient(180deg,rgba(11,11,13,0.96),rgba(11,11,13,1))]" />
          <AdminSidebar />
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            <AdminHeader user={user!} />
            <AdminMainFrame>{children}</AdminMainFrame>
          </div>
        </div>
      </AdminFeedbackProvider>
    </AdminAuthGuard>
  );
}
