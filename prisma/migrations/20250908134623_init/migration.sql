-- CreateTable
CREATE TABLE "public"."StatusChange" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "applicationId" TEXT,
    "oldStatus" INTEGER NOT NULL,
    "newStatus" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."StatusChange" ADD CONSTRAINT "StatusChange_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusChange" ADD CONSTRAINT "StatusChange_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
