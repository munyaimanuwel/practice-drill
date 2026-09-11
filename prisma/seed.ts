import "dotenv/config";
import { PrismaClient, SessionStatus, SessionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { makeZip } from "../lib/makeZip";
import { ensureStorageDirs, starterPathFor } from "../lib/storage";

const prisma = new PrismaClient();

async function collectFiles(dir: string, base: string, out: Array<{ path: string; data: Buffer }>) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(full, rel, out);
    } else {
      out.push({ path: rel, data: await readFile(full) });
    }
  }
}

async function buildStarterZip(): Promise<Buffer> {
  const fixtureDir = path.join(process.cwd(), "fixtures", "sample-starter");
  const files: Array<{ path: string; data: Buffer }> = [];
  await collectFiles(fixtureDir, "", files);
  if (files.length === 0) throw new Error("fixtures/sample-starter is empty");
  return makeZip(files.map((f) => ({ path: f.path.replace(/\\/g, "/"), data: f.data })));
}

const QUIZ_SESSION_ID = "11111111-1111-4111-8111-111111111111";
const CODE_SESSION_ID = "22222222-2222-4222-8222-222222222222";

async function main() {
  await ensureStorageDirs();

  const email = (process.env.SEED_USER_EMAIL ?? "admin@localhost").toLowerCase();
  const password = process.env.SEED_USER_PASSWORD ?? "change-me-now";
  const name = process.env.SEED_USER_NAME ?? "Admin";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: await bcrypt.hash(password, 12) },
    create: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      isAdmin: true,
    },
  });

  // Demo quiz — original generic C# / Docker prompts (not from any employer).
  const quiz = await prisma.drillSession.upsert({
    where: { id: QUIZ_SESSION_ID },
    update: {},
    create: {
      id: QUIZ_SESSION_ID,
      type: SessionType.quiz,
      status: SessionStatus.ready,
      title: "Quiz — C# & Docker",
      summary: "Async/await, dependency injection, and Docker fundamentals.",
      topicTags: ["csharp", "docker"],
      difficulty: 3,
      timeLimitMinutes: 40,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: user.id,
      payload: {
        questions: [
          {
            id: "q1",
            prompt:
              "Explain the difference between async/await and Task.Run for I/O-bound work. When would you pick one over the other?",
            kind: "text",
            topic: "csharp",
            points: 10,
          },
          {
            id: "q2",
            prompt:
              "What is the lifetime of a scoped service in ASP.NET Core DI, and how does it differ from transient and singleton? Give a real example of when each is appropriate.",
            kind: "text",
            topic: "csharp",
            points: 10,
          },
          {
            id: "q3",
            prompt:
              "Explain how Docker layers work and why the order of instructions in a Dockerfile matters for build caching.",
            kind: "text",
            topic: "docker",
            points: 10,
          },
          {
            id: "q4",
            prompt:
              "Your container can't reach a service on the host at localhost. What are the likely causes and how do you fix them?",
            kind: "text",
            topic: "docker",
            points: 10,
          },
          {
            id: "q5",
            prompt:
              "Describe how you would deploy a .NET 8 API with a Postgres dependency using docker-compose, including health checks and secrets.",
            kind: "text",
            topic: "csharp",
            points: 10,
          },
        ],
      },
    },
  });

  // Code session — tiny C# console, starter zip from fixture.
  const starterZip = await buildStarterZip();
  const starterPath = starterPathFor(CODE_SESSION_ID);
  await mkdir(path.dirname(starterPath), { recursive: true });
  await writeFile(starterPath, starterZip);

  const code = await prisma.drillSession.upsert({
    where: { id: CODE_SESSION_ID },
    update: {},
    create: {
      id: CODE_SESSION_ID,
      type: SessionType.code,
      status: SessionStatus.ready,
      title: "Code — String Calculator (C#)",
      summary: "Public TDD kata (String Calculator): implement Add() with newline separators and negative-number rejection.",
      topicTags: ["csharp", "tdd"],
      difficulty: 2,
      timeLimitMinutes: 60,
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      userId: user.id,
      starterPath,
      payload: {
        brief_markdown: `## Task

Build a C# console app that implements a **StringCalculator** with a static \`Add(string input)\` method.

Requirements:

1. \`Add("")\` returns \`0\`
2. \`Add("1")\` returns \`1\`
3. \`Add("1,2")\` returns \`3\`
4. \`Add\` handles newlines as separators: \`Add("1\\n2,3")\` returns \`6\`
5. \`Add\` throws with message \`negatives not allowed: -1,-2\` when negatives are present

The starter project includes a passing skeleton and an xUnit test suite.`,
        rubric_markdown: `- Compiles with \`dotnet build\`
- All xUnit tests pass with \`dotnet test\`
- No external packages beyond the starter's
- \`Calculator.Add\` handles empty, single, comma, newline, and negative cases`,
        language: "csharp",
        hints: ["Split on separators, then parse ints.", "Collect negatives and throw one exception with all of them."],
      },
    },
  });

  console.log("Seed complete:");
  console.log(`  user:   ${user.email} (admin: ${user.isAdmin})`);
  console.log(`  quiz:   ${quiz.id} — "${quiz.title}" (${quiz.status})`);
  console.log(`  code:   ${code.id} — "${code.title}" (${code.status})`);
  console.log(`  starter: ${starterPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
