import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();
    const roles = await getRoles();

    // Check if user is accessing admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Check if user is authenticated
      if (!user) {
        return Response.redirect(new URL('/api/auth/login', req.url));
      }

      // Check if user has admin role
      const hasAdminRole = roles?.some(role => 
        role.key === 'admin'
        // || role.name === 'Admin'
      );

      if (!hasAdminRole) {
        // Redirect to unauthorized page or main page
        return Response.redirect(new URL('/unauthorized', req.url));
      }
    }
  },
  {
    publicPaths: [
      "/", 
      "/services", 
      "/services/[slug]", 
      "/pricing", 
      "/about", 
      "/contact", 
      "/blog", 
      "/api-docs", 
      "/careers", 
      "/features", 
      "/privacy-policy", 
      "/terms-of-service", 
      "/sitemap.xml", 
      "/security",
      "/unauthorized" // Add unauthorized page to public paths
    ],
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};