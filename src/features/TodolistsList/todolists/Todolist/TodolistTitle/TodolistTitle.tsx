import {EditableSpan} from "common/components";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import React, {FC, useCallback} from "react";
import {useActions} from "common/hooks";
import {TodolistDomainType, todolistsThunk} from "features/TodolistsList/todolists/todolists-reducer";

type Props = {
  todolist: TodolistDomainType
}
export const TodolistTitle: FC<Props> = ({todolist}) => {
  const {removeTodolist, changeTodolistTitle} = useActions(todolistsThunk)

  const removeTodolistHandler = () => {
    removeTodolist(todolist.id)
  }
  const changeTodolistTitleHandler = useCallback((title: string) => {
    changeTodolistTitle({id: todolist.id, title})
  }, [todolist.id, changeTodolistTitle])

  return (
    <h3>
      <EditableSpan value={todolist.title} onChange={changeTodolistTitleHandler}/>
      <IconButton onClick={removeTodolistHandler} disabled={todolist.entityStatus === 'loading'}>
        <Delete/>
      </IconButton>
    </h3>
)
}