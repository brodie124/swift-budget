import {inject, Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {firstValueFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AppDataSynchronizerService {
  private readonly _authService = inject(AuthService);
  private readonly _httpClient = inject(HttpClient);

  public async loadAsync() {

    const request = this._httpClient.get<any>('http://localhost:3000/appdata/get', {
      withCredentials: true
    });

    const response = await firstValueFrom(request);
    console.log(response);


    //
    // const user = await firstValueFrom(this._authService.firebaseUser$);
    // if (!user)
    //   throw new Error('Cannot synchronize when user is not signed in!');
    //
    // const token = await user.getIdToken();
    // const auth = getAuth(this._authService.firebaseApp);
    //
    // const request = this._httpClient.get('https://www.googleapis.com/drive/v3/files', {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   },
    //   params: {
    //     spaces: 'appDataFolder',
    //     fields: 'nextPageToken, files(id, name)',
    //     pageSize: 100,
    //   }
    // });
    //
    // const result = await firstValueFrom(request);
    // console.log("Got back files: ", result);


    // const service = google.drive('v3');
    // //
    // // const response = await service.files.list({
    // //   spaces: 'appDataFolder',
    // //   fields: 'nextPageToken, files(id, name)',
    // //   pageSize: 100,
    // // });
    // //
    // // console.log("Got response", response);
    // //
    // // response.data?.files?.forEach(function(file) {
    // //   console.log('Found file:', file.name, file.id);
    // // });
  }
}
