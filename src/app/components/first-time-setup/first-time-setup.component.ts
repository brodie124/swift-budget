import { Component } from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {PasswordModule} from "primeng/password";

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
export class FirstTimeSetupComponent {
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

  constructor(formBuilder: FormBuilder) {
    this.firstTimeForm = formBuilder.group({
      enableEncryption: [true, Validators.required],
      masterPassword: ['', Validators.required]
    });
  }

  public saveAndExit(): void {
    this.masterPasswordControl.setValidators(this.enableEncryption ? Validators.required : null);
    this.masterPasswordControl.updateValueAndValidity();

    this.hasSubmitted = true;
    if(!this.firstTimeForm.valid)
      return;

    this.isVisible = false;
  }
}
