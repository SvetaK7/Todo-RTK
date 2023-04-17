import {Dispatch} from "redux";
import {appActions} from "app/app-reducer";
import {ResponseType} from "common/types/common-types";

/**
 * function that catch server error
 * @param data
 * @param dispatch
 * @param showError - flag indicating whether to display errors in the user interface
 */
export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
  if (showError) {
    dispatch(appActions.setAppError({error: data.messages.length ? data.messages[0] : 'Some error occurred'}))
  }
  dispatch(appActions.setAppStatus({status: 'failed'}))
}