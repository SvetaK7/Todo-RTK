import {appActions, RequestStatusType} from 'app/app-reducer'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {handleServerNetworkError} from "common/utils/handleServerNetworkError";
import {todolistsAPI, TodolistType} from "features/TodolistsList/todolists-api";
import {createAppAsyncThunk} from "common/utils";


const removeTodolist = createAppAsyncThunk<{id: string}, string>
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


const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.title = action.payload.title
      }
    },
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
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
    }
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

  }
})

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunk = {removeTodolist, addTodolist}

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    todolistsAPI.getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({todolists: res.data}))
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
      })
      .catch(error => {
        handleServerNetworkError(error, dispatch);
      })
  }
}


export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title)
      .then((res) => {
        dispatch(todolistsActions.changeTodolistTitle({id, title}))
      })
  }
}

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
