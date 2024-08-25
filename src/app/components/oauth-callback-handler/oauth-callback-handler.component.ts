import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {CardModule} from "primeng/card";
import {SpinnerModule} from "primeng/spinner";
import {ProgressSpinnerModule} from "primeng/progressspinner";

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

  public async ngOnInit(): Promise<void> {
    const fetchCodeQueryParameter = 'sbfc';

    const queryParams = await firstValueFrom(this._activatedRoute.queryParamMap);
    const fetchCode = queryParams.get(fetchCodeQueryParameter);
    if (!fetchCode) { // TODO: this logic would be best suited in a route-guard
      console.warn(`oauth2/callback called without ${fetchCodeQueryParameter}`);
      await this._router.navigateByUrl('/');
      return;
    }

  }
}
