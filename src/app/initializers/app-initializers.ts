import {EventManagerService} from "../services/event-manager.service";

export function eventManagerInitializer(eventManagerService: EventManagerService) {
  return async () => {
    await eventManagerService.loadAsync();
  }
}
