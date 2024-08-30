import {inject, Injectable} from '@angular/core';
import {ConfirmationService} from "primeng/api";
import {Confirmation} from "primeng/api/confirmation";
import {Observable} from "rxjs";


export type AsyncConfirmation = Omit<Confirmation, "accept" | "reject">

@Injectable({
  providedIn: 'root'
})
export class AsyncConfirmationService {
  private readonly _confirmationService: ConfirmationService = inject(ConfirmationService);

  public get requireConfirmation$(): Observable<Confirmation> {
    return this._confirmationService.requireConfirmation$;
  }

  public get accept():Observable<Confirmation> {
    return this._confirmationService.accept;
  }

  confirmAsync(confirmation: AsyncConfirmation): Promise<'accepted' | 'rejected'> {
    return new Promise(resolve => {
      this._confirmationService.confirm({
        ...confirmation,
        accept: () => resolve('accepted'),
        reject: () => resolve('rejected')
      });
    });
  }

  /**
   * Closes the dialog.
   * @group Method
   */
  public close(): this {
    this._confirmationService.close();
    return this;
  }

  /**
   * Accepts the dialog.
   * @group Method
   */
  public onAccept(): void {
    return this._confirmationService.onAccept();
  }
}
