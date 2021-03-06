import React from "react";

import { TextField, Grid } from "@material-ui/core";

import Daterow from "./components/DateRow/Daterow";

import useStyles from "./components/styles/styles";

const classes = useStyles();

const Header = ({ dispatch, eventForm }) => {
  return (
    <>
      <Grid
        className={classes.headerPart}
        container
        spacing={2}
        alignItems="center"
      >
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Title"
            value={eventForm.title}
            onChange={(e: React.FormEvent<HTMLFormElement>) =>
              dispatch({
                field: "title",
                value: e.currentTarget.value,
              })
            }
          />
        </Grid>
        <Daterow dispatch={dispatch} eventForm={eventForm} />
      </Grid>
    </>
  );
};

export default Header;
