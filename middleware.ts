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
  const envKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isPlaceholder = !envKey || envKey.includes("XXXXX") || envKey.includes("your_") || envKey === "placeholder";

  if (!isPlaceholder && protectedRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
