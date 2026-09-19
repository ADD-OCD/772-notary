import "server-only";
import { getDb } from "@/lib/db";
import type { ValidRequest } from "./validation";

export type StoredRequest = ValidRequest & {
  reference: string;
  status: "RECEIVED";
  createdAt: Date;
};

export interface RequestStore {
  create(input: ValidRequest, reference: string): Promise<{ request: StoredRequest; created: boolean }>;
}

export const prismaRequestStore: RequestStore = {
  async create(input, reference) {
    const db = getDb();
    const existing = await db.notaryRequest.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return { request: existing as StoredRequest, created: false };
    try {
      const request = await db.notaryRequest.create({ data: { ...input, reference } });
      return { request: request as StoredRequest, created: true };
    } catch (error) {
      const duplicate = await db.notaryRequest.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (duplicate) return { request: duplicate as StoredRequest, created: false };
      throw error;
    }
  },
};
