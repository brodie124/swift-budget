import {Component, inject, output} from '@angular/core';
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {PasswordModule} from "primeng/password";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EncryptionService} from "../../services/encryption.service";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-unlock-modal',
  standalone: true,
  imports: [
    Button,
    DialogModule,
    InputSwitchModule,
    PasswordModule,
    PrimeTemplate,
    ReactiveFormsModule,
    ToastModule,
    FormsModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './unlock-modal.component.html',
  styleUrl: './unlock-modal.component.less'
})
export class UnlockModalComponent {
  private readonly _encryptionService = inject(EncryptionService);

  public hasSubmitted: boolean = false;
  public masterPassword: string = '';
  public showModal: boolean = true;

  public masterPasswordErrorMessage: string | null = null;

  public readonly onUnlock = output<void>();

  async unlock() {
    if (!this.masterPassword) {
      this.masterPasswordErrorMessage = 'A master password must be provided to unlock your data.';
      return;
    }

    await this._encryptionService.setMasterPassword(this.masterPassword);
    const isValid = await this._encryptionService.checkMasterPassword();
    if (!isValid) {
      this.masterPasswordErrorMessage = 'The master password provided is incorrect.';
      return;
    }

    this.showModal = false;
    setTimeout(() => this.onUnlock.emit(), 100); // Delay just enough for animations of modal closing to finish
  }

  async submitKeyUpCheck(event: KeyboardEvent): Promise<void> {
    if (event.key.toLowerCase() === 'enter')
      await this.unlock()
  }
}
