import moment from "moment";

export function getMomentUtc(input?: moment.MomentInput, strict?: boolean): moment.Moment {
  return moment.utc(input, strict).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}
