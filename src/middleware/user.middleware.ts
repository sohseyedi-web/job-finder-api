import { prisma } from '@/config/db';
import { IUser } from '@/types';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import JWT, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user: IUser;
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.signedCookies['accessToken'];
    if (!token) throw createHttpError.Unauthorized('Please log in to your account.');

    let payload: JwtPayload;
    try {
      payload = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY!) as JwtPayload;
    } catch (err) {
      throw createHttpError.Unauthorized('Token payload is invalid.');
    }

    if (!payload.id) throw createHttpError.Unauthorized('Token payload is invalid.');

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) throw createHttpError.Unauthorized('User not found.');

    (req as CustomRequest).user = user as IUser;
    next();
  } catch (error) {
    next(error);
  }
};

export function decideAuthMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const accessToken = req.signedCookies['accessToken'];
  if (accessToken) {
    return verifyAccessToken(req, res, next);
  }
  next();
}
