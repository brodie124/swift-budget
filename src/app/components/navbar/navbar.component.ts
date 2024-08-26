import {Component, inject} from '@angular/core';
import {ToolbarModule} from "primeng/toolbar";
import {SignInWithGoogleComponent} from "../sign-in-with-google/sign-in-with-google.component";
import {AppDataSynchronizerService} from "../../services/app-data-synchronizer.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ToolbarModule,
    SignInWithGoogleComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less'
})
export class NavbarComponent {
private readonly _syncro = inject(AppDataSynchronizerService);

  async testFetchAppdata() {
    console.log("testFetchAppdata");
    await this._syncro.loadAsync();
  }

  async testUploadAppdata() {
    console.log("testUploadAppdata");
    await this._syncro.saveAsync();
  }
}
