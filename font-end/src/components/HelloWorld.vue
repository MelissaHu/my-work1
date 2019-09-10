<template>
  <div>
    <button @click="getNewJson">test</button>
  </div>
</template>

<script>
import {getNewTest} from '../axios/service.js'
export default {
  data () {
    return {

    }
  },
  methods: {
    getNewJson () {
      this.getNewTest()
    },
    async getNewTest () {
      let data = await getNewTest()
      console.log(data)
    }
  }
}
</script>
