import React, {FC, memo, useCallback, useEffect} from 'react'
import {AddItemForm} from 'common/components/AddItemForm/AddItemForm'
import {TodolistDomainType} from 'features/TodolistsList/todolists/todolists-reducer'
import {tasksThunks} from 'features/TodolistsList/tasks/tasks-reducer'
import {TaskType} from "features/TodolistsList/tasks/tasks-api";
import {useActions} from "common/hooks";
import {FilterTasksButtons} from "features/TodolistsList/todolists/Todolist/FilterTasksButtons/FilterTasksButtons";
import {Tasks} from "features/TodolistsList/todolists/Todolist/Tasks/Tasks";
import {TodolistTitle} from "features/TodolistsList/todolists/Todolist/TodolistTitle/TodolistTitle";

type Props = {
  todolist: TodolistDomainType
  tasks: Array<TaskType>
  demo?: boolean
}

export const Todolist: FC<Props> = memo(({demo = false, todolist, tasks}) => {
  const {fetchTasks, addTask} = useActions(tasksThunks)

  useEffect(() => {
    if (demo) {
      return
    }
    fetchTasks(todolist.id)
  }, [])

  const addTaskCallback = useCallback((title: string) => {
    addTask({title, todolistId: todolist.id})
  }, [addTask, todolist.id])

  return <>
    <TodolistTitle todolist={todolist}/>
    <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === 'loading'}/>
    <Tasks todolist={todolist} tasks={tasks}/>
    <div style={{paddingTop: '10px'}}>
      <FilterTasksButtons todolist={todolist}/>
    </div>
  </>
})


