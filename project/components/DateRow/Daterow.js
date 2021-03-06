import React from "react";

import { ReactComponent as DropdownIcon } from "../icons/dropdownRegular.svg";
import NumberFormatTime from "../common/NumberFormatTime";

import{ FormControlLabel,  Switch, InputAdornment, } from "@material-ui/core"

import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

import moment from "moment";

import useStyles from './components/styles/styles'

const classes = useStyles()

const Daterow = ({dispatch, eventForm} ) => {
  
  const [allDay, setAllDay] = React.useState<boolean>(false);
  const [allDayBufferStartTime, setAllDayBufferStartTime] = React.useState("00:00");
  const [allDayBufferEndTime, setAllDayBufferEndTime] = React.useState("23:59");

  const handleAllDay = () => {
    if (allDay) {
      setAllDay(false);
      dispatch({
        field: "startTime",
        value: allDayBufferStartTime,
      });
      dispatch({
        field: "endTime",
        value: allDayBufferEndTime,
      });
    } else {
      const isAfter = moment(moment(eventForm.startDate).format("l")).isAfter(
        eventForm.endDate,
      );

      if (isAfter) {
        dispatch({
          field: "endDate",
          value: eventForm.startDate,
        });
      }

      setAllDay(true);
      setAllDayBufferStartTime(eventForm.startTime);
      setAllDayBufferEndTime(eventForm.endTime);

      dispatch({
        field: "startTime",
        value: "00:00",
      });
      dispatch({
        field: "endTime",
        value: "23:59",
      });
    }
  };

  const handleStartDateChange = (date: any) => {
    if (!date) return;
    const isAfter = moment(moment(date).format("l")).isAfter(eventForm.endDate);

    if (allDay && isAfter) {
      dispatch({
        field: "endDate",
        value: moment(date).format("l"),
      });
    }
    dispatch({
      field: "startDate",
      value: moment(date).format("l"),
    });
  };

  // 16:00 => 1600 for number mask
  const convertTimeStringToNumber = (timeString: string) =>
    timeString.split(":").join("");


  return (
    <>
    <div className={classes.dateRow}>
      <div className={classes.dateCol}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            autoOk
            className={classes.dateInput}
            disableToolbar
                        disablePast={event ? false : true}
                        variant="inline"
                        format="M/d/yyyy"
                        value={eventForm.startDate}
                        inputVariant="outlined"
                        onChange={handleStartDateChange}
                        TextFieldComponent={(props) => (
                          <TextField
                            {...props}
                            size="small"
                            variant="outlined"
                            label="Start Date"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DropdownIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  <div className={classes.dateCol}>
                    <TextField
                      className={classes.timeInput}
                      required
                      size="small"
                      label="Start Time"
                      variant="outlined"
                      value={convertTimeStringToNumber(eventForm.startTime)}
                      InputProps={{
                        inputComponent: NumberFormatTime as any,
                      }}
                      onChange={(e: any) =>
                        dispatch({
                          field: "startTime",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    className={`${classes.dateCol} ${classes.paddingBottom}`}
                  >
                    To
                  </div>
                  <div className={classes.dateCol}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <DatePicker
                        autoOk
                        className={classes.dateInput}
                        disablePast={event ? false : true}
                        disableToolbar
                        variant="inline"
                        format="M/d/yyyy"
                        value={eventForm.endDate}
                        inputVariant="outlined"
                        onChange={(date) => {
                          if (!date) return;
                          dispatch({
                            field: "endDate",
                            value: moment(date).format("l"),
                          });
                        }}
                        TextFieldComponent={(props) => (
                          <TextField
                            {...props}
                            size="small"
                            variant="outlined"
                            label="End Date"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DropdownIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  <div className={classes.dateCol}>
                    <TextField
                      className={classes.timeInput}
                      required
                      size="small"
                      label="End Time"
                      variant="outlined"
                      value={convertTimeStringToNumber(eventForm.endTime)}
                      InputProps={{
                        inputComponent: NumberFormatTime as any,
                      }}
                      onChange={(e: any) =>
                        dispatch({
                          field: "endTime",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    className={`${classes.dateCol} ${classes.paddingBottom}`}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          classes={{
                            root: classes.switchRoot,
                            switchBase: classes.switchBase,
                            thumb: classes.switchThumb,
                            track: classes.switchTrack,
                          }}
                          checked={allDay}
                          color="primary"
                          onClick={handleAllDay}
                        />
                      }
                      label="All Day"
                    />
                  </div>
                </div>
                </>
  )
};

export default Daterow