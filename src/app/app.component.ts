import {Component, inject} from '@angular/core';
import {environment} from "../environments/environment";
import {EncryptionService} from "./services/encryption.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  private readonly _encryptionService = inject(EncryptionService);

  public readonly isNavbarEnabled: boolean =  environment.enableNavbar;
  public readonly isFirstTimeSetupEnabled: boolean = environment.enableFirstTimeSetup;


  public showUnlockModal = this._encryptionService.isEnabled();

  unlock() {
    this.showUnlockModal = false;
  }
}
