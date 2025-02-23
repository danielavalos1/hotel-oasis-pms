import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    username: string;
    name: string;
    role: UserRole;
  }

  interface Session {
    user: User & {
      id: string;
    };
  }
}
