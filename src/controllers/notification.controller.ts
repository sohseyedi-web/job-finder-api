import { Request, Response } from 'express';
import { prisma } from '@/config/db';
import { sendNotification } from '@/utils/functions';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, recipientId, type } = req.body;
    const user = (req as any).user;

    if (!title || !message || !recipientId || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const notification = await sendNotification({
      title,
      message,
      recipientId,
      type,
      senderId: user.id,
      senderName: user.fullName,
    });

    res.status(201).json({
      message: 'Notification sent successfully',
      data: notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
        senderName: true,
      },
    });

    res.status(200).json({ data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const updated = await prisma.notification.updateMany({
      where: { id, recipientId: user.id },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
