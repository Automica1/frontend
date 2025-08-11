// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    // Check environment for SEO blocking
    const isProduction = process.env.NODE_ENV === 'production' && 
                         process.env.NEXT_PUBLIC_SITE_URL === 'https://automica.ai';

    // Get response to modify headers
    const response = NextResponse.next();

    // Block search engines for dev environment
    if (!isProduction) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    }

    // Handle admin route protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const { getUser, getRoles } = getKindeServerSession();
      const user = await getUser();
      const roles = await getRoles();

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

    return response;
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
      "/robots.txt",
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