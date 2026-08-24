// Session utilities for managing user sessions
import { NextApiRequest, NextApiResponse } from 'next'
import { TokenPayload } from './jwt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function setSessionCookie(res: NextApiResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
  )
}

export function clearSessionCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  )
}

export function getSessionFromRequest(req: NextApiRequest): TokenPayload | null {
  try {
    const cookies = req.headers.cookie
    if (!cookies) return null

    const authToken = cookies
      .split(';')
      .find((cookie) => cookie.trim().startsWith('auth_token='))
      ?.split('=')[1]

    if (!authToken) return null

    return jwt.verify(authToken, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}
