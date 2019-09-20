<template>
    <div class="basic-map"  ref="basicMap"></div>
    <!-- <button @click="getNewJson">test</button> -->
</template>

<script>
// import {getNewTest} from '../axios/service.js'
export default {
  data () {
    return {
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      const mapOption = {
        center: [37.002553, 106.890747],
        zoom: 3,
        // maxZoom: 18,
        // minZoom: 9,
        zoomControl: false
      }
      this.map = L.map(this.$refs.basicMap, mapOption)
      L.tileLayer('hhttps://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map)
    }
    // getNewJson () {
    //   this.getNewTest()
    // },
    // async getNewTest () {
    //   let data = await getNewTest()
    //   console.log(data)
    // }
  }
}
</script>

<style>
.basic-map{
  /* width:100%;
  height:calc(100vh); */
  width:600px;
  height:600px;
}
</style>
