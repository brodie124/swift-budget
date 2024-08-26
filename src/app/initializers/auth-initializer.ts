import {AuthService} from "../services/auth.service";

export function initializeAuth(authService: AuthService) {
  return async () => {
    authService.initialize();
  }
}
