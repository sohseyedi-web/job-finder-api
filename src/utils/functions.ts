import JWT, { JwtPayload } from 'jsonwebtoken';
import { Response, Request } from 'express';
import createHttpError from 'http-errors';
import dotenv from 'dotenv';
import { pool } from '@/config/db';
import { IUser } from '@/types';

dotenv.config();

function generateToken(user: IUser, expiresIn: '1d' | '1y', secret: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: JwtPayload = { _id: user.id };

    JWT.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err || !token) return reject(new Error('خطا در ساخت توکن'));
      resolve(token);
    });
  });
}

export async function setAccessToken(res: Response, user: IUser) {
  const token = await generateToken(user, '1d', process.env.ACCESS_TOKEN_SECRET_KEY!);

  res.cookie('accessToken', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.example.ir',
  });
}

export async function setRefreshToken(res: Response, user: IUser) {
  const token = await generateToken(user, '1y', process.env.REFRESH_TOKEN_SECRET_KEY!);

  res.cookie('refreshToken', token, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.example.ir',
  });
}

export async function verifyRefreshToken(req: Request) {
  const refreshToken = req.signedCookies['refreshToken'];
  if (!refreshToken) {
    throw createHttpError.Unauthorized('Please log in to your account.');
  }

  try {
    const payload = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY!) as JwtPayload;

    if (!payload || !payload._id) {
      throw createHttpError.Unauthorized('Token payload is invalid.');
    }

    const { rows } = await pool.query<IUser>(
      'SELECT id, username, email, role, is_active FROM users WHERE id = $1 LIMIT 1',
      [payload._id]
    );

    const user = rows[0];

    if (!user) {
      throw createHttpError.Unauthorized('Account not found.');
    }

    return user;
  } catch (err) {
    throw createHttpError.Unauthorized('Please log in to your account.');
  }
}
