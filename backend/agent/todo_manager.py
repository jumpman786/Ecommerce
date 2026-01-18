"""
Todo manager for tracking agent tasks.
"""
from typing import Any, Literal, Optional
from pydantic import BaseModel
import uuid


class TodoItem(BaseModel):
    """A single todo item in the agent's plan."""
    id: str
    task: str
    status: Literal["pending", "in_progress", "completed", "failed"] = "pending"
    result: Optional[Any] = None
    error: Optional[str] = None


class TodoManager:
    """Manages the agent's todo list."""

    def __init__(self):
        self.todos: list[TodoItem] = []

    def create_from_plan(self, steps: list[str]) -> list[TodoItem]:
        """Create todos from a plan's steps."""
        self.todos = [
            TodoItem(
                id=f"step_{i}_{uuid.uuid4().hex[:6]}",
                task=step,
                status="pending",
            )
            for i, step in enumerate(steps)
        ]
        return self.todos

    def get_todos(self) -> list[TodoItem]:
        """Get all todos."""
        return self.todos

    def get_pending(self) -> list[TodoItem]:
        """Get pending todos."""
        return [t for t in self.todos if t.status == "pending"]

    def get_next(self) -> Optional[TodoItem]:
        """Get the next pending todo."""
        pending = self.get_pending()
        return pending[0] if pending else None

    def mark_in_progress(self, todo_id: str) -> Optional[TodoItem]:
        """Mark a todo as in progress."""
        for todo in self.todos:
            if todo.id == todo_id:
                todo.status = "in_progress"
                return todo
        return None

    def mark_completed(self, todo_id: str, result: Any = None) -> Optional[TodoItem]:
        """Mark a todo as completed."""
        for todo in self.todos:
            if todo.id == todo_id:
                todo.status = "completed"
                todo.result = result
                return todo
        return None

    def mark_failed(self, todo_id: str, error: str) -> Optional[TodoItem]:
        """Mark a todo as failed."""
        for todo in self.todos:
            if todo.id == todo_id:
                todo.status = "failed"
                todo.error = error
                return todo
        return None

    def add_todo(self, task: str, insert_after: Optional[str] = None) -> TodoItem:
        """Add a new todo, optionally after a specific todo."""
        new_todo = TodoItem(
            id=f"step_new_{uuid.uuid4().hex[:6]}",
            task=task,
            status="pending",
        )

        if insert_after:
            for i, todo in enumerate(self.todos):
                if todo.id == insert_after:
                    self.todos.insert(i + 1, new_todo)
                    return new_todo

        self.todos.append(new_todo)
        return new_todo

    def remove_todo(self, todo_id: str) -> bool:
        """Remove a todo."""
        for i, todo in enumerate(self.todos):
            if todo.id == todo_id:
                self.todos.pop(i)
                return True
        return False

    def is_complete(self) -> bool:
        """Check if all todos are done (completed or failed)."""
        return all(t.status in ("completed", "failed") for t in self.todos)

    def get_summary(self) -> dict[str, Any]:
        """Get a summary of todo progress."""
        total = len(self.todos)
        completed = sum(1 for t in self.todos if t.status == "completed")
        failed = sum(1 for t in self.todos if t.status == "failed")
        pending = sum(1 for t in self.todos if t.status == "pending")
        in_progress = sum(1 for t in self.todos if t.status == "in_progress")

        return {
            "total": total,
            "completed": completed,
            "failed": failed,
            "pending": pending,
            "in_progress": in_progress,
            "progress_percent": (completed / total * 100) if total > 0 else 0,
        }

    def to_dict_list(self) -> list[dict[str, Any]]:
        """Convert todos to list of dicts for serialization."""
        return [t.model_dump() for t in self.todos]
