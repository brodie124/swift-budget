import {TriggerDaily, TriggerMonthly, TriggerWeekly} from "../../../types/event/trigger";
import moment from "moment";

export interface TriggerHandler<T extends TriggerDaily | TriggerWeekly | TriggerMonthly> {
  calculateOccurrences(
    trigger: T,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<moment.Moment>;
}
