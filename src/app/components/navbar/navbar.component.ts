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

  async test() {
    console.log("test");
    await this._syncro.loadAsync();
  }
}
