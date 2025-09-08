import { prisma } from '@/config/db';
import { sendNotification } from '@/utils/functions';
import { Request, Response } from 'express';
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { search, city, category, sortBy, sortOrder } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: String(search), mode: 'insensitive' } },
                  { description: { contains: String(search), mode: 'insensitive' } },
                ],
              }
            : {},
          city ? { city: { equals: String(city), mode: 'insensitive' } } : {},
          category ? { category: { equals: String(category), mode: 'insensitive' } } : {},
        ],
      },
      orderBy: sortBy
        ? { [String(sortBy)]: sortOrder === 'desc' ? 'desc' : 'asc' }
        : { createdAt: 'desc' },
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJobDetail = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: false },
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.status(200).json({ job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const applyForJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'USER') {
      return res.status(403).json({ message: 'Only regular users can apply for jobs' });
    }

    const { jobId } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || !profile.resumeUrl) {
      return res.status(400).json({ message: 'User profile with resume is required' });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId: user.id,
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        resumeUrl: profile.resumeUrl,
      },
    });

    await sendNotification({
      title: 'New Job Application',
      message: `${user.fullName} applied for your job: ${job.title}`,
      recipientId: job.ownerId,
      senderId: user.id,
      senderName: user.fullName,
      type: 'JOB',
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyJobApplications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            city: true,
            jobType: true,
            category: true,
          },
        },
      },
    });

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'No job applications found' });
    }

    res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
