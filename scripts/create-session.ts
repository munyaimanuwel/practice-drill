import "dotenv/config";
import { PrismaClient, SessionType, SessionStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const args = z
  .object({
    type: z.enum(["quiz", "code"]),
    title: z.string().min(1),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.coerce.number().int().min(1).max(5).default(3),
    minutes: z.coerce.number().int().min(1).default(45),
    when: z.string().optional(),
    status: z.nativeEnum(SessionStatus).default(SessionStatus.ready),
    payload: z.string().default("{}"),
  })
  .parse({
    type: process.env.CREATE_TYPE,
    title: process.env.CREATE_TITLE,
    summary: process.env.CREATE_SUMMARY,
    tags: (process.env.CREATE_TAGS ?? "").split(",").filter(Boolean),
    difficulty: process.env.CREATE_DIFFICULTY,
    minutes: process.env.CREATE_MINUTES,
    when: process.env.CREATE_WHEN,
    status: process.env.CREATE_STATUS,
    payload: process.env.CREATE_PAYLOAD,
  });

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found. Run `pnpm prisma db seed` first.");
    process.exit(1);
  }

  let payload: object = {};
  try {
    payload = JSON.parse(args.payload);
  } catch {
    console.error("CREATE_PAYLOAD must be valid JSON");
    process.exit(1);
  }

  const session = await prisma.drillSession.create({
    data: {
      type: args.type,
      title: args.title,
      summary: args.summary ?? null,
      topicTags: args.tags,
      difficulty: args.difficulty,
      timeLimitMinutes: args.minutes,
      scheduledFor: args.when ? new Date(args.when) : null,
      status: args.status,
      payload,
      userId: user.id,
    },
  });

  console.log(JSON.stringify({ id: session.id, status: session.status }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
