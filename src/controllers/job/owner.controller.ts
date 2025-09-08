import { Request, Response } from 'express';
import { prisma } from '@/config/db';
import { sendNotification } from '@/utils/functions';

export const createJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can create jobs' });
    }

    const { title, description, experience, salary, city, jobType, category } = req.body;

    if (!title || !description || !experience || !salary || !city || !jobType || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const job = await prisma.job.create({
      data: {
        title,
        description,
        experience,
        salary,
        city,
        jobType,
        category,
        ownerId: user.id,
        isActive: false,
        expiresAt,
      },
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.ownerId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.job.delete({ where: { id: jobId } });

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId } = req.params;
    const { title, description, experience, salary, city, jobType, category } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.ownerId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: title ?? job.title,
        description: description ?? job.description,
        experience: experience ?? job.experience,
        salary: salary ?? job.salary,
        city: city ?? job.city,
        jobType: jobType ?? job.jobType,
        category: category ?? job.category,
      },
    });

    res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: true },
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.ownerId !== user.id) return res.status(403).json({ message: 'Unauthorized' });

    res.status(200).json({ applications: job.applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOwnerJobLists = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can view their jobs' });
    }

    const jobs = await prisma.job.findMany({
      where: { ownerId: user.id },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found for this owner' });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { applicationId } = req.params;
    const { status } = req.body; // 0,1,2,3

    if (![0, 1, 2, 3].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.job.ownerId !== user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    const resultApplication =
      status == 0
        ? 'Pending'
        : status == 1
        ? 'Reviewed'
        : status == 2
        ? 'Rejected'
        : 'Interview approved';

    await sendNotification({
      title: 'Application Status Updated',
      message: `Your application for ${application.job.title} is now ${resultApplication}`,
      recipientId: application.userId,
      senderId: user.id,
      senderName: user.fullName,
      type: 'JOB',
    });

    res.status(200).json({ message: 'Application status updated', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
