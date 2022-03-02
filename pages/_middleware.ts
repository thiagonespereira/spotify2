import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(req: any) {
  // Token will exists if user is logged in
  const token = await getToken({ req, secret: process.env.JWT_SECRET || '' })

  const { pathname } = req.nextUrl

  // Allow the requests if the following is true...
  // 1. the token exists
  // 2. it's a request for next-auth session & provider fetching
  if (pathname.includes('/api/auth/') || token) {
    return NextResponse.next()
  }

  // Redirect to login pahe if they don't have token and are requesting a protected route
  if (!token && pathname !== '/login') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.rewrite(url)
  }
}
