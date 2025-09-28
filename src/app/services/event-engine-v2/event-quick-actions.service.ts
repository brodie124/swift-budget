import { inject, Injectable } from "@angular/core";
import { RecurringEventDefinitionProvider } from "./recurring-event-definition-provider.service";
import { RecurringEventDefinition } from "./types/recurring-event-definition";
import { EventOccurrence } from "./types/event-occurrence";

@Injectable({ providedIn: 'root' })
export class EventQuickActionsService {
  private readonly _eventDefinitionProvider = inject(RecurringEventDefinitionProvider);

  public async updateStatusAsync(occurrence: EventOccurrence, status: EventOccurrence['status']) {
    const eventDefinition: RecurringEventDefinition = { ...occurrence.recurringEvent };
    const uid = crypto.randomUUID().replace('-', '');
    eventDefinition.exceptions.push({
      id: uid,
      recurringEventId: eventDefinition.id,
      originalDate: occurrence.date,
      createdAt: new Date(),
      type: 'modified',
      occurrenceChanges: {
        status: status
      },
      definitionChanges: {}
    });

    await this._eventDefinitionProvider.updateAsync(eventDefinition);
  }
}
