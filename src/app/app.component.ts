import { Component } from '@angular/core';
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public readonly isNavbarEnabled: boolean =  environment.enableNavbar;
  public readonly isFirstTimeSetupEnabled: boolean = environment.enableFirstTimeSetup;
}
