import { pool } from '@/config/db';
import { IUser } from '@/types';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import JWT, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user: IUser;
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.signedCookies['accessToken'];
    if (!accessToken) {
      throw createHttpError.Unauthorized('Please log in to your account.');
    }
    const token = cookieParser.signedCookie(accessToken, process.env.COOKIE_PARSER_SECRET_KEY!);

    if (typeof token !== 'string') {
      throw createHttpError.Unauthorized('Token payload is invalid.');
    }
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY!, async (err, payload) => {
      try {
        if (err) throw createHttpError.Unauthorized('Token payload is invalid.');
        const { _id } = payload as JwtPayload;
        const result = await pool.query<IUser>(
          'SELECT id,  full_name AS "fullName", email, role, is_active, created_at FROM users WHERE id = $1',
          [_id]
        );
        if (result.rows.length === 0) {
          throw createHttpError.Unauthorized('Please log in to your account.');
        }

        (req as CustomRequest).user = result.rows[0];
        return next();
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export function decideAuthMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const accessToken = req.signedCookies['accessToken'];
  if (accessToken) {
    return verifyAccessToken(req, res, next);
  }
  // skip this middleware
  next();
}
