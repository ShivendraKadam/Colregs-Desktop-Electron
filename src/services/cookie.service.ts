import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }



  getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let cookieName = name + "=";
    let c: string;

    for (let i: number = 0; i < ca.length; i += 1) {
      if (ca[i].indexOf(name, 0) > -1) {
        c = ca[i].substring(cookieName.length + 1, ca[i].length);
        console.log("valore cookie: " + c);
        return c;
      }
    }
    return "";
  }
}
