import moment from "moment";

export function getMomentUtc(): moment.Moment {
  return moment.utc().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}
