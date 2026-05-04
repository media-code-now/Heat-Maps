import { NextResponse } from "next/server";

import {
  type ProjectBody,
  toProjectData,
  validateProjectBody,
} from "@/lib/project-validation";
import { getActiveUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { scans: true, keywords: true },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "Unable to load projects. Check DATABASE_URL and database availability." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: ProjectBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validationError = validateProjectBody(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...toProjectData(body),
        userId,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create project." }, { status: 500 });
  }
}
