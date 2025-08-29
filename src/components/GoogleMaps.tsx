import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle: React.CSSProperties = {
  width: '400px',
  height: '400px',
};

const center: google.maps.LatLngLiteral = {
  lat: -3.745,
  lng: -38.523,
};

function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY',
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <></>
    </GoogleMap>
  ) : (
    <></>
  );
}
GoogleMaps
export default React.memo(GoogleMaps);