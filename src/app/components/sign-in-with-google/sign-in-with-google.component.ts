import {Component, inject, input, signal} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {of} from "rxjs";

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

  public isSignedIn = toSignal(of(false), {initialValue: false});

  public async signInAsync() {
    await this._authService.signInAsync();
  }

  public async signOutAsync() {
    await this._authService.signOutAsync();
  }
}
