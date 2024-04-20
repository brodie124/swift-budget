import moment from "moment";

export function compareMomentsAscending(a?: moment.Moment | null, b?: moment.Moment | null): number {
  if(a === b || a?.isSame(b))
    return 0;

  return a?.isBefore(b)
    ? -1
    : 1;
}

export function compareMomentsDescending(a?: moment.Moment | null, b?: moment.Moment | null): number {
  return compareMomentsAscending(a, b) * -1;
}

