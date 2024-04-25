<template>
    <div v-if="isLoaded" style="text-align: center; max-width: 900px; margin: auto">
        <n-card :bordered="false">
            Place {{ id }}
            {{ datum }}
            <Mapper :datum="datum.coordinates ? datum.coordinates.split(',').reverse() : [datum.lon, datum.lat]" />
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { FormInst, FormItemRule, FormValidationError, useMessage } from 'naive-ui';
import store from '../store';

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const vuerouter = useRoute();
const id = ref(String(vuerouter.params.id));
const isLoaded = ref(false);
const datum = reactive({} as IGenPlace);

onBeforeMount(async () => {
    if (id.value) {
        const ids = id.value.split('-');
        const data = await store.get(`places/${ids[0]}`, ids[1]);
        console.log('place', data);
        Object.assign(datum, data?.places?.shift());
    } else {
        console.log('add new');
    }
    isLoaded.value = true;
});

</script>
