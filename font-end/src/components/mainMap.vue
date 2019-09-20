<template>
    <div class="basic-map"  ref="basicMap"></div>
    <!-- <button @click="getNewJson">test</button> -->
</template>

<script>
export default {
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      const mapOption = {
        center: [31.238893, 121.47824],
        zoom: 11,
        maxZoom: 18,
        minZoom: 9,
        attributionControl: false,
        zoomControl: false
      }
      this.map = L.map(this.$refs.basicMap, mapOption)
      L.tileLayer('http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}', {
        // L.tileLayer('http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}', {
      }).addTo(this.map)
    },
    getMap () {
      return this.map
    }
  }

}
</script>

<style>
.basic-map {
  width: 1500px;
  height: 1000px;
}
</style>
