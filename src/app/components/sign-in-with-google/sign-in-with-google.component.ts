import {Component, inject, input, signal} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-sign-in-with-google',
  standalone: true,
  imports: [],
  templateUrl: './sign-in-with-google.component.html',
  styleUrl: './sign-in-with-google.component.less'
})
export class SignInWithGoogleComponent {
  /*
   * All HTML & CSS found within this component was obtained from:
   * https://stackoverflow.com/questions/46654248/how-to-display-google-sign-in-button-using-html
   */

  private readonly _authService = inject(AuthService);
  public disabled = input<boolean>(false);
  // public mode = input<'sign-in-only' | 'sign-in-out'>('sign-in-out');

  public isSignedIn = toSignal(this._authService.isSignedIn$, {initialValue: false});

  public async signInAsync() {
    await this._authService.authenticateAsync();
  }

  public async signOutAsync() {
    await this._authService.signOutAsync();
  }
}
