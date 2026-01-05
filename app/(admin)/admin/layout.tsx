// app/layout.tsx
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AdminAuthGuard from "../components/AdminAuthGuard";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import '../global.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-admin-bg selection:bg-admin-primary/10">
        <AdminAuthGuard>
          <div className="flex h-full min-h-screen">
            <AdminSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <AdminHeader user={user!} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AdminAuthGuard>
      </body>
    </html>
  );
}
