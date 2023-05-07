import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  status: "idle" as RequestStatusType,
  error: null as string | null,
  isInitialized: false,
};

export type AppInitialStateType = typeof initialState;
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status;
    },
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error;
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => {
          console.log("add matcher action", action);
          return action.type.endsWith("/pending");
        },
        (state, action) => {
          console.log("add matcher reducer");
          state.status = "loading";
        }
      )
      .addMatcher(
        (action) => {
          console.log("add matcher action", action);
          return action.type.endsWith("/rejected");
        },
        (state, action) => {
          // if (action.payload){
          //   state.error = action.payload.messages.length ? action.payload.messages[0] : 'Some error occurred'
          // } else {
          //   state.error = action.error.message ? action.error.message : 'Some error occurred'
          // }

          const { payload, error } = action;
          if (payload) {
            if (payload.showGlobalError) {
              state.error = payload.data.messages.length ? payload.data.messages[0] : "Some error occurred";
            }
          } else {
            state.error = error.message ? error.message : "Some error occurred";
          }
          state.status = "failed";
        }
      )
      .addMatcher(
        (action) => {
          console.log("add matcher action", action);
          return action.type.endsWith("/fulfilled");
        },
        (state, action) => {
          state.status = "succeeded";
        }
      );
  },
});

export const appReducer = slice.reducer;
export const appActions = slice.actions;
