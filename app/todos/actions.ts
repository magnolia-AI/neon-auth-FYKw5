'use server';

import db from '@/lib/db';
import { todos } from '@/lib/schema';
import { authServer } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type ActionResult<T = any> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export async function createTodo(content: string): Promise<ActionResult> {
  const result = await authServer.getSession();
  if (result.error || !result.data?.user) return { success: false, error: 'Unauthorized' };

  try {
    const [newTodo] = await db.insert(todos).values({
      content,
      userId: result.data.user.id,
    }).returning();
    
    revalidatePath('/');
    return { success: true, data: newTodo };
  } catch (e) {
    return { success: false, error: 'Failed to create todo' };
  }
}

export async function createTodoFormAction(formData: FormData) {
  const content = formData.get('content') as string;
  if (!content) return { error: 'Content is required' };
  
  const result = await createTodo(content);
  if (result.success === false) return { error: result.error };
}

export async function toggleTodo(id: string, completed: boolean): Promise<ActionResult> {
  const result = await authServer.getSession();
  if (result.error || !result.data?.user) return { success: false, error: 'Unauthorized' };

  try {
    await db.update(todos)
      .set({ completed })
      .where(and(eq(todos.id, id), eq(todos.userId, result.data.user.id)));
    
    revalidatePath('/');
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: 'Failed to update todo' };
  }
}

export async function deleteTodo(id: string): Promise<ActionResult> {
  const result = await authServer.getSession();
  if (result.error || !result.data?.user) return { success: false, error: 'Unauthorized' };

  try {
    await db.delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, result.data.user.id)));
    
    revalidatePath('/');
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: 'Failed to delete todo' };
  }
}

