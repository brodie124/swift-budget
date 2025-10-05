import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ToolbarModule} from "primeng/toolbar";
import {SignInWithGoogleComponent} from "../sign-in-with-google/sign-in-with-google.component";
import {AppDataSynchronizerService} from "../../services/appdata/app-data-synchronizer.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {AuthService} from "../../services/auth.service";
import {Button} from "primeng/button";
import {BiometricSetupHandler} from "../../services/biometric-setup-handler";
import {MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ToolbarModule,
    SignInWithGoogleComponent,
    Button,
    MenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less'
})
export class NavbarComponent implements OnInit {
  private readonly _syncro = inject(AppDataSynchronizerService);
  private readonly _authService = inject(AuthService);
  private readonly _bioSetupHandler = inject(BiometricSetupHandler);

  public signedIn = toSignal(this._authService.isSignedIn$);
  public allowSync = toSignal(this._syncro.allowSync$);
  public syncButtonText = computed(() => this.allowSync()
    ? 'Disable cloud sync'
    : 'Enable cloud sync'
  );

  public readonly supportsBiometric = computed(() => this._bioSetupHandler.isBiometricAuthSupported());
  public readonly biometricRegistered = signal<boolean>(false);
  public readonly settingsMenuItems = computed<MenuItem[]>(() => this.makeSettingsMenu());

  ngOnInit() {
    // TODO: changes in biometric registration aren't picked up until after page reload because this is only fired once.
    this._bioSetupHandler.isBiometricAuthRegistered().then((isRegistered) => this.biometricRegistered.set(isRegistered));
  }

  // async testFetchAppdata() {
  //   console.log("testFetchAppdata");
  //
  //   const result = await this._syncro.loadAsync();
  //
  //   console.log(`testFetchAppdata - result: ${result}`)
  // }
  //
  // async testUploadAppdata() {
  //   console.log("testUploadAppdata");
  //   await this._syncro.saveAsync();
  // }

  setAllowSync() {
    this._syncro.setAllowSync(!this.allowSync());
  }

  private makeSettingsMenu(): Array<MenuItem> {
    const items: Array<MenuItem> = [];

    if (this.supportsBiometric() && this.biometricRegistered()) {
      items.push({
        label: 'Disable biometric',
        command: async () => await this._bioSetupHandler.clearBiometricAuth()
      });
    } else if (this.supportsBiometric() && !this.biometricRegistered()) {
      items.push({
        label: 'Enable biometric',
        command: async () => await this._bioSetupHandler.registerBiometricAuth()
      });
    }

    return items;
  }
}
