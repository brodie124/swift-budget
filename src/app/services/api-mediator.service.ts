import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiMediatorService {
  private readonly _httpClient = inject(HttpClient);
  private _sanitisedBaseUrl: string = environment.api.apiUrl.endsWith('/')
    ? environment.api.apiUrl.substring(0, environment.api.apiUrl.length - 1)
    : environment.api.apiUrl;

  public readonly oauthInitUrl = this.makeUrl(environment.api.oauthInitEndpoint);

  public async fetchJwtAsync(fetchCode: string): Promise<string | Error> {
    const url = this.makeUrl(`/oauth/fetch/${fetchCode}`);

    try {
      const request = this._httpClient.post<string | undefined>(url, undefined);
      const response = await firstValueFrom(request);

      return response || new Error('No JWT returned');

    } catch (err) {
      console.error("Failed to fetch oauth", err);
      return new Error('Unknown error while fetching JWT');
    }
  }

  public async fetchAppdata<T>(jwt: string): Promise<T | Error> {
    const url = this.makeUrl('/appdata/get/');
    const headers = this.makeAuthHeaders(jwt);

    try {
      const request = this._httpClient.get<T | null | undefined>(url, {headers});
      const response = await firstValueFrom(request);

      return response || new Error('No appdata payload returned');

    } catch (err) {
      console.error("Failed to fetch appdata", err);
      return new Error('Unknown error while fetching appdata');
    }
  }

  public async saveAppdata(jwt: string, appdata: any): Promise<'success' | Error> {
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
      console.error("Failed to fetch appdata", err);
      return new Error('Unknown error while uploading appdata');
    }
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
