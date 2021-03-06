import React from "react";

import { Link } from "react-router-dom";

import { TextField, Grid } from "@material-ui/core";

import useStyles from "./components/styles/styles";

const classes = useStyles();

const Link = ({ link, handleOpenLink, messageTitle, message, event }) => {
  return (
    <>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={6}>
            <Link className={classes.linkStyles} to={link}>
              <TextField
                onClick={handleOpenLink}
                fullWidth
                size="small"
                variant="outlined"
                label="Mail"
                InputProps={{
                  className: classes.multilineColor,
                }}
                value={
                  messageTitle ||
                  message?.caseStyle ||
                  message?.subject ||
                  event?.message?.caseStyle ||
                  ""
                }
              />
            </Link>
          </Grid>
          <Grid item xs={6}>
            <ChipsInput
              value={
                event?.message?.tags?.map((tag) => tag.name) ||
                message?.tags.map((tag) => tag.name) ||
                []
              }
              label="Category:"
              isLineType
              borderType="square"
              withBorder
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Link;
