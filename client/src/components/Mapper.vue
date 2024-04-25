<template>
  <div class="map-wrap" v-show="showMap">
    <div class="map" ref="mapContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, watch, onUnmounted, onMounted, markRaw, shallowRef, toRaw } from 'vue';
import type { Position, Point, FeatureCollection, Feature } from 'geojson';
import { Map, NavigationControl, Marker, Popup, FullscreenControl, LngLatBounds } from 'maplibre-gl';
import type {
  GeoJSONSource,
  StyleSpecification,
  ResourceType,
  MapOptions,
  LngLatLike,
  LngLatBoundsLike,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { isMapboxURL, transformMapboxUrl } from 'maplibregl-mapbox-request-transformer';
import store from '../store';

const props = withDefaults(
  defineProps<{
    datum?: [number, number];
    data?: any;
  }>(),
  {}
);
// console.log('setup', props);

const init = ref(false);
const mapContainer = ref<HTMLElement>();
const map = shallowRef<Map>();
const showMap = ref(false);
const marker = shallowRef<Marker>();

const initMap = (lngLat: LngLatLike, geo: any) => {
  // console.log('init map');
  const {
    map_vector: isVector,
    map_tile: tilePath,
    map_style: stylePath,
    map_mapbox: isMapbox,
    map_mapbox_key: mapboxKey,
  } = { map_vector: false, map_tile: '', map_style: null, map_mapbox: false, map_mapbox_key: '' };

  const tileServer = !isVector && tilePath ? tilePath : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const rasterStyle = {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [tileServer],
        tileSize: 256,
        attribution:
          '© <a target="_top" rel="noopener" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  } as StyleSpecification;

  const style = isVector ? stylePath : rasterStyle;

  console.log(style);
  

  if (style) {
    let center = lngLat;
    let bounds: LngLatBoundsLike;
    if (geo) {
      const coordinates = geo.features.map((x: Feature) => (x?.geometry as Point)?.coordinates);
      bounds = coordinates.reduce(
        (bound: any, coord: Position) => bound.extend(coord),
        new LngLatBounds(coordinates[0], coordinates[0])
      );
      center = (bounds as LngLatBounds).getCenter();
    }

    const mapSetup = {
      container: mapContainer.value,
      style,
      center: center,
      zoom: 12,
    } as MapOptions;

    if (isMapbox && mapboxKey) {
      mapSetup.transformRequest = (url: string, rt?: ResourceType) =>
        isMapboxURL(url) ? transformMapboxUrl(url, String(rt), mapboxKey) : { url };
    }

    const map = markRaw(new Map(mapSetup));
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new FullscreenControl({ container: mapContainer.value }));
    // draggable: true
    if (lngLat) {
      marker.value = new Marker({ color: '#FF0000' });
      marker.value
        .setLngLat(lngLat)
        // .setPopup(new Popup().setText('test'))
        .addTo(map);
    }
    map.on('load', async () => {
      map.resize();
      if (geo) {
        const layers = map.getStyle().layers;
        let firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
          }
        }
        map.addSource('points-source', { type: 'geojson', data: geo });
        map.addLayer(
          {
            id: 'points-layer',
            // type: 'symbol',
            type: 'circle',
            source: 'points-source',
            paint: {
              'circle-radius': 10,
              // 'circle-color': 'transparent',
              'circle-stroke-color': 'yellow',
              'circle-stroke-width': 2,
              'circle-color': 'blue',
            },
          },
          firstSymbolId
        );
        map.fitBounds(bounds, { padding: 50, animate: false });
      }
    });
    map.on('click', 'points-layer', function (e) {
      if (e?.features?.length) {
        // console.log(e.features[0]?.properties?.id, e.features[0]?.properties);
        console.log(e.features[0]?.properties?.content, e.features?.[0]?.properties?.features);
        //   const point = geo.features.find((x: Feature) => x.properties?.id === e?.features?.[0]?.properties?.id);
        //   if (point?.properties?.id) {
        //     item.value = point;
        //     showModal.value = true;
        //   }
      }
    });

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
    });
    map.on('mouseenter', 'points-layer', function (e) {
      map.getCanvas().style.cursor = 'pointer';
      const coordinates = (e.features?.[0]?.geometry as Point)?.coordinates?.slice();
      const description = e?.features?.[0]?.properties?.content || '🗅';
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      popup
        .setLngLat(coordinates as LngLatLike)
        .setHTML(description)
        .addTo(map);
    });

    map.on('mouseleave', 'points-layer', function () {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    // map.on('mousemove', 'points-layer', function (e) {
    //   if (e.features.length > 0) {
    //     console.log(e.features[0].properties.content, e.features[0].properties.features);
    // if (hoveredStateId) {
    //   map.setFeatureState({ source: 'states', id: hoveredStateId }, { hover: false });
    // }
    // hoveredStateId = e.features[0].id;
    // map.setFeatureState({ source: 'states', id: hoveredStateId }, { hover: true });
    //   }
    // });

    return map;
  }
};

const renderMap = (options: any) => {
  console.log('render map', options);
  let result = false;

  // if (store?.state?.user?.settings) {
    if (options?.datum?.length || options?.data?.features?.length) {
      result = true;
      if (mapContainer.value) {
        const coordinates = options.datum;
        if (!init.value) {
          map.value = initMap(coordinates, options?.data);
          init.value = true;
        } else {
          console.log('update coordinates');
          if (marker.value && map.value) {
            marker.value.setLngLat(coordinates);
            // map.value.flyTo({ center: coordinates.value });
            map.value.setCenter(coordinates);
          }
        }
      }
    }
  // }
  showMap.value = result;
};

watch(props, () => {
  console.log('props', props);
  renderMap(props);
});

onMounted(() => {
  renderMap(props);
});
onUnmounted(() => {
  map.value?.remove();
});
</script>

<style lang="scss" scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: 400px;
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}

.maplibregl-popup {
  max-width: 400px;
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
</style>
