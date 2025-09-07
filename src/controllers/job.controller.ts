import { Request, Response } from 'express';
import { prisma } from '@/config/db';

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
      },
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        resumeUrl: profile.resumeUrl,
      },
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
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

    res.status(200).json({ message: 'Application status updated', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
