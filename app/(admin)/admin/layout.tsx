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
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AdminAuthGuard>
          <AdminHeader user={user!} />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </AdminAuthGuard>
      </body>
    </html>
  );
}
