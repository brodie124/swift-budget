import {RecurringEvent} from "../event/event";

export type FinancialEvent = {
  name: string;
  description?: string;
  expense: number;
  trigger: RecurringEvent;
}
