import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import maplibregl from 'maplibre-gl';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  imports: [CommonModule]
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: maplibregl.Map;
  private livreurMarker!: maplibregl.Marker;
  private routeLayerId = 'route';
  private moveInterval: any;

  vendeur: any;
  acheteur: any;
  livreur = { lat: 36.9086, lng: 10.0426 }; 

  showPickupButton = false;
  private waitingForPickup = false;
  private routeCallback?: () => void;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Use actual GPS if desired
          // this.livreur.lat = position.coords.latitude;
          // this.livreur.lng = position.coords.longitude;
          this.livreur.lat = 36.7892;
          this.livreur.lng = 10.1738;
          this.fetchMission('6911fe3e59b10bec362bce13'); 
        },
        (err) => {
          console.error('Cannot access GPS location, using default:', err);
        },
        { enableHighAccuracy: true }
      );

      navigator.geolocation.watchPosition(
        (position) => {
          this.livreur.lat = 36.7892;
          this.livreur.lng = 10.1738;
          // this.livreur.lat = position.coords.latitude;
          // this.livreur.lng = position.coords.longitude;
          if (this.livreurMarker) {
            this.livreurMarker.setLngLat([this.livreur.lng, this.livreur.lat]);
          }
        },
        (err) => console.error('Error watching GPS:', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  ngOnDestroy(): void {
    if (this.moveInterval) clearInterval(this.moveInterval);
  }

  private fetchMission(id: string): void {
    this.http.get<any>(`http://localhost:3000/api/livreur/missions/${id}`).subscribe({
      next: (res) => {
        const mission = res.mission;

        this.vendeur = mission?.commande?.boutique?.localisation;
        this.acheteur = mission?.commande?.client?.localisation;

        if (!this.vendeur || !this.acheteur) {
          console.error('Missing coordinates for vendeur or acheteur');
          return;
        }

        this.initMap();
      },
      error: (err) => console.error('Erreur mission:', err)
    });
  }

  private initMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: [this.livreur.lng, this.livreur.lat],
      zoom: 14
    });

    this.map.on('load', () => {
      this.addMarkers();
      // first leg: to vendeur
      this.drawRoute(this.livreur, this.vendeur, () => {
        // second leg: to acheteur after pickup
        this.drawRoute(this.vendeur, this.acheteur);
      });
    });
  }

  private addMarkers(): void {
    const createPopup = (label: string) =>
      new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        .setHTML(`<div dir="ltr">${label}</div>`);

    new maplibregl.Marker({ color: 'blue' })
      .setLngLat([this.vendeur.lng, this.vendeur.lat])
      .setPopup(createPopup('Vendeur'))
      .addTo(this.map);

    new maplibregl.Marker({ color: 'green' })
      .setLngLat([this.acheteur.lng, this.acheteur.lat])
      .setPopup(createPopup('Acheteur'))
      .addTo(this.map);

    this.livreurMarker = new maplibregl.Marker({ color: 'red' })
      .setLngLat([this.livreur.lng, this.livreur.lat])
      .setPopup(createPopup('Livreur'))
      .addTo(this.map);
  }

  private async drawRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }, callback?: () => void) {
    const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI5N2RmZTM1MGMwOTQxNTdiMjhmNGQ5ZmNiNjBiZTUxIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const route = data.features[0].geometry;

      if (this.map.getSource('route')) this.map.removeLayer(this.routeLayerId) && this.map.removeSource('route');

      this.map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: route, properties: {} }
      });

      this.map.addLayer({
        id: this.routeLayerId,
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#007bff', 'line-width': 5 }
      });

      this.simulateLivreurMovement(route.coordinates, callback);
    } catch (err) {
      console.error('Failed to fetch route:', err);
    }
  }

  private simulateLivreurMovement(coords: number[][], callback?: () => void): void {
    let index = 0;
    this.routeCallback = callback;

    this.moveInterval = setInterval(() => {
      if (index >= coords.length) {
        clearInterval(this.moveInterval);

        if (!this.waitingForPickup && this.routeCallback) {
          this.waitingForPickup = true;
          this.showPickupButton = true;
        } else if (callback) {
          callback();
        }
        return;
      }

      const [lng, lat] = coords[index];
      this.livreurMarker.setLngLat([lng, lat]);
      index++;
    }, 200);
  }

  confirmPickup() {
    this.showPickupButton = false;
    this.waitingForPickup = false;

    if (this.routeCallback) this.routeCallback();
  }
}
