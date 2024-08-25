import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {OAuthCallbackHandlerComponent} from "./components/oauth-callback-handler/oauth-callback-handler.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'oauth2/callback',
    pathMatch: 'full',
    component: OAuthCallbackHandlerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
