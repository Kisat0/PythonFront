import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';

const Home: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Style de la carte
      center: [-74.006, 40.7128], // Coordonnées de New York
      zoom: 12, // Zoom initial
    });

    map.on('load', () => {
      // Charger les données GeoJSON des restaurants
      map.addSource('restaurants', {
        type: 'geojson',
        data: '/restaurants.geojson', // Chemin vers le fichier GeoJSON
      });

      // Ajouter une couche pour afficher les restaurants
      map.addLayer({
        id: 'restaurants-layer',
        type: 'circle',
        source: 'restaurants',
        paint: {
          'circle-color': '#FF5733', // Couleur des points
          'circle-radius': 6, // Taille des points
        },
      });

      // Ajouter un événement de clic pour afficher les infobulles
      map.on('click', 'restaurants-layer', (e) => {
        if (!e.features || !e.features[0].geometry || !('coordinates' in e.features[0].geometry)) {
          return;
        }
        const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const description = e.features[0].properties?.description || 'No description available';

        // Assurez-vous que si l'utilisateur zoome, l'infobulle reste au bon endroit
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<p>${description}</p>`)
          .addTo(map);
      });

      // Changer le curseur de la souris en pointeur lorsque l'utilisateur survole les points
      map.on('mouseenter', 'restaurants-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Revenir au curseur par défaut lorsque l'utilisateur ne survole plus les points
      map.on('mouseleave', 'restaurants-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};

export default Home;