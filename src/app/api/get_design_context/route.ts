import { NextResponse } from "next/server";
import { getDesignContext } from "@/lib/design-context";

export function GET() {
  return NextResponse.json({ designContext: getDesignContext() });
}
