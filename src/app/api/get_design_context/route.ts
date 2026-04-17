import { NextResponse } from "next/server";
import { get_design_context } from "@/lib/design-context";

export async function GET() {
  return NextResponse.json({ designContext: get_design_context() });
}
