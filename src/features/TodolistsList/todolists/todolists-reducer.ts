import {RequestStatusType} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsAPI, TodolistType} from "features/TodolistsList/todolists/todolists-api";
import {createAppAsyncThunk} from "common/utils";
import {clearTasksAndTodolists} from "common/actions/common-actions";
import {ResultCode} from "common/enums";


// const removeTodolist = createAppAsyncThunk<{ id: string }, string>
// ('todo/removeTodolist', async (todolistId, thunkAPI) => {
//   const {dispatch, rejectWithValue} = thunkAPI;
//   try {
//     dispatch(appActions.setAppStatus({status: 'loading'}))
//     //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//     dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, entityStatus: 'loading'}))
//     await todolistsAPI.deleteTodolist(todolistId)
//     dispatch(appActions.setAppStatus({status: 'succeeded'}))
//     return {id: todolistId}
//   } catch (e) {
//     handleServerNetworkError(e, dispatch);
//     return rejectWithValue(null)
//   }
// })

const removeTodolist = createAppAsyncThunk<{ id: string }, string>
('todo/removeTodolist', async (todolistId, {dispatch, rejectWithValue}) => {
  dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, entityStatus: 'loading'}))
  const res = await todolistsAPI.deleteTodolist(todolistId)
  if (res.data.resultCode === ResultCode.Success) {
    return {id: todolistId}
  } else {
    return rejectWithValue({data: res.data, showGlobalError: true})
  }
})

// const _addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>
// ('todo/addTodolist', async (title, thunkAPI) => {
//   const {dispatch, rejectWithValue} = thunkAPI;
//   return thunkTryCatch(thunkAPI, async () => {
//     const res = await todolistsAPI.createTodolist(title)
//     if (res.data.resultCode === ResultCode.Success) {
//       return {todolist: res.data.data.item}
//     } else {
//       //false - because the error is handled in AddItemForm
//       handleServerAppError(res.data, dispatch, false);
//       return rejectWithValue(res.data)
//     }
//   })
// })

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>
('todo/addTodolist', async (title, {rejectWithValue}) => {
  const res = await todolistsAPI.createTodolist(title)
  if (res.data.resultCode === ResultCode.Success) {
    return {todolist: res.data.data.item}
  } else {
    //передаем ошибку в addMatcher
    return rejectWithValue({data: res.data, showGlobalError: false})
  }
})

const changeTodolistTitle = createAppAsyncThunk<changeTodolistTitleArgType, changeTodolistTitleArgType>
('todo/changeTodolistTitle', async (arg, {rejectWithValue}) => {
  const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
  if (res.data.resultCode === ResultCode.Success) {
    return arg
  } else {
    return rejectWithValue({data: res.data, showGlobalError: true})
  }
})

// const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }>
// ('todo/fetchTodolists', async (atg, thunkAPI) => {
//   const {dispatch, rejectWithValue} = thunkAPI;
//   try {
//     dispatch(appActions.setAppStatus({status: 'loading'}))
//     const res = await todolistsAPI.getTodolists()
//     dispatch(appActions.setAppStatus({status: 'succeeded'}))
//     return {todolists: res.data}
//   } catch (e) {
//     handleServerNetworkError(e, dispatch);
//     return rejectWithValue(null)
//   }
// })

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }>
('todo/fetchTodolists', async () => {
  const res = await todolistsAPI.getTodolists()
  return {todolists: res.data}
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