import React, { useReducer, useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Box,
  } from "@material-ui/core";


import { CloseOutlined as CloseOutlinedIcon } from "@material-ui/icons";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";

import { ReactComponent as ErrorOutlineIcon } from "../icons/errorOutline.svg";


import {
  File,
  Event,
  UpdateEventInput,
  useUpdateEventMutation,
  useCreateEventMutation,
  useDeleteEventMutation,
  Maybe,
  Message,
  useGetSharedAccessQuery,
  User,
  Calendar,
  EventDocument,
  useGetNotificationSettingsByTagLazyQuery,
  EventNotificationInput,
  GetSharedAccessQuery,
} from "../graphql/generated";

import convertMStoTimeLeft from "../common/convertMSToTimeLeft";
import { gql } from "@apollo/client";

import TextField from "./TextField";

import { Link } from "react-router-dom";
import EventDeleteModal from "./EventDeleteModal";

// ===========================================================================
import useStyles from './styles/styles'
import reducer from './reducer/reducer'
import Snackbar from './components/Snackbar/Snackbar'


// ===========================================================================


type EventDetailsProps = {
  event?: Event;
  open: boolean;
  setOpen: (open: boolean) => void;
  onDialogClose?: () => void;
  refetchEvents?: () => void;
  message?: Maybe<Message>;
  onEventCreation?: (eventId: string, event: Event) => void;
  onCreateEventFromMessageItem?: (eventId: string, event: Event) => void;
  currentUser: User;
  onEventDelition?: () => void;
  messageId?: string;
  messageTitle?: string | null | undefined;
  isMessageDone?: boolean | null | undefined;
  isMessageDeleted?: boolean | null | undefined;
};

interface EventForm {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  notifications: NotificationItem[];
}

type NotificationItem = {
  userId: string;
  period: string;
  periodType: PeriodType;
};

type ActionType = "userId" | "periodType" | "period";
type PeriodType = "Minute" | "Hour" | "Day" | "Week";

const periodTypes = ["Minute", "Hour", "Day", "Week"];
const periodRate = {
  Minute: 1000 * 60,
  Hour: 1000 * 60 * 60,
  Day: 1000 * 60 * 60 * 24,
  Week: 1000 * 60 * 60 * 24 * 7,
};

export const createLink = (
  userEmail: string,
  messageId: string | null | undefined,
  isDone: boolean | null | undefined,
  isDeleted: boolean | null | undefined,
): string => {
  if (isDone) {
    return `/messages/done/${messageId}`;
  } else if (isDeleted) {
    return `/messages/deleted/${messageId}`;
  } else {
    return `/inbox/${userEmail}/${messageId}`;
  }
};

const messageFragment = gql`
  fragment MyMessage on Message {
    id
    event {
      id #id should be for correct render
    }
  }
`;

const EventDetails = ({
  event,
  open,
  setOpen,
  onDialogClose,
  refetchEvents,
  message,
  onEventCreation,
  onEventDelition,
  onCreateEventFromMessageItem,
  currentUser,
  messageId,
  messageTitle,
  isMessageDone,
  isMessageDeleted,
}: EventDetailsProps) => {


  const {
    data: sharedData,
    loading: sharedDataLoading,
  } = useGetSharedAccessQuery();

  const classes = useStyles();

  const [
    updateEventMutation,
    { data: updateEventData, loading: updateLoading, error: updateError },
  ] = useUpdateEventMutation();

  const [
    getNotificationSettings,
    { data: notificationSettingsData },
  ] = useGetNotificationSettingsByTagLazyQuery();

  const [deleteEventMutation] = useDeleteEventMutation({
    onCompleted: async () => {
      if (refetchEvents) {
        refetchEvents();
      }
      if (onEventDelition) {
        await onEventDelition();
      }
      setOpen(false);
    },
    update(cache, { data }) {
      const { deleteEvent } = data || {};
      if (deleteEvent && event) {
        cache.writeQuery({
          query: EventDocument,
          data: {
            event: null,
          },
          variables: { eventId: event.id },
        });
        cache.writeFragment({
          id: "Message:" + message?.id,
          fragment: messageFragment,
          data: {
            event: null,
          },
        });
      }
    },
  });

  const now = moment();
  const oneHourFuture = moment(now).add(1, "hours");
  const nowDateEndDate =
    Number(moment(now).format("HH")) >= 23 ? moment(now).add(1, "day") : now;
  
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState<boolean>(false);



  const [calendarChips, setCalendarChips] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<object[]>([]);
  const [sharingUsers, setSharingUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sharedDataAccess, setSharedDataAccess] = useState<
    GetSharedAccessQuery | undefined | null
  >(null);

  const initialEventForm: any = {
    ...message?.eventPreview,
    ...message?.eventInfo,
    ...event,
    startDate: moment(
      event?.startTime || message?.eventInfo?.startTime || now,
    ).format("l"),
    startTime: moment(
      event?.startTime || message?.eventInfo?.startTime || now,
    ).format("HH:mm"),
    endTime: moment(
      event?.endTime || message?.eventInfo?.endTime || oneHourFuture,
    ).format("HH:mm"),
    endDate: moment(
      event?.endTime || message?.eventInfo?.startTime || nowDateEndDate,
    ).format("l"),
    notifications: notifications,
  };

  const [eventForm, dispatch] = useReducer(reducer, initialEventForm);

  useEffect(() => {
    setSharedDataAccess(sharedData);
  }, [sharedData]);

  useEffect(() => {
    dispatch({
      field: "reset",
    });
  }, [event, notifications, sharingUsers]);

  useEffect(() => {
    if (message?.tags?.length) {
      getNotificationSettings({ variables: { tagId: message.tags[0].id } });
    }
  }, [message, getNotificationSettings]);

  const [
    createEventMutation,
    { data: createEventData, loading: createLoading, error: createError },
  ] = useCreateEventMutation({
    update(cache, { data }) {
      const { createEvent } = data || {};
      if (createEvent) {
        cache.writeQuery({
          query: EventDocument,
          data: {
            event: createEvent,
          },
          variables: { eventId: createEvent.id },
        });
        cache.writeFragment({
          id: "Message:" + message?.id,
          fragment: messageFragment,
          data: {
            event: createEvent,
          },
        });
      }
    },
  });

  const hasGraphQlConflictError = () => {
    if (createError?.graphQLErrors && createError?.graphQLErrors.length > 0) {
      const error = createError.graphQLErrors[0] as any;
      if (error.code === "has_conflict") {
        return true;
      }
    }

    if (updateError?.graphQLErrors && updateError?.graphQLErrors.length > 0) {
      const error = updateError.graphQLErrors[0] as any;
      if (error.code === "has_conflict") {
        return true;
      }
    }

    return false;
  };

  const normaliseEventForm = (): UpdateEventInput => {
    const startTime = moment(
      `${eventForm.startDate} ${eventForm.startTime}`,
      "l HH:mm",
    ).format();

    const endTime = moment(
      `${eventForm.endDate} ${eventForm.endTime}`,
      "l HH:mm",
    ).format();

    let startTimeUTC = startTime;
    let endTimeUTC = endTime;
    // Converting dates to UTC for all day,
    // because nylas shows wrong date range with local time
    if (allDay) {
      startTimeUTC = moment(startTime).utcOffset(0, true).format();
      endTimeUTC = moment(endTime).utcOffset(0, true).format();
    }

    const normalizedNotifications: EventNotificationInput[] = [];

    eventForm.notifications.forEach((item: NotificationItem) => {
      if (item?.period && Number(item?.period) > 0 && item.userId !== "none") {
        normalizedNotifications.push({
          userId: item.userId,
          notifyBefore: Number(item.period) * periodRate[item.periodType],
        });
      }
    });

    return {
      title: eventForm.title,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      location: eventForm.location,
      description: eventForm.description,
      notifications: normalizedNotifications,
      attachmentIds: files.map((attach) => attach.id),
    };
  };

  const handleFormSave = async (eventDom: React.FormEvent<HTMLFormElement>) => {
    eventDom.preventDefault();

    const {
      title,
      startTime,
      endTime,
      location,
      description,
      notifications,
      attachmentIds,
    } = normaliseEventForm();

    if (event) {
      await updateEventMutation({
        variables: {
          eventId: event.id,
          title,
          startTime,
          endTime,
          location,
          description,
          allDay,
          notifications,
          attachmentIds,
        },
      }).catch((err) => console.log(`Event update error: ${err}`));
    } else if (message) {
      try {
        // TODO: Fix the types. In rush atm to demo this
        const newEvent: any = await createEventMutation({
          variables: {
            messageId: message.id,
            title,
            startTime,
            endTime,
            location,
            description,
            allDay,
            notifications,
            attachmentIds,
          },
        });
        const data = newEvent.data;

        const hasConflict = hasGraphQlConflictError();
        if (hasConflict) {
          return;
        }

        if (data?.createEvent && onCreateEventFromMessageItem) {
          onCreateEventFromMessageItem(data.createEvent.id, data?.createEvent);
        }
        if (data?.createEvent && onEventCreation) {
          await onEventCreation(data.createEvent.id, data?.createEvent);
        }
      } catch (error) {
        console.log(`Event update error: ${error}`);
      }
    } else {
      return;
    }
    if (!createError && !updateError) {
      if (refetchEvents) {
        refetchEvents();
      }
      if (onDialogClose) {
        onDialogClose();
      }
    }
  };

  const handleDeleteEvent = async () => {
    if ("id" in eventForm) {
      setIsOpenModalConfirm(false);
      await deleteEventMutation({
        variables: {
          eventId: eventForm.id,
        },
      });
    }
  };

  


  useEffect(() => {
    if (updateEventData && !updateError) {
      setSuccessMessageOpen(true);
      setOpen(false);
    }
  }, [updateEventData, updateError, setOpen]);

  useEffect(() => {
    const eventFiles = event?.attachments || message?.files || [];
    if (eventFiles) {
      setFiles(eventFiles as File[]);
    } else {
      setFiles([]);
    }
  }, [event, message]);

  useEffect(() => {
    if (createEventData && !createError) {
      setSuccessMessageOpen(true);
      setOpen(false);
    }
  }, [createEventData, createError, setOpen]);

  useEffect(() => {
    const chipSharedAccessValues: string[] = sharedDataAccess?.sharedAccess
      ?.targetUsers
      ? sharedDataAccess.sharedAccess.targetUsers.map(
          (user: User) => `${user?.name}'s Calendar`,
        )
      : [];

    let userCalendars: string[] = [];
    if (currentUser) {
      userCalendars =
        currentUser.eventCalendars.map(
          (calendar: Calendar) => `${calendar.name}`,
        ) || [];
    }

    const chipValues = [...chipSharedAccessValues, ...userCalendars];
    if (event?.nylasCalendarName) {
      chipValues.unshift(event.nylasCalendarName);
    }
    setCalendarChips(chipValues);
  }, [event, sharedDataAccess, currentUser]);

  useEffect(() => {
    if (!sharedDataLoading && sharedData?.sharedAccess?.targetUsers) {
      let sharedUsers: User[] = [];

      if (sharedData?.sharedAccess?.targetUsers) {
        sharedUsers = [...sharedData?.sharedAccess?.targetUsers];
        const isInclude = sharedUsers.find(({ id }) => id === currentUser.id);
        if (!isInclude) {
          sharedUsers.unshift(currentUser);
        }
      }

      const initialNotificationPeriod: NotificationItem[] = [];

      const periodTypeMap = {
        weeks: "Week",
        days: "Day",
        hours: "Hour",
        minutes: "Minute",
      };

      if (!event) {
        if (
          notificationSettingsData?.notificationSettingsByTag?.items &&
          notificationSettingsData?.notificationSettingsByTag?.items?.length > 0
        ) {
          notificationSettingsData.notificationSettingsByTag.items.forEach(
            (item) => {
              const { type, value } = convertMStoTimeLeft(item.notifyBefore);
              const tsType = type as keyof typeof periodTypeMap;
              sharedUsers.forEach((sharedUser) => {
                initialNotificationPeriod.push({
                  userId: sharedUser.id,
                  periodType: periodTypeMap[tsType] as PeriodType,
                  period: value.toString(),
                });
              });
            },
          );
        } else {
          sharedUsers.forEach((sharedUser) => {
            initialNotificationPeriod.push({
              userId: sharedUser.id,
              periodType: periodTypeMap.minutes as PeriodType,
              period: "10",
            });
          });
        }
      } else if (event?.notifications && event?.notifications?.length > 0) {
        event.notifications.forEach((notififcation) => {
          const { type, value } = convertMStoTimeLeft(
            notififcation.notifyBefore,
          );
          const tsType = type as keyof typeof periodTypeMap;
          initialNotificationPeriod.push({
            userId: notififcation.userId,
            periodType: periodTypeMap[tsType] as PeriodType,
            period: value.toString(),
          });
        });
      }
      setNotifications(initialNotificationPeriod);
      setSharingUsers(sharedUsers);
    }
  }, [
    event,
    sharedDataLoading,
    notificationSettingsData,
    currentUser,
    sharedData,
  ]);

  const handleDialogClose = () => {
    setOpen(false);
    if (onDialogClose) {
      onDialogClose();
    }
  };



  const handleClose = () => setIsOpenModalConfirm(false);
  const handleOpen = () => setIsOpenModalConfirm(true)

  const handleOpenLink = () => setOpen(false)

  const handleDeleteChips = (index) => setFiles([...files.slice(0, index), ...files.slice(index + 1)])

  const link = createLink(
    currentUser.email,
    messageId,
    isMessageDone,
    isMessageDeleted,
  );

  return (
    <>
      <Snackbar/>
      <Dialog
        classes={{
          paper: classes.modal,
        }}
        open={open}
        onClose={handleDialogClose}
      >
        <DialogTitle className={classes.modalTitle}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>{message ? "Create new event" : "Event Details"}</Grid>
            <Grid item>
              <IconButton
                classes={{
                  root: classes.iconButtonRoot,
                }}
                onClick={() => setOpen(false)}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSave}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Header dispatch={dispatch} eventForm={eventForm}/>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Calendar"
                    value={calendarChips}
                  />
                </Grid>
                <Grid
                  item
                  container
                  xs={3}
                  alignItems="center"
                  className={
                    hasGraphQlConflictError() ? classes.conflictError : ""
                  }
                >
                  <Box display="flex" mt={4}>
                    <ErrorOutlineIcon className={classes.icon} />
                    &nbsp;
                    {event?.conflict || hasGraphQlConflictError() ? (
                      <>Has conflict.</>
                    ) : (
                      <>No Conflict</>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Address"
                    value={eventForm.location}
                    onChange={(e: React.FormEvent<HTMLFormElement>) =>
                      dispatch({
                        field: "location",
                        value: e.currentTarget.value,
                      })
                    }
                  />
                </Grid>
               <Link link={link} handleOpenLink={handleOpenLink} messageTitle={messageTitle} message={message} event={event} />
                {eventForm.notifications.map(
                  (notify: NotificationItem, index: number) => (
                    <Notifications notify={notify} index={index} dispatch={dispatch} sharingUsers={sharingUsers}/>
                  ),
                )}
                <Grid item xs={12}>
                  <Button
                    className={classes.addReminder}
                    onClick={() => {
                      dispatch({
                        field: `notification:0:add`,
                      });
                    }}
                    disableRipple
                  >
                    Add Reminder
                  </Button>
                </Grid>
                {files ? (<Files files={files} handleDeleteChips={handleDeleteChips} />) : null}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Note"
                    multiline
                    rows={5}
                    value={eventForm.description}
                    onChange={(e: React.FormEvent<HTMLFormElement>) =>
                      dispatch({
                        field: "description",
                        value: e.currentTarget.value,
                      })
                    }
                  />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
            <Actions updateLoading={updateLoading} createLoading={createLoading} handleOpen={handleOpen}/>
          </form>
        </DialogContent>
      </Dialog>
      <EventDeleteModal
        isOpenModalConfirm={isOpenModalConfirm}
        handleClose={handleClose}
        handleDeleteEvent={handleDeleteEvent}
      />
    </>
  );
};

export default EventDetails;