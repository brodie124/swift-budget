import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {CardModule} from "primeng/card";
import {SpinnerModule} from "primeng/spinner";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {AuthService} from "../../services/auth.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-oauth-callback-handler',
  standalone: true,
  imports: [
    CardModule,
    SpinnerModule,
    ProgressSpinnerModule
  ],
  templateUrl: './oauth-callback-handler.component.html',
  styleUrl: './oauth-callback-handler.component.less'
})
export class OAuthCallbackHandlerComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);

  public async ngOnInit(): Promise<void> {
    const fetchCodeQueryParameter = 'sbfc';

    const queryParams = await firstValueFrom(this._activatedRoute.queryParamMap);
    const fetchCode = queryParams.get(fetchCodeQueryParameter);
    if (!fetchCode) { // TODO: this logic would be best suited in a route-guard
      console.warn(`oauth2/callback called without ${fetchCodeQueryParameter}`);
      await this._router.navigateByUrl('/');
      return;
    }


    const result = await this._authService.completeSignInAsync(fetchCode);
    if(result === 'success') {
      this._messageService.add({
        summary: 'Authorization successful',
        detail: "You've successfully signed in with Google",
        severity: 'success',
      });
    } else {
      this._messageService.add({
        summary: 'Authorization failed',
        detail: "Oops! Something went wrong signing in with Google.",
        severity: 'error',
      });
    }

    await this._router.navigateByUrl('/');
  }


}
