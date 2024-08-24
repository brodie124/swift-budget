import {Injectable} from '@angular/core';
import {initializeApp, FirebaseApp} from "firebase/app";
import {getAuth, signInWithPopup, signOut, GoogleAuthProvider} from "firebase/auth";
import {environment} from "../../environments/environment";
import {onAuthStateChanged, User} from "firebase/auth";
import {firstValueFrom, map, Observable, ReplaySubject, startWith, Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _firebaseApp: FirebaseApp | null = null;
  private _firebaseUserSubject: Subject<User | null> = new ReplaySubject<User | null>(1);

  public readonly firebaseUser$: Observable<User | null> = this._firebaseUserSubject.asObservable();
  public readonly isSignedIn$ = this.firebaseUser$.pipe(
    startWith(null),
    map(user => !!user)
  );

  public get firebaseApp(): FirebaseApp {
    if(!this._firebaseApp)
      throw new Error('Attempted to access firebaseApp before it was initialized!');

    return this._firebaseApp;
  }

  public initialize() {
    this._firebaseApp = initializeApp({
      apiKey: "AIzaSyBn89-qTXGfjnbPxhUt42LibhMH69XHMkM",
      authDomain: "swiftbudget-433519.firebaseapp.com",
    });

    const auth = getAuth(this.firebaseApp);

    onAuthStateChanged(
      auth,
      user => {
        console.info("Firebase user updated!", user);
        this._firebaseUserSubject.next(user);

      },
      () => {
        this._firebaseUserSubject.next(null);
      });
  }

  public async authenticateAsync(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.appdata");

    const isSignedIn = await firstValueFrom(this.isSignedIn$);
    if (isSignedIn) {
      console.info("already signed in!");
      return true;
    }

    const auth = getAuth(this.firebaseApp);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;


      if (!token) {
        console.warn('Failed to sign in with Google!');
        return false;
      }

      const user = result.user;

      localStorage.setItem(environment.cacheKeys.firebaseAccessToken, token);


      console.log("User token", token);
      console.log("User data", user)

    } catch (err) {
      console.error(err);
    }

    return false;

  }

  public signOutAsync(): Promise<void> {
    const auth = getAuth(this.firebaseApp);
    return signOut(auth);
  }
}
