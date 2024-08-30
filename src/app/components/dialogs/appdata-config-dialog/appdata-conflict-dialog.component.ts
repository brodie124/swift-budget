import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {AppdataConflictBridgeService, Conflict} from "../../../services/appdata/appdata-conflict-bridge.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-appdata-conflict-dialog',
  standalone: true,
  imports: [
    DialogModule,
    Button
  ],
  templateUrl: './appdata-conflict-dialog.component.html',
  styleUrl: './appdata-conflict-dialog.component.less'
})
export class AppdataConflictDialogComponent implements OnInit, OnDestroy {
  private readonly _appdataConflictBridge = inject(AppdataConflictBridgeService);

  private readonly _subscriptions = new Subscription();

  public showDialog = signal<boolean>(false);
  public conflict = signal<Conflict>({type: 'origin-mismatch'});

  public lastModifiedMismatchConflict = computed(() => {
    const conflict = this.conflict()
    return conflict.type === 'last-modified-mismatch'
      ? conflict
      : null
  });

  public originMismatchConflict = computed(() => {
    const conflict = this.conflict()
    return conflict.type === 'origin-mismatch'
      ? conflict
      : null
  });

  public malformedDataConflict = computed(() => {
    const conflict = this.conflict()
    return conflict.type === 'malformed-data'
      ? conflict
      : null
  });


  public async ngOnInit() {
    this._subscriptions.add(this._appdataConflictBridge.notifyConflict$.subscribe(this.handleConflictNotification.bind(this)));
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  public async takeCloud() {
    await this._appdataConflictBridge.respond('take-cloud');
    this.showDialog.set(false);
  }

  public async keepLocal() {
    await this._appdataConflictBridge.respond('keep-local');
    this.showDialog.set(false);
  }

  private handleConflictNotification(conflict: Conflict) {
    this.conflict.set(conflict);
    this.showDialog.set(true);
  }
}
