import {Component, inject, OnInit} from '@angular/core';
import {CardModule} from "primeng/card";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {AppDataSynchronizerService} from "../../services/app-data-synchronizer.service";
import {Router} from "@angular/router";

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
  private readonly _router = inject(Router);

  public async ngOnInit() {




  }

}
