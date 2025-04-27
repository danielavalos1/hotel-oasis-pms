import { prisma } from "@/lib/prisma";
import type { User, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "123456";

export const userService = {
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return prisma.user.create({ data: { ...data, passwordHash } });
  },

  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  },

  async getUser(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async resetPassword(userId: number): Promise<User> {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  async updateUser(userId: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data });
  },
};