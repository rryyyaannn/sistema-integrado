import { env } from '@/lib/env';
import type { Database } from '@si/types';
import { type CookieMethodsServer, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = '/login';
const AUTHENTICATED_HOME = '/app';
const PROTECTED_PREFIX = '/app';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      for (const { name, value } of cookiesToSet) {
        request.cookies.set(name, value);
      }
      response = NextResponse.next({ request });
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
    },
  };

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: cookieMethods },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isLogin = pathname === LOGIN_PATH;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_HOME;
    return NextResponse.redirect(url);
  }

  return response;
}
