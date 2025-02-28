"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const getNotifications = async () => {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    return [];
  }
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark notifications as read" };
  }
};

export const getNotificationsCount = async () => {
  try {
    const userId = await getDbUserId();

    if (!userId) return 0;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
    });

    revalidatePath("/notifications");
    return notifications.length;
  } catch (error) {
    return 0;
  }
};
