import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/brand/favicon.png", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/favicon.ico"],
};
