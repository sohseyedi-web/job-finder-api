import { pool } from '@/config/db';
import { IUser } from '@/types';
import { Request, Response } from 'express';
import path from 'path';

interface CustomRequest extends Request {
  user: IUser;
}

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as CustomRequest).user;

  try {
    const query = {
      text: `
        SELECT id, full_name AS "fullName", email, is_active, role, job_title AS "jobTitle", city , resume , phone_number , created_at, updated_at
        FROM users WHERE id = $1
      `,
      values: [userId],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
      });
      return;
    }

    const user = result.rows[0];

    res.status(200).json({
      statusCode: 200,
      data: { user },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
};

export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as CustomRequest).user;
  const file = (req as any).file;
  const { jobTitle, city, phoneNumber } = req.body;

  try {
    let resumePath: string | null = null;

    if (file) {
      const fileUploadPath = (req as any).body.fileUploadPath;
      const filename = (req as any).body.filename;
      resumePath = path.join(fileUploadPath, filename);
    }

    if (!jobTitle || !city || !phoneNumber || !resumePath) {
      res.status(400).json({
        statusCode: 400,
        message: 'jobTitle, city, phoneNumber and resume are required',
      });
      return;
    }

    const result = await pool.query(
      `
      UPDATE users
      SET job_title = $1,
          city = $2,
          phone_number = $3,
          resume = $4,
          is_active = true,
          updated_at = NOW()
      WHERE id = $5
      RETURNING id,  full_name AS "fullName", email, city, phone_number, job_title, resume, is_active, role, created_at, updated_at
      `,
      [jobTitle, city, phoneNumber, resumePath, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Profile completed successfully',
      data: { user: result.rows[0] },
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = (req as CustomRequest).user;
  const { fullName, email, jobTitle, city, phoneNumber } = req.body;
  const file = (req as any).file;

  try {
    let resumePath: string | null = null;
    if (file) {
      const fileUploadPath = (req as any).body.fileUploadPath;
      const filename = (req as any).body.filename;
      resumePath = path.join(fileUploadPath, filename);
    }

    if (!fullName && !email && !jobTitle && !city && !phoneNumber && !file) {
      res.status(400).json({
        statusCode: 400,
        message: 'No fields to update',
      });
      return;
    }

    if (email) {
      const exists = await pool.query(`SELECT 1 FROM users WHERE email = $1 AND id <> $2 LIMIT 1`, [
        email,
        userId,
      ]);
      if (exists.rowCount && exists.rowCount > 0) {
        res.status(409).json({
          statusCode: 409,
          message: 'This email is already in use by another user',
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          job_title = COALESCE($3, job_title),
          city = COALESCE($4, city),
          phone_number = COALESCE($5, phone_number),
          resume = COALESCE($6, resume),
          updated_at = NOW()
      WHERE id = $7
      RETURNING
        id,
        full_name AS "fullName",
        email,
        city,
        phone_number AS "phoneNumber",
        job_title AS "jobTitle",
        resume,
        is_active,
        role,
        created_at,
        updated_at
      `,
      [
        fullName || null,
        email || null,
        jobTitle || null,
        city || null,
        phoneNumber || null,
        resumePath,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { user: result.rows[0] },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
};
