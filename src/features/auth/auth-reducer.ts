import {appActions} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";
import {handleServerAppError} from "common/utils/handleServerAppError";
import {handleServerNetworkError} from "common/utils/handleServerNetworkError";
import {authAPI, LoginParamsType} from "features/auth/auth-api";
import {clearTasksAndTodolists} from "common/actions/common-actions";
import {createAppAsyncThunk} from "common/utils";


const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>
('auth/login', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;

  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    const res = await authAPI.login(arg)
    if (res.data.resultCode === 0) {
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
      return {isLoggedIn: true}
    } else {
      handleServerAppError(res.data, dispatch, false)
      return rejectWithValue(res.data)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, void>
('auth/logout', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: 'loading'}))
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      dispatch(clearTasksAndTodolists())
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
      return {isLoggedIn: false}
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

const initializeApp = createAppAsyncThunk<{isLoggedIn: boolean}, void>
('app/initializeApp', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      return {isLoggedIn: true}
    } else {
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
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




