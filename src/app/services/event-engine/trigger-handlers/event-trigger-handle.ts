import {EventTriggerDaily, EventTriggerMonthly, EventTriggerWeekly} from "../../../types/event/event";
import moment from "moment";

export interface EventTriggerHandler<T extends EventTriggerDaily | EventTriggerWeekly | EventTriggerMonthly> {
  calculateOccurrences(
    trigger: T,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<moment.Moment>;
}
