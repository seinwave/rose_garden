import { Controller } from '@hotwired/stimulus';
import mapboxgl from 'mapbox-gl';

const roseIcon = new Image();

export default class extends Controller<Element> {
  connect() {
    const mapContainer = document.getElementById('map-container');
    const roseIconPath = mapContainer && mapContainer.dataset.roseIconPath;

    roseIcon.src = roseIconPath || '';
    document.addEventListener('DOMContentLoaded', () => {
      const accessToken =
        'pk.eyJ1IjoibXNlaWRob2x6IiwiYSI6ImNsbTB1ZjNnbTF2dzMzanA0a2hsbnN3cTMifQ.ES49C0NZwqENe95i8d8TSQ';
      mapboxgl.accessToken = accessToken;
      const map = new mapboxgl.Map({
        container: 'mapbox',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.96527, 40.66911],
        zoom: 19,
        bearing: 14,
      });

      map.on('load', () => {
        map.addImage('rose-icon', roseIcon);

        fetch('/map_data/plants')
          .then((response) => response.json())
          .then((data) => {
            const geoJsonFeatures = data.map((plant) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [plant.longitude, plant.latitude],
              },
              properties: {},
            }));

            const geoJsonFeatureCollection = {
              type: 'FeatureCollection',
              features: geoJsonFeatures,
            };

            map.addSource('plants-source', {
              type: 'geojson',
              data: geoJsonFeatureCollection,
            });

            map.addLayer({
              id: 'custom-marker-layer',
              type: 'symbol',
              source: 'plants-source',
              layout: {
                'icon-image': 'rose-icon',
                'icon-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  0.005,
                  22,
                  0.05,
                ],
                'icon-allow-overlap': false,
              },
            });
          })
          .catch((error) => console.error('Error fetching rose data:', error));
      });
    });
  }
}