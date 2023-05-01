import React, {FC, memo, useCallback, useEffect} from 'react'
import {AddItemForm} from 'common/components/AddItemForm/AddItemForm'
import {EditableSpan} from 'common/components/EditableSpan/EditableSpan'
import {Task} from 'features/TodolistsList/todolists/Todolist/Task/Task'
import {TodolistDomainType, todolistsThunk} from 'features/TodolistsList/todolists/todolists-reducer'
import {tasksThunks} from 'features/TodolistsList/tasks/tasks-reducer'
import {IconButton} from '@mui/material'
import {Delete} from '@mui/icons-material'
import {TaskStatuses} from "common/enums";
import {TaskType} from "features/TodolistsList/tasks/tasks-api";
import {useActions} from "common/hooks";
import {FilterTasksButtons} from "features/TodolistsList/todolists/Todolist/FilterTasksButtons/FilterTasksButtons";

type Props = {
  todolist: TodolistDomainType
  tasks: Array<TaskType>
  demo?: boolean
}

export const Todolist: FC<Props> = memo(({demo = false, todolist, tasks}) => {

  const {fetchTasks, addTask} = useActions(tasksThunks)
  const {removeTodolist, changeTodolistTitle} = useActions(todolistsThunk)


  useEffect(() => {
    if (demo) {
      return
    }
    fetchTasks(todolist.id)
  }, [])

  const addTaskCallback = useCallback((title: string) => {
    addTask({title, todolistId: todolist.id})
  }, [addTask, todolist.id])

  const removeTodolistHandler = () => {
    removeTodolist(todolist.id)
  }
  const changeTodolistTitleHandler = useCallback((title: string) => {
    changeTodolistTitle({id: todolist.id, title})
  }, [todolist.id, changeTodolistTitle])

  let tasksForTodolist = tasks

  if (todolist.filter === 'active') {
    tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.New)
  }
  if (todolist.filter === 'completed') {
    tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.Completed)
  }

  return <div>
    <h3><EditableSpan value={todolist.title} onChange={changeTodolistTitleHandler}/>
      <IconButton onClick={removeTodolistHandler} disabled={todolist.entityStatus === 'loading'}>
        <Delete/>
      </IconButton>
    </h3>
    <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === 'loading'}/>
    <div>
      {
        tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={todolist.id}/>)
      }
    </div>
    <div style={{paddingTop: '10px'}}>
      <FilterTasksButtons todolist={todolist}/>
    </div>
  </div>
})


