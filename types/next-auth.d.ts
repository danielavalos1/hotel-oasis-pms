import "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    role: string;
    permissions: string[];
  }

  interface Session {
    user: User & {
      id: string;
    };
  }
}
