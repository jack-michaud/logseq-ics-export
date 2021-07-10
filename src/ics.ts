import ics, { createEvents, DateArray } from 'ics';
import {Page, TodoItem, Timestamp, recFindTimestamp} from "./entities";

import '@logseq/libs';
import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';


export const convertTimestampToDateArray = (timestamp: Timestamp): DateArray => {
  if (timestamp.time) {
    return [
      timestamp.date.year,
      timestamp.date.month,
      timestamp.date.day,
      timestamp.time.hour,
      timestamp.time.min
    ];
  } else {
    return [
      timestamp.date.year,
      timestamp.date.month,
      timestamp.date.day
    ];
  }
};
 
export const convertTodoToEvent = ([page, item]: [Page, TodoItem]): ics.EventAttributes[] => {
  // Is this a scheduled event or a deadline event?
  // An event can have a scheduled time and a deadline. We should return both events.

  let timestamp: Timestamp | null = null;
  let events = [];

  if (item.scheduled) {
    timestamp = recFindTimestamp(item.body, "Scheduled");
    let event: Partial<ics.EventAttributes> = {
      start: convertTimestampToDateArray(timestamp),
    };
    events.push(event);
  }
  if (item.deadline) {
    timestamp = recFindTimestamp(item.body, "Deadline");
    let event: Partial<ics.EventAttributes> = {
      start: convertTimestampToDateArray(timestamp),
    };
    events.push(event);
  }
  return events.map(event => {

    const hasTime = event.start.length === 5;

    return {
      ...event,
      startInputType: "local",
      title: `${item.content.split("\n")[0]} - ${page.name}`,
      ...(hasTime ? { duration: { minutes: 30 } } : { end: event.start })
    }
  });
};

export const dumpToIcs = async (logseq: ILSPluginUser, events: ics.EventAttributes[]) => {
  const ret = createEvents(events);
  if (ret.error) {
    throw new Error(`Unable to dump events to ICS: ${ret.error}`);
  }

  if (ret.value) {
    await logseq.FileStorage.setItem("calendar.ics", ret.value);
    console.log(`Wrote {events.length} events to calendar.ics`);
  } else {
    console.warn("Did not write null ICS file to disk");
  }
}
