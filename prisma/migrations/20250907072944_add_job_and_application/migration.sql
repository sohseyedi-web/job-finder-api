-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
