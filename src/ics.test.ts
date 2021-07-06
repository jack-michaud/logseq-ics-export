
import { Timestamp } from '../src/entities';
import { convertTodoToEvent, convertTimestampToDateArray } from '../src/ics';

const timestamp: Timestamp = {
  date: {
    year: 2021,
    month: 7,
    day: 5,
  },
  wday: "Mon",
  time: {
    hour: 9,
    min: 17
  },
  repetition: null,
  active: true
}

test("convert timestamp to date array", () => {

  expect(convertTimestampToDateArray(timestamp)).toBe([
    2021, 7, 5, 9, 17
  ])
})

test("convert basic todo to event", () => {
  //convertTodoToEvent()
})
