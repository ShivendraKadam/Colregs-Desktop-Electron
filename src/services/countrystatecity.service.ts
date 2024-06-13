import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Country {
  id: number,
  name: string,
  iso2: string
}
export interface State {
  id: number,
  name: string,
  iso2: string
}
export interface City {
  id: number,
  name: string
}


@Injectable({
  providedIn: 'root'
})


export class CountrystatecityService {

  constructor(private httpclient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-CSCAPI-KEY': 'MGZMRlZLbkZ0SmNiOGkxQzBlREFLYjBKdlZZU1BnRmlRbGI3N2lvVg=='
    })
  };

  getCountry(): Observable<Country[]> {
    return this.httpclient.get<Country[]>('https://api.countrystatecity.in/v1/countries', { headers: this.httpOptions.headers })
  }

  getStateOfSelectedCountry(countryIso: string): Observable<any> {
    return this.httpclient.get(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`, { headers: this.httpOptions.headers })
  }

  getCitiesOfSelectedState(countryIso: any, stateIso: any): Observable<any> {
    return this.httpclient.get(`https://api.countrystatecity.in/v1/countries/${countryIso}/states/${stateIso}/cities`, { headers: this.httpOptions.headers })
  }
}
