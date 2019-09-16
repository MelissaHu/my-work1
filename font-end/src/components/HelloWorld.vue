<template>
  <div>
    <button @click="getNewTest">test</button>
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
    async getNewTest () {
      console.log('2')
      await getNewTest()
    }
  }
}
</script>
