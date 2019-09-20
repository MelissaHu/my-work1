<template>
  <div class="container">
    <my-test style="margin-bottom:30px;"></my-test>
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
import MyTest from '../components/test.vue'
export default {
  components: {
    'my-test': MyTest
  }
}
</script>
