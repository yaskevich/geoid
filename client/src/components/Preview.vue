<template>
    <n-space>
        <n-tooltip trigger="hover"
            v-for="(val) in Object.entries(data).filter(x => x?.[1] && !['id', 'place_be', 'place_ru', 'lon', 'lat'].includes(x[0])) ">
            <template #trigger><n-tag>{{ val[1] }}</n-tag></template>
            {{ val[0] }}
        </n-tooltip>
    </n-space>
</template>

<script setup lang="ts">

import { NTag, NSpace, NIcon } from 'naive-ui';

defineProps<{
    data: keyable,
}>();


</script>