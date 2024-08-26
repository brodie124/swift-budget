import {Component, inject, OnInit, signal} from '@angular/core';
import {environment} from "../environments/environment";
import {EncryptionService} from "./services/encryption.service";
import {Event, Router, RouterEvent} from "@angular/router";
import {filter} from "rxjs";
import {LocalStorageService} from "./services/local-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  private readonly _encryptionService = inject(EncryptionService);
  private readonly _localStorageService = inject(LocalStorageService);
  private readonly _router = inject(Router)

  public readonly isNavbarEnabled = signal<boolean>(environment.enableNavbar);

  public showUnlockModal = this._encryptionService.isEnabled();
  public syncData: boolean = true;

  public async ngOnInit(): Promise<void> {
    this._router.events.pipe(
      filter((e: Event | RouterEvent): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((e: RouterEvent) => {
      this.isNavbarEnabled.set(environment.enableNavbar && e.url.indexOf('oauth2/callback') === -1)
    });

    this.syncData = this._localStorageService.getItem(environment.cacheKeys.enableCloudSync) === '1';
  }

  unlock() {
    this.showUnlockModal = false;
  }

  syncFinish() {
    this.syncData = false;
  }
}
