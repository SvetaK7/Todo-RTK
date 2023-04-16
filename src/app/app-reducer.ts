import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  status: 'idle' as RequestStatusType,
  error: null as string | null,
  isInitialized: false
}

export type AppInitialStateType = typeof initialState;
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    }

  }
})

export const appReducer = slice.reducer;
export const appActions = slice.actions;


