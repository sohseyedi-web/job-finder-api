import { Request, Response } from 'express';
import { prisma } from '@/config/db';
import { HTTP_STATUS } from '@/config/constant';
import { sendNotification } from '@/utils/functions';

export const changeActiveOwnerJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (user.role !== 'EMPLOYEE') {
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Only employees can change job status' });
    }

    const { jobId, isActive, messsage } = req.body;

    if (!jobId || typeof isActive !== 'boolean') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'jobId and isActive are required' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Job not found' });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive },
    });

    await prisma.statusChange.create({
      data: {
        employeeId: user.id,
        applicationId: job?.id,
        oldStatus: job?.isActive ? 1 : 0,
        newStatus: isActive ? 1 : 0,
        message: messsage || 'وضعیت آگهی شما تغییر پیدا کرد',
      },
    });

    await sendNotification({
      title: 'Job Status Updated',
      message: messsage || '',
      recipientId: job?.ownerId as string,
      senderId: user.id,
      senderName: 'JOB_FINDER_SUPPORT',
      type: 'SYSTEM',
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Job status updated', job: updatedJob });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

export const getProcessesLists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, role } = (req as any).user;

    if (role !== 'EMPLOYEE') {
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { statusChanges: true },
    });

    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ statusCode: HTTP_STATUS.NOT_FOUND, message: 'User not found' });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        processes: user.statusChanges,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res
      .status(500)
      .json({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Internal server error' });
  }
};
