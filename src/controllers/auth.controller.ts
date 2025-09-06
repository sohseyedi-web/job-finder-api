import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { setAccessToken, setRefreshToken, verifyRefreshToken } from '../utils/functions';
import { prisma } from '@/config/db';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'fullName, email and password are required' });
      return;
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { fullName }] },
    });

    if (exists) {
      res.status(409).json({ message: 'User with this email or name already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
      },
    });

    await setAccessToken(res, user);
    await setRefreshToken(res, user);

    const { ...safeUser } = user;
    res.status(201).json({ message: 'User registered successfully', user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'email & password required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    await setAccessToken(res, user);
    await setRefreshToken(res, user);

    const { ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await verifyRefreshToken(req);
    await setAccessToken(res, user);
    await setRefreshToken(res, user);

    const { ...safeUser } = user;
    res.status(200).json({ statusCode: 200, data: { user: safeUser } });
  } catch (err) {
    res.status(401).json({ message: 'Please log in to your account.' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  const cookieOptions = {
    maxAge: 1,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.example.ir',
  };

  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  res.status(200).json({
    statusCode: 200,
    roles: null,
    auth: false,
    message: 'Logout was successful',
  });
};
