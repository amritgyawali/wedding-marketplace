import { NextRequest, NextResponse } from "next/server";
import { searchService } from "@/lib/search/service";
import { VendorSearchSchema } from "@/schemas/vendor";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params = Object.fromEntries(searchParams.entries());

  const parsed = VendorSearchSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search params" }, { status: 400 });
  }

  const results = await searchService.search(parsed.data);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
