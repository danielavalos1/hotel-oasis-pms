import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/guests/:path*",
    "/rooms/:path*",
    "/settings/:path*",
  ],
};
