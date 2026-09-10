import type { TaskAssignee } from '@/types/task';

export interface CommentItem {
  id: string;
  body: string;
  taskId: string;
  author: TaskAssignee;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentListResponse {
  comments: CommentItem[];
}