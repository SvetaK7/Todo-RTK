import {appActions, RequestStatusType} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {handleServerNetworkError} from "common/utils/handleServerNetworkError";
import {todolistsAPI, TodolistType} from "features/TodolistsList/todolists-api";
import {createAppAsyncThunk} from "common/utils";
import {clearTasksAndTodolists} from "common/actions/common-actions";


const removeTodolist = createAppAsyncThunk<{ id: string }, string>
('todo/removeTodolist', async (todolistId, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, entityStatus: 'loading'}))
    await todolistsAPI.deleteTodolist(todolistId)
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    return {id: todolistId}
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>
('todo/addTodolist', async (title, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.createTodolist(title)
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    return {todolist: res.data.data.item}
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const changeTodolistTitle = createAppAsyncThunk<changeTodolistTitleArgType, changeTodolistTitleArgType>
('todo/changeTodolistTitle', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    await todolistsAPI.updateTodolist(arg.id, arg.title)
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    return arg
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const fetchTodolists = createAppAsyncThunk<{todolists: TodolistType[]}>
('todo/fetchTodolists', async (atg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.getTodolists()
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    return {todolists: res.data}
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.entityStatus = action.payload.entityStatus
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex(todo => todo.id === action.payload.id);
        if (index !== 1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'};
        state.unshift(newTodolist)
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const todo = state.find(todo => todo.id === action.payload.id)
        if (todo) {
          todo.title = action.payload.title
        }
      })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
      })
      .addCase(clearTasksAndTodolists.type, () => {
        return []
      })

  }
})

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunk = {removeTodolist, addTodolist, changeTodolistTitle, fetchTodolists}

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
type changeTodolistTitleArgType = {
  id: string
  title: string
}