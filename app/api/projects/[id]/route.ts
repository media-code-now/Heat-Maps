import { NextResponse } from "next/server";

import { getActiveUserId } from "@/lib/auth";
import { toProjectData, validateProjectBody } from "@/lib/project-validation";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId },
      include: {
        scans: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { keyword: true },
        },
        keywords: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Unable to load project." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body;

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
    const existingProject = await prisma.project.findFirst({
      where: { id: params.id, userId },
      select: { id: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data: toProjectData(body),
    });

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Unable to update project." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await prisma.project.deleteMany({
      where: { id: params.id, userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete project." }, { status: 500 });
  }
}
