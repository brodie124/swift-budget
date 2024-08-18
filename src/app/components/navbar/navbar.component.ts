import { Component } from '@angular/core';
import {ToolbarModule} from "primeng/toolbar";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ToolbarModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less'
})
export class NavbarComponent {

}
