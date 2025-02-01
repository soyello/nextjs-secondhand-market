import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  onClick?: (lat: number, lng: number) => void;
  detailPage?: boolean;
}

const KakaoMap = ({ latitude, longitude, onClick, detailPage }: KakaoMapProps) => {
  return (
    <Map
      center={{ lat: latitude, lng: longitude }}
      style={{ width: '100%', height: '360px' }}
      onClick={(_, mouseEvent) => {
        if (!detailPage && onClick) {
          onClick(mouseEvent.latLng.getLat(), mouseEvent.latLng.getLng());
        }
      }}
    >
      <MapMarker position={{ lat: latitude, lng: longitude }}>
        <div style={{ color: '#000' }}>Hello</div>
      </MapMarker>
    </Map>
  );
};

export default KakaoMap;
