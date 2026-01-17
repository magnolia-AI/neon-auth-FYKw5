import db from '@/lib/db';
import { todos } from '@/lib/schema';
import { authServer } from '@/lib/auth/server';
import { desc, eq } from 'drizzle-orm';
import { TodoList } from '@/components/todo-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const result = await authServer.getSession();
  const session = !result.error && result.data?.user ? result.data : null;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to TodoApp</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          A secure, simple way to manage your tasks. Sign in to get started.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(desc(todos.createdAt));

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
        <p className="text-muted-foreground">Manage your daily tasks efficiently.</p>
      </div>
      <TodoList initialTodos={userTodos} />
    </div>
  );
}

