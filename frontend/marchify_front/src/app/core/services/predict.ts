import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Predict {
  private apiUrl = 'http://localhost:3000/api/predict'; // Node backend URL

  constructor(private http: HttpClient) {}

  getPredict(imageBase64: string): Observable<any> {
    return this.http.post(this.apiUrl, { imageBase64 });
  }

}
