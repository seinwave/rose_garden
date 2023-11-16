import { Controller } from '@hotwired/stimulus';
import { fetchPlants, routeToInfoPanel } from '../api';
import mapboxgl from 'mapbox-gl';
import type { Map } from 'mapbox-gl';

export default class MapController extends Controller<Element> {
  initialize() {
    this.generateMap();
  }

  fetchMap() {
    const accessToken =
      'pk.eyJ1IjoibXNlaWRob2x6IiwiYSI6ImNsbnRkcmU1bDAyZmsycW8wdm94dmlsazEifQ.73QWWjTn7i9A0xsesKLqeQ';
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.96527, 40.66911],
      zoom: 19,
      bearing: 14,
    });

    return map;
  }

  generateIcons() {
    const mapContainer = document.getElementById('map-container');

    const roseIcon = new Image();
    const roseIconPath = mapContainer && mapContainer.dataset.roseIconPath;
    roseIcon.src = roseIconPath || '';

    const heartIcon = new Image();
    const heartIconPath = mapContainer && mapContainer.dataset.heartIconPath;
    heartIcon.src = heartIconPath || '';

    return { roseIcon, heartIcon };
  }

  generateMarkers(map: Map) {
    const { roseIcon, heartIcon } = this.generateIcons();

    map.on('load', async () => {
      map.addImage('rose-icon', roseIcon);
      map.addImage('heart-icon', heartIcon);

      const plantData = await fetchPlants();

      const geoJsonFeatures: Array<
        GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>
      > = plantData.map((plant) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [plant.longitude, plant.latitude],
        },
        properties: {
          id: plant.id,
          cultivar_id: plant.cultivar_id,
          cultivar_name: plant.cultivar_name,
          is_favorite: plant.is_favorite?.toString(),
        },
      }));

      const featureCollection: GeoJSON.FeatureCollection<
        GeoJSON.Point,
        GeoJSON.GeoJsonProperties
      > = {
        type: 'FeatureCollection',
        features: geoJsonFeatures,
      };

      map.addSource('plants-source', {
        type: 'geojson',
        data: featureCollection,
      });

      map.addLayer({
        id: 'custom-marker-layer',
        type: 'symbol',
        source: 'plants-source',
        layout: {
          'icon-image': [
            'match',
            ['get', 'is_favorite'],
            ['true'],
            'heart-icon',
            ['false'],
            'rose-icon',
            'heart-icon',
          ],
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
          'text-field': ['get', 'cultivar_name'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 1.5,
          'text-justify': 'auto',
        },
      });
    });
  }

  addClickHandlers(map: Map) {
    map.on('click', 'custom-marker-layer', function (e) {
      if (!e.features || !e.features[0] || !e.features[0].properties) {
        return;
      }
      const cultivarId = e.features[0].properties.cultivar_id;
      routeToInfoPanel(cultivarId);
    });
  }

  querySourceFeatures(map: Map, cultivarId: number | undefined) {
    const features = map.querySourceFeatures('plants-source', {
      filter: ['==', 'cultivar_id', cultivarId],
    });
    return features;
  }

  generateMap() {
    const map = this.fetchMap();
    this.generateMarkers(map);
    this.addClickHandlers(map);
  }
}
