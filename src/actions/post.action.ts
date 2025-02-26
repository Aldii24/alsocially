"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, image: string) => {
  try {
    const authorId = await getDbUserId();

    if (!authorId) return;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create a post");
  }
};

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log("Error to get posts", error);
    return [];
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // Like and create notification for that user who created the post
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),

        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  postId,
                  creatorId: userId,
                },
              }),
            ]
          : []),
      ]);
    }
  } catch (error) {
    throw new Error("Failed to toggle like");
  }
};

export const createComment = async (postId: string, content: string) => {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification for that user who created the post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            postId,
            creatorId: userId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");

    return { success: true, comment };
  } catch (error) {
    return { success: false, error };
  }
};

export const deletePost = async (postId: string) => {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    if (post.authorId !== userId)
      throw new Error("Unauthorized, no delete permission");

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete this post" };
  }
};
