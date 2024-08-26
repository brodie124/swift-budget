import {Component, computed, inject, signal} from '@angular/core';
import {ToolbarModule} from "primeng/toolbar";
import {SignInWithGoogleComponent} from "../sign-in-with-google/sign-in-with-google.component";
import {AppDataSynchronizerService} from "../../services/app-data-synchronizer.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {AuthService} from "../../services/auth.service";
import {Button} from "primeng/button";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ToolbarModule,
    SignInWithGoogleComponent,
    Button
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less'
})
export class NavbarComponent {
  private readonly _syncro = inject(AppDataSynchronizerService);
  private readonly _authService = inject(AuthService);

  public signedIn = toSignal(this._authService.isSignedIn$);
  public allowSync = toSignal(this._syncro.allowSync$);
  public syncButtonText = computed(() => this.allowSync()
    ? 'Disable cloud sync'
    : 'Enable cloud sync'
  );

  async testFetchAppdata() {
    console.log("testFetchAppdata");
    await this._syncro.loadAsync();
  }

  async testUploadAppdata() {
    console.log("testUploadAppdata");
    await this._syncro.saveAsync();
  }

  setAllowSync() {
    this._syncro.setAllowSync(!this.allowSync());
  }
}
