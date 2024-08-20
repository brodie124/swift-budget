import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {PasswordModule} from "primeng/password";
import {environment} from "../../../environments/environment";
import {EncryptionService} from "../../services/encryption.service";

@Component({
  selector: 'app-first-time-setup',
  standalone: true,
  imports: [
    DialogModule,
    InputSwitchModule,
    FormsModule,
    InputTextModule,
    Button,
    PasswordModule,
    ReactiveFormsModule
  ],
  templateUrl: './first-time-setup.component.html',
  styleUrl: './first-time-setup.component.less'
})
export class FirstTimeSetupComponent implements OnInit {
  private readonly _encryptionService = inject(EncryptionService);

  public isVisible: boolean = true;
  public hasSubmitted: boolean = false;

  public readonly firstTimeForm: FormGroup;

  public get enableEncryption(): boolean {
    return !!this.enableEncryptionControl.value;
  }

  public get enableEncryptionControl(): AbstractControl {
    return this.firstTimeForm.controls['enableEncryption'];
  }

  public get masterPasswordControl(): AbstractControl {
    return this.firstTimeForm.controls['masterPassword'];
  }

  public constructor(formBuilder: FormBuilder) {
    this.firstTimeForm = formBuilder.group({
      enableEncryption: [true, Validators.required],
      masterPassword: ['', Validators.required]
    });
  }

  public ngOnInit(): void {
    const preference = localStorage.getItem(environment.cacheKeys.encryptionPreference);
    const isPreferenceValid = preference === '0' || !!localStorage.getItem(environment.cacheKeys.encryptionCheck);

    this.isVisible = !isPreferenceValid;
  }

  public async saveAndExit(): Promise<void> {
    if (!this._encryptionService.isSupported()) {
      alert('Encryption not supported. Disable it to continue.');
      this.enableEncryptionControl.setValue(false);
      return;
    }

    this.masterPasswordControl.setValidators(this.enableEncryption ? Validators.required : null);
    this.masterPasswordControl.updateValueAndValidity();

    this.hasSubmitted = true;
    if(!this.firstTimeForm.valid)
      return;

    await this.saveToLocal();
    this.isVisible = false;
  }

  private async saveToLocal(): Promise<void> {
    localStorage.setItem(environment.cacheKeys.encryptionPreference, this.enableEncryption ? '1' : '0');

    if (!this.enableEncryption) // Encryption required past this point
      return;
    await this._encryptionService.setMasterPassword(this.masterPasswordControl.value.trim());
    await this._encryptionService.writeCheck();
  }
}
