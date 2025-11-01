import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationAdrs {
 
  constructor(private http: HttpClient) {}

  // get current gps position
  getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            });
          },
          (err) => reject(err),
          { enableHighAccuracy: true }
        );
      }
    });
  }

  // get real readable address using openstreetmap api
  async getAddress(): Promise<{ address: string; lat: number; lon: number }> {
    const { lat, lon } = await this.getCurrentPosition();
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const data: any = await this.http
      .get(url, {
        headers: { 'User-Agent': 'marchify-app (test@marchify.com)' },
      })
      .toPromise();

    return { address: data.display_name, lat, lon };
  }
}

  

