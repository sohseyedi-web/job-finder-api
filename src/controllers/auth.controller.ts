import { NextFunction, Request, Response } from 'express';
import { pool } from '@/config/db';
import { IUser } from '@/types';
import { setAccessToken, setRefreshToken, verifyRefreshToken } from '@/utils/functions';
import bcrypt from 'bcrypt';

export const signup = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'fullName, email and password are required' });
      return;
    }

    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1 OR full_name=$2 LIMIT 1', [
      email,
      fullName,
    ]);
    if (exists.rowCount) {
      res.status(409).json({ message: 'another user with this email or fullName already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query<IUser>(
      `INSERT INTO users (full_name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, full_name AS "fullName", email, role, is_active, created_at, password`,
      [fullName, email, hashedPassword]
    );

    const user: IUser = result.rows[0];
    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    delete (user as any).password;

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const signin = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { fullName, password } = req.body;
    if (!fullName || !password) {
      res.status(400).json({ message: 'fullName & password required' });
      return;
    }

    const result = await pool.query<IUser>(
      `SELECT id, full_name AS "fullName", email, password, role, is_active, created_at, updated_at
       FROM users WHERE full_name=$1 LIMIT 1`,
      [fullName]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ message: 'Invalid fullName or password' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid fullName or password' });
      return;
    }

    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    delete (user as any).password;

    res.json({ message: 'Login successful', user });
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
    delete (user as any).password;

    res.status(200).json({ statusCode: 200, data: { user } });
  } catch (err) {
    res.status(401).json({ message: 'Please log in to your account.' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  const cookieOptions = {
    maxAge: 1,
    expires: new Date(0),
    httpOnly: true,
    signed: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.example.ir',
  };

  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  res.status(200).json({
    StatusCode: 200,
    roles: null,
    auth: false,
    message: 'Logout was successful',
  });
};
