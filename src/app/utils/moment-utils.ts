import moment from "moment";
import {MomentFormatSpecification, MomentInput} from "moment/moment";

export function getMomentUtc(input?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment {
  return getMomentWithTime(input, format, language, strict).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}

export function getMomentWithTime(input?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment {
  return moment.utc(input, format, language, strict)
}
