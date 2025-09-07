import JWT, { JwtPayload } from 'jsonwebtoken';
import { Response, Request } from 'express';
import createHttpError from 'http-errors';
import dotenv from 'dotenv';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '@/config/db';
import { SendNotificationInput } from '@/types';

dotenv.config();

function generateToken(user: User, expiresIn: '1d' | '1y', secret: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: JwtPayload = { id: user.id };
    JWT.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err || !token) return reject(new Error('Error creating token'));
      resolve(token);
    });
  });
}
export async function setAccessToken(res: Response, user: User) {
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

export async function setRefreshToken(res: Response, user: User) {
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

export async function verifyRefreshToken(req: Request): Promise<User> {
  const refreshToken = req.signedCookies['refreshToken'];
  if (!refreshToken) {
    throw createHttpError.Unauthorized('Please log in to your account.');
  }

  try {
    const payload = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY!) as JwtPayload;

    if (!payload || !payload.id) {
      throw createHttpError.Unauthorized('Token payload is invalid.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw createHttpError.Unauthorized('Account not found.');
    }

    return user;
  } catch (err) {
    throw createHttpError.Unauthorized('Please log in to your account.');
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const sendNotification = async ({
  title,
  message,
  recipientId,
  senderId,
  senderName,
  type,
}: SendNotificationInput) => {
  return await prisma.notification.create({
    data: {
      title,
      message,
      type,
      recipientId,
      senderId,
      senderName,
    },
  });
};
