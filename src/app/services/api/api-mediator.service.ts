import {inject, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpErrorResponse, HttpStatusCode} from "@angular/common/http";
import {firstValueFrom, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiMediatorService {
  private readonly _httpClient = inject(HttpClient);
  private _sanitisedBaseUrl: string = environment.api.apiUrl.endsWith('/')
    ? environment.api.apiUrl.substring(0, environment.api.apiUrl.length - 1)
    : environment.api.apiUrl;

  private _notifyUnauthorizedSubject = new Subject<void>();
  public readonly notifyUnauthorized$ = this._notifyUnauthorizedSubject.asObservable();

  public readonly oauthInitUrl = this.makeUrl(environment.api.oauthInitEndpoint);

  public async fetchJwtAsync(fetchCode: string): Promise<string | 'unauthorized' | Error> {
    const url = this.makeUrl(`/oauth/fetch/${fetchCode}`);

    try {
      const request = this._httpClient.post<string | undefined>(url, undefined);
      const response = await firstValueFrom(request);

      return response || new Error('No JWT returned');

    } catch (err) {
      if (this.throwAuthError(err))
        return 'unauthorized';

      console.error("Failed to fetch oauth", err);
      return new Error('Unknown error while fetching JWT');
    }
  }

  public async fetchAppdata(jwt: string): Promise<any | 'unauthorized' | Error> {
    const url = this.makeUrl('/appdata/get/');
    const headers = this.makeAuthHeaders(jwt);

    try {
      const request = this._httpClient.get<any | null | undefined>(url, {
        observe: 'response',
        headers
      });

      const response = await firstValueFrom(request);


      if (response.status !== HttpStatusCode.Ok)
        return new Error(`Invalid HTTP status code (${response.status})`);

      const value = response.body as any | null | undefined; // TODO: we shouldn't blindly trust this type
      return value || new Error('No appdata payload returned');

    } catch (err) {
      if (this.throwAuthError(err)) {
        return 'unauthorized';
      }

      console.error("Failed to fetch appdata", err);
      return new Error('Unknown error while fetching appdata');
    }
  }

  public async saveAppdata(jwt: string, appdata: any): Promise<'success' | 'unauthorized' | Error> {
    const url = this.makeUrl('/appdata/set/');
    const headers = this.makeAuthHeaders(jwt);

    try {
      const request = this._httpClient.post(url, appdata, {
        headers: headers,
        observe: 'response',
        responseType: 'text'
      });
      const response = await firstValueFrom(request);
      return response.status === 200
        ? 'success'
        : new Error(`Invalid response code received (${response.status})`);

    } catch (err) {
      if (this.throwAuthError(err)) {
          return 'unauthorized';
      }

      console.error("Failed to fetch appdata", err);
      return new Error('Unknown error while uploading appdata');
    }
  }

  private throwAuthError(err: any): boolean {
    if (!(err instanceof HttpErrorResponse) || err.status !== HttpStatusCode.Unauthorized)
      return false;

    this._notifyUnauthorizedSubject.next();
    return true;
  }

  private makeAuthHeaders(jwt: string) {
    return {
      'Authorization': `Bearer ${jwt}`,
    }
  }

  private makeUrl(endpoint: string): string {
    const sanitisedEndpoint = endpoint.startsWith('/')
      ? endpoint.substring(1)
      : endpoint;

    return `${this._sanitisedBaseUrl}/${sanitisedEndpoint}`;
  }
}
