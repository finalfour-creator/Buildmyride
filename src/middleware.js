import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, href } = request.nextUrl;
  console.log(`[REQUEST] ${request.method} ${pathname}`);
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
