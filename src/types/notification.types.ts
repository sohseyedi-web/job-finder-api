export interface SendNotificationInput {
  title: string;
  message: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'SYSTEM' | 'JOB' | 'TICKET';
}

export interface INotification {
  title: string;
  message: string;
  recipient: string;
  sender: string;
  senderId: string;
  isRead?: boolean;
  type: 'SYSTEM' | 'JOB' | 'TICKET';
  createdAt?: Date;
  updatedAt?: Date;
}
