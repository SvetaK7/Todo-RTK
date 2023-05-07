import { Task } from "features/TodolistsList/todolists/Todolist/Tasks/Task/Task";
import React, { FC } from "react";
import { TaskStatuses } from "common/enums";
import { TaskType } from "features/TodolistsList/tasks/tasks-api";
import { TodolistDomainType } from "features/TodolistsList/todolists/todolists-reducer";

type Props = {
  todolist: TodolistDomainType;
  tasks: Array<TaskType>;
};

export const Tasks: FC<Props> = ({ tasks, todolist }) => {
  let tasksForTodolist = tasks;

  if (todolist.filter === "active") {
    tasksForTodolist = tasks.filter((t) => t.status === TaskStatuses.New);
  }
  if (todolist.filter === "completed") {
    tasksForTodolist = tasks.filter((t) => t.status === TaskStatuses.Completed);
  }

  return (
    <>
      {tasksForTodolist.map((t) => (
        <Task key={t.id} task={t} todolistId={todolist.id} />
      ))}
    </>
  );
};
