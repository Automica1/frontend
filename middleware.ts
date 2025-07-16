import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware() {
  },
  {
    // Middleware still runs on all routes, but doesn't protect the blog route
    publicPaths: ["/", "/services", "/services/[slug]", "/pricing", "/about", "/contact", "/blog", "/api-docs", "careers", "features", "pricing", "/privacy-policy", "/terms-of-service", "/sitemap.xml", "security"],
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}