import {EventTrigger} from "../event/event";

export type FinancialEvent = {
  name: string;
  description?: string;
  expense: number;
  trigger: EventTrigger;
}
