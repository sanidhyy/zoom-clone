import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const protectedRoutes = createRouteMatcher([
  "/",
  "/upcoming",
  "/previous",
  "/recordings",
  "/personal-room",
  "/meeting(.*)",
  "/docs",
]);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
