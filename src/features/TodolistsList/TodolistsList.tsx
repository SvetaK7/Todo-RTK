import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    FilterValuesType,
    todolistsActions, todolistsThunk
} from './todolists-reducer'
import {tasksThunks} from './tasks-reducer'
import { Grid, Paper } from '@mui/material'
import { Todolist } from './Todolist/Todolist'
import { Navigate } from 'react-router-dom'
import {selectIsLoggedIn} from "features/auth/auth-selectors";
import {selectTask} from "features/TodolistsList/tasks-selectors";
import {selectTodolists} from "features/TodolistsList/todolists-selectors";
import {useAppDispatch} from "common/hooks";
import {AddItemForm} from "common/components";
import {TaskStatuses} from "common/enums";
import {useActions} from "common/hooks/useActions";

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {

    const todolists = useSelector(selectTodolists)
    const tasks = useSelector(selectTask)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const dispatch = useAppDispatch()

    const {addTask: attTaskTC, removeTask: removeTaskTC, updateTask, fetchTasks} = useActions(tasksThunks)
    const {changeTodolistFilter} = useActions(todolistsActions)
    const {addTodolist: addTodolistTC,
        removeTodolist: removeTodolistTC,
        fetchTodolists,
        changeTodolistTitle: changeTodolistTitleTC} = useActions(todolistsThunk)

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
			fetchTodolists()
    }, [])

    const removeTask = useCallback(function (taskId: string, todolistId: string) {
        removeTaskTC({taskId, todolistId})
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        attTaskTC({title, todolistId})
    }, [])

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        updateTask({taskId, domainModel: {status}, todolistId})
    }, [])

    const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
        updateTask({taskId, domainModel: {title}, todolistId})
    }, [])

    const changeFilter = useCallback(function (filter: FilterValuesType, todolistId: string) {
       changeTodolistFilter({id: todolistId, filter})
    }, [])

    const removeTodolist = useCallback(function (id: string) {
        removeTodolistTC(id)
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        changeTodolistTitleTC({id, title})
    }, [])

    const addTodolist = useCallback((title: string) => {
        addTodolistTC(title)
    }, [dispatch])

    if (!isLoggedIn) {
        return <Navigate to={"/login"} />
    }

    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolist}/>
        </Grid>
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
