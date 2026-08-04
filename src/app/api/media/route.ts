import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePresignedUploadUrl, getPublicUrl } from "@/lib/s3";
import { getMediaLimit } from "@/lib/features";
import { z } from "zod";

const Schema = z.object({
  fileName: z.string(),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)|video\/(mp4|mov)$/),
  isCover: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true, media: { select: { id: true } } },
  });
  if (!vendor) return NextResponse.json({ error: "No vendor profile" }, { status: 400 });

  const limit = getMediaLimit(vendor.subscription?.tier ?? "FREE");
  if (vendor.media.length >= limit) {
    return NextResponse.json({ error: `Media limit reached (${limit} files)` }, { status: 429 });
  }

  const ext = parsed.data.fileName.split(".").pop();
  const key = `vendors/${vendor.id}/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = await generatePresignedUploadUrl(key, parsed.data.contentType);
  const publicUrl = getPublicUrl(key);

  const mediaType = parsed.data.contentType.startsWith("video") ? "VIDEO" : "IMAGE";

  const asset = await prisma.mediaAsset.create({
    data: {
      vendorId: vendor.id,
      type: mediaType,
      url: publicUrl,
      s3Key: key,
      isCover: parsed.data.isCover ?? false,
      sortOrder: vendor.media.length,
    },
  });

  return NextResponse.json({ uploadUrl, asset });
}
