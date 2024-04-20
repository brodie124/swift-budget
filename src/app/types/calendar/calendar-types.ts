export enum CalendarDay {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday'
}

export enum CalendarMonth {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December
}

export const AllCalendarMonths: ReadonlyArray<CalendarMonth> = [
  CalendarMonth.January,
  CalendarMonth.February,
  CalendarMonth.March,
  CalendarMonth.April,
  CalendarMonth.May,
  CalendarMonth.June,
  CalendarMonth.July,
  CalendarMonth.August,
  CalendarMonth.September,
  CalendarMonth.October,
  CalendarMonth.November,
  CalendarMonth.December
];
