<template>
  <div class="home">
    <div v-if="isLoaded" style="text-align: center; max-width: 350px; margin: auto">
      <n-card :bordered="false">

      </n-card>
    </div>
    <div v-else style="text-align: center">...loading</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios';
import store from '../store';

const isLoaded = ref(false);
const datum = reactive({} as IStats);

onBeforeMount(async () => {
  // const data = await store.get('stats');
  // Object.assign(datum, data);
  isLoaded.value = true;
});
</script>
