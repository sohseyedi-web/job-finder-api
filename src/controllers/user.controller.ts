import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ statusCode: 404, message: 'User not found' });
      return;
    }

    let filteredProfile: any = null;

    if (user.profile) {
      if (user.role === 'USER') {
        const { city, phoneNumber, jobTitle, resumeUrl } = user.profile;
        filteredProfile = { city, phoneNumber, jobTitle, resumeUrl };
      } else if (user.role === 'OWNER') {
        const { companyName, companyCity, address, companyPhone, website, ownerPhone, logoUrl } =
          user.profile;
        filteredProfile = {
          companyName,
          companyCity,
          address,
          companyPhone,
          website,
          ownerPhone,
          logoUrl,
        };
      }
    }

    res.status(200).json({
      statusCode: 200,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: filteredProfile,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
};

export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const data = req.body;
    const file = (req as any).file;

    let filePath: string | null = null;
    if (file) {
      const fileUploadPath = (req as any).body.fileUploadPath;
      const filename = (req as any).body.filename;
      filePath = path.join(fileUploadPath, filename);
    }

    let profileData: any = {};

    if (user.role === 'USER') {
      const { jobTitle, city, phoneNumber } = data;
      if (!jobTitle || !city || !phoneNumber || !filePath) {
        res.status(400).json({
          statusCode: 400,
          message: 'jobTitle, city, phoneNumber و resume (PDF) Required',
        });
        return;
      }

      profileData = {
        jobTitle,
        city,
        phoneNumber,
        resumeUrl: filePath,
      };
    } else if (user.role === 'OWNER') {
      const { companyName, companyCity, address, companyPhone, website, ownerPhone } = data;
      if (
        !companyName ||
        !companyCity ||
        !address ||
        !companyPhone ||
        !website ||
        !ownerPhone ||
        !filePath
      ) {
        res.status(400).json({
          statusCode: 400,
          message:
            'companyName, companyCity, address, companyPhone, website, ownerPhone & logo Required ',
        });
        return;
      }

      profileData = {
        companyName,
        companyCity,
        address,
        companyPhone,
        website,
        ownerPhone,
        logoUrl: filePath,
      };
    } else {
      res.status(403).json({
        statusCode: 403,
        message: 'This role does not have permission to complete the profile',
      });
      return;
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    res.status(200).json({
      statusCode: 200,
      message: 'Profile completed successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const data = req.body;
    const file = (req as any).file;

    let filePath: string | null = null;
    if (file) {
      const fileUploadPath = (req as any).body.fileUploadPath;
      const filename = (req as any).body.filename;
      filePath = path.join(fileUploadPath, filename);
    }

    let profileData: any = {};

    if (user.role === 'USER') {
      const { jobTitle, city, phoneNumber } = data;
      profileData = {
        ...(jobTitle && { jobTitle }),
        ...(city && { city }),
        ...(phoneNumber && { phoneNumber }),
        ...(filePath && { resumeUrl: filePath }),
      };
    } else if (user.role === 'OWNER') {
      const { companyName, companyCity, address, companyPhone, website, ownerPhone } = data;
      profileData = {
        ...(companyName && { companyName }),
        ...(companyCity && { companyCity }),
        ...(address && { address }),
        ...(companyPhone && { companyPhone }),
        ...(website && { website }),
        ...(ownerPhone && { ownerPhone }),
        ...(filePath && { logoUrl: filePath }),
      };
    } else {
      res.status(403).json({
        statusCode: 403,
        message: 'This role does not have permission to update profiles',
      });
      return;
    }

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: profileData,
    });

    res.status(200).json({
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
};
