'use client';

import { useState } from 'react';
import { type Todo } from '@/lib/schema';
import { toggleTodo, deleteTodo, createTodoFormAction } from '@/app/todos/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
      <span className="ml-2">Add</span>
    </Button>
  );
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic UI
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    const result = await toggleTodo(id, completed);
    if (!result.success) {
      // Revert on error
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDelete = async (id: string) => {
    const original = [...todos];
    setTodos(prev => prev.filter(t => t.id !== id));
    const result = await deleteTodo(id);
    if (!result.success) {
      setTodos(original);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form 
          action={async (formData) => {
            const content = formData.get('content') as string;
            if (!content) return;
            
            // Add to UI optimistically if you want, but server-side revalidation is usually enough
            await createTodoFormAction(formData);
            // Form resets naturally with server actions in Next.js 15 if implemented correctly
            // but we might need to clear manual state if we had any
          }} 
          className="flex gap-2"
        >
          <Input 
            name="content" 
            placeholder="What needs to be done?" 
            required 
            autoComplete="off"
          />
          <SubmitButton />
        </form>

        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tasks yet!</p>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo.id} 
                className="flex items-center justify-between p-2 border rounded-lg group transition-all hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={todo.completed} 
                    onCheckedChange={(checked) => handleToggle(todo.id, !!checked)}
                  />
                  <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
                    {todo.content}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

