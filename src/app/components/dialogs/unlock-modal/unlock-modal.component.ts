import {Component, inject, OnDestroy, OnInit, output, signal} from '@angular/core';
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {PasswordModule} from "primeng/password";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EncryptionService} from "../../../services/storage/encryption.service";
import {ToastModule} from "primeng/toast";
import {PasswordService} from "../../../services/password.service";
import {Subscription} from "rxjs";
import {sha256} from "../../../helpers/hash-utils";

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
export class UnlockModalComponent implements OnInit, OnDestroy {
  private readonly _encryptionService = inject(EncryptionService);
  private readonly _passwordService = inject(PasswordService);

  private readonly _subscriptions = new Subscription();

  public hasSubmitted: boolean = false;
  public masterPassword: string = '';
  public readonly showModal = signal<boolean>(false);

  public masterPasswordErrorMessage: string | null = null;

  public readonly onUnlock = output<void>();

  public async ngOnInit() {
    this._subscriptions.add(this._passwordService.requireUnlock$.subscribe(this.showUnlock.bind(this)));
  }

  public async ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  showUnlock() {
    this.showModal.set(true);
  }

  async unlock() {
    if (!this.masterPassword) {
      this.masterPasswordErrorMessage = 'A master password must be provided to unlock your data.';
      return;
    }

    // TODO: it is very confusing where this hashing has to take place. We should sort that out!
    const hashedPassword = await sha256(`swift-budget:${this.masterPassword}`);
    const isValid = await this._encryptionService.checkPassword(hashedPassword);
    if (!isValid) {
      this.masterPasswordErrorMessage = 'The master password provided is incorrect.';
      return;
    }

    await this._passwordService.setMasterPassword(this.masterPassword);

    this.showModal.set(false);
    setTimeout(() => this.onUnlock.emit(), 100); // Delay just enough for animations of modal closing to finish
  }

  async submitKeyUpCheck(event: KeyboardEvent): Promise<void> {
    if (event.key.toLowerCase() === 'enter')
      await this.unlock()
  }
}
