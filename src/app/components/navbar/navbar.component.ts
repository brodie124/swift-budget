import {Component, inject} from '@angular/core';
import {ToolbarModule} from "primeng/toolbar";
import {AuthService} from "../../services/auth.service";
import {SignInWithGoogleComponent} from "../sign-in-with-google/sign-in-with-google.component";

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

}
