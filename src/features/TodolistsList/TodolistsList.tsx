import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { todolistsThunk } from "features/TodolistsList/todolists/todolists-reducer";
import { Grid, Paper } from "@mui/material";
import { Todolist } from "features/TodolistsList/todolists/Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { selectIsLoggedIn } from "features/auth/auth-selectors";
import { selectTask } from "features/TodolistsList/tasks/tasks-selectors";
import { selectTodolists } from "features/TodolistsList/todolists/todolists-selectors";
import { AddItemForm } from "common/components";
import { useActions } from "common/hooks/useActions";

type PropsType = {
  demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector(selectTodolists);
  const tasks = useSelector(selectTask);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const { addTodolist, fetchTodolists } = useActions(todolistsThunk);

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    fetchTodolists({});
  }, []);

  const addTodolistCallback = useCallback((title: string) => {
    //to get into catch
    return addTodolist(title).unwrap();
  }, []);

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <Grid container style={{ padding: "20px 0" }}>
        <AddItemForm addItem={addTodolistCallback} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id];

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist todolist={tl} tasks={allTodolistTasks} demo={demo} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
