import {appActions} from 'app/app-reducer'
import {createSlice} from "@reduxjs/toolkit";
import {todolistsThunk} from "features/TodolistsList/todolists/todolists-reducer";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {ResultCode, TaskPriorities, TaskStatuses} from "common/enums";
import {clearTasksAndTodolists} from "common/actions/common-actions";
import {thunkTryCatch} from "common/utils/thunk-try-catch";
import {
  AddTaskArgType,
  tasksApi,
  TaskType,
  UpdateTaskArgType,
  UpdateTaskModelType
} from "features/TodolistsList/tasks/tasks-api";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>
('tasks/fetchTasks', async (todolistId) => {
  const res = await tasksApi.getTasks(todolistId)
  const tasks = res.data.items
  return {tasks, todolistId}
})

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>
('tasks/addTask', async (arg, {rejectWithValue}) => {
  const res = await tasksApi.createTask(arg)
  if (res.data.resultCode === ResultCode.Success) {
    const task = res.data.data.item
    return {task}
  } else {
    return rejectWithValue({data: res.data, showGlobalError: false})
  }
})

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>
('tasks/updateTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue, getState} = thunkAPI;

  dispatch(appActions.setAppStatus({status: 'loading'}))
  const state = getState()
  const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
  if (!task) {
    dispatch(appActions.setAppError({error: 'Task not found in the state'}))
    return rejectWithValue(null)
  }

  const apiModel: UpdateTaskModelType = {
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    startDate: task.startDate,
    title: task.title,
    status: task.status,
    ...arg.domainModel
  }
  const res = await tasksApi.updateTask(arg.todolistId, arg.taskId, apiModel)
  if (res.data.resultCode === ResultCode.Success) {
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    return arg
  } else {
    return rejectWithValue({data: res.data, showGlobalError: true})
  }
})

export const removeTask = createAppAsyncThunk<removeTaskArgType, removeTaskArgType>
('tasks/removeTask', async (arg, {rejectWithValue}) => {
    const res = await tasksApi.deleteTask(arg.todolistId, arg.taskId);
    if (res.data.resultCode){
      return arg
    } else {
      return rejectWithValue({data: res.data, showGlobalError: true})
    }
})
// export const removeTaskTC = (taskId: string, todolistId: string): AppThunk => (dispatch) => {
//   todolistsAPI.deleteTask(todolistId, taskId)
//     .then(res => {
//       const action = tasksActions.removeTask({taskId, todolistId})
//       dispatch(action)
//     })
// }

const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
    //   const tasks = state[action.payload.todolistId];
    //   const index = tasks.findIndex(t => t.id === action.payload.taskId)
    //   if (index !== -1) tasks.splice(index, 1)
    // },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId];
        tasks.unshift(action.payload.task)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex(t => t.id === action.payload.taskId);
        if (index !== -1) {
          tasks[index] = {...tasks[index], ...action.payload.domainModel}
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex(t => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })

      .addCase(todolistsThunk.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsThunk.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsThunk.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach(tl => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists.type, () => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = {fetchTasks, addTask, updateTask, removeTask}

export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
export type removeTaskArgType = {
  taskId: string
  todolistId: string
}

