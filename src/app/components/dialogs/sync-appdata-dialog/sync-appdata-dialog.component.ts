import {Component, inject, OnInit, output} from '@angular/core';
import {CardModule} from "primeng/card";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {AppDataSynchronizerService} from "../../../services/appdata/app-data-synchronizer.service";
import {AuthService} from "../../../services/auth.service";
import {MessageService} from "primeng/api";

/// TODO: when you sign in with google, and there is a mismatch between cloud and local
// we should then ask what the user wants to do.
// This allows us to sync data carefree afterwards, as the use accepted this when they signed in. I think??
// We can add a popup before beginning oauth to explain this to the users.


@Component({
  selector: 'app-sync-appdata-dialog',
  standalone: true,
  imports: [
    CardModule,
    ProgressSpinnerModule
  ],
  templateUrl: './sync-appdata-dialog.component.html',
  styleUrl: './sync-appdata-dialog.component.less'
})
export class SyncAppdataDialogComponent implements OnInit{

  private readonly _synchronisationService = inject(AppDataSynchronizerService);
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);

  public readonly finished = output<void>();

  public async ngOnInit() {
    const result = await this._synchronisationService.loadAsync();
    // if (result === 'unauthorized') {
    //
    // }

    this.finished.emit();
  }

}
