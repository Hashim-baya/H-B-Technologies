import { NextRequest, NextResponse } from "next/server";

import {
  getCleanPathname,
  isLegacyEncodedExternalBlogPath,
  shouldCleanPathname,
} from "@/lib/url-governance";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isLegacyEncodedExternalBlogPath(pathname)) {
    return new NextResponse(
      "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>410 Gone</title></head><body><main><h1>410 Gone</h1><p>This duplicate external article URL has been removed.</p></main></body></html>",
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }

  if (shouldCleanPathname(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = getCleanPathname(pathname);
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|mp4|webmanifest)$).*)",
  ],
};
