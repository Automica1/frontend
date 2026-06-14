// app/layout.tsx
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AdminAuthGuard from "../components/AdminAuthGuard";
import { AdminFeedbackProvider } from "../components/AdminFeedback";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import '../global.css';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-admin-bg selection:bg-admin-primary/20">
        <AdminAuthGuard>
          <AdminFeedbackProvider>
            <div className="relative flex h-full min-h-screen overflow-hidden">
              <div className="pointer-events-none absolute inset-0 admin-grid opacity-[0.08]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.10),transparent_22%),linear-gradient(180deg,rgba(11,11,13,0.96),rgba(11,11,13,1))]" />
              <AdminSidebar />
              <div className="relative z-10 flex flex-col flex-1 min-w-0">
                <AdminHeader user={user!} />
                <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
                  <div className="max-w-7xl mx-auto h-full">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </AdminFeedbackProvider>
        </AdminAuthGuard>
      </body>
    </html>
  );
}
