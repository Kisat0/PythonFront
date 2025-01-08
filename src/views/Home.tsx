import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "./Home.css";

type PopUpContent = {
  name: string;
  address: string;
  city: string;
  phone: string;
  cuisine: string;
};

const Home: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [popup, setPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<PopUpContent | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json", // Style de la carte
      center: [-74.006, 40.7128], // Coordonnées de New York
      zoom: 12, // Zoom initial
    });

    map.on("load", () => {
      // Charger les données GeoJSON des restaurants
      map.addSource("restaurants", {
        type: "geojson",
        data: "/restaurants.geojson", // Chemin vers le fichier GeoJSON
      });

      // Ajouter une couche pour afficher les restaurants
      map.addLayer({
        id: "restaurants-layer",
        type: "circle",
        source: "restaurants",
        paint: {
          "circle-color": "#FF5733", // Couleur des points
          "circle-radius": 6, // Taille des points
        },
      });

      // Ajouter un événement de clic pour afficher les infobulles
      map.on("click", "restaurants-layer", (e) => {
        if (
          !e.features ||
          !e.features[0].geometry ||
          !("coordinates" in e.features[0].geometry)
        ) {
          return;
        }
        const coordinates = (
          e.features[0].geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number];

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        setPopupContent({
          name: e.features[0].properties?.name || "No name available",
          address: e.features[0].properties?.address || "No address available",
          city: e.features[0].properties?.city || "No city available",
          phone: e.features[0].properties?.phone || "No phone available",
          cuisine: e.features[0].properties?.cuisine || "No cuisine available",
        });

        setPopup(true);
      });

      // Changer le curseur de la souris en pointeur lorsque l'utilisateur survole les points
      map.on("mouseenter", "restaurants-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Revenir au curseur par défaut lorsque l'utilisateur ne survole plus les points
      map.on("mouseleave", "restaurants-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <main>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {popup && popupContent && (
        <div className="popup">
          <button
            className="close-button"
            onClick={() => {
              setPopup(false);
              setPopupContent(null);
            }}
          >
            X
          </button>
          <h3>{popupContent?.name}</h3>
          <p>{popupContent?.address}</p>
          <p>{popupContent?.city}</p>
          <p>{popupContent?.phone}</p>
          <p>{popupContent?.cuisine}</p>
        </div>
      )}
    </main>
  );
};

export default Home;
