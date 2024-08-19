import { Component } from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {InputSwitchModule} from "primeng/inputswitch";
import {FormsModule} from "@angular/forms";
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
    PasswordModule
  ],
  templateUrl: './first-time-setup.component.html',
  styleUrl: './first-time-setup.component.less'
})
export class FirstTimeSetupComponent {
  public isVisible: boolean = true;

  public enableEncryption: boolean = false;
  public encryptionKey: string = '';
}
