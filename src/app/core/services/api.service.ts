import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  register(user: any) {
    return this.http.post(`${this.BASE_URL}/users/register`, user);
  }

  login(credentials: any) {
    return this.http.post(`${this.BASE_URL}/users/login`, credentials);
  }
}
