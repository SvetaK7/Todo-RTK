import {appActions} from 'app/app-reducer'
import {createSlice} from "@reduxjs/toolkit";
import {handleServerAppError} from "common/utils/handleServerAppError";
import {handleServerNetworkError} from "common/utils/handleServerNetworkError";
import {authAPI, LoginParamsType} from "features/auth/auth-api";
import {clearTasksAndTodolists} from "common/actions/common-actions";
import {createAppAsyncThunk} from "common/utils";
import {ResultCode} from "common/enums";


const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>
('auth/login', async (arg, {rejectWithValue}) => {
  const res = await authAPI.login(arg)
  if (res.data.resultCode === ResultCode.Success) {
    return {isLoggedIn: true}
  } else {
    const isShowError = !res.data.fieldsErrors.length
    return rejectWithValue({data: res.data, showGlobalError: isShowError})
  }
})

const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, void>
('auth/logout', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  const res = await authAPI.logout()
  if (res.data.resultCode === 0) {
    dispatch(clearTasksAndTodolists())
    return {isLoggedIn: false}
  } else {
    return rejectWithValue({data: res.data, showGlobalError: true})
  }
})

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, void>
('app/initializeApp', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      return {isLoggedIn: true}
    } else {
      return rejectWithValue({data: res.data, showGlobalError: false})
    }
  } finally {
    dispatch(appActions.setAppInitialized({isInitialized: true}));
  }
})


const slice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  }
})

export const authReducer = slice.reducer;
export const authThunks = {login, logout, initializeApp}




