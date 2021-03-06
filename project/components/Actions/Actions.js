import React from "react";

import { Grid, CircularProgress, Button } from "@material-ui/core";

import useStyles from "./components/styles/styles";

const classes = useStyles();

const Actions = ({ updateLoading, createLoading, handleOpen }) => {
  return (
    <>
      <Grid
        className={classes.actions}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid item className={classes.lastUpdated}>
          {"Event update time goes here"}
        </Grid>
        <Grid item>
          <Button className={classes.deleteButton} onClick={handleOpen}>
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            type="submit"
            disabled={updateLoading || createLoading}
          >
            {updateLoading ? <CircularProgress size={25} /> : "Save"}
          </Button>
        </Grid>
      </Grid>
      ;
    </>
  );
};

export default Actions;
