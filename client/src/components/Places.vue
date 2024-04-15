<template>
    <div class="home">
        <div v-if="isLoaded" style="text-align: center; max-width: 900px; margin: auto">
            <n-card :bordered="false">
                {{ datum[0] }}
                <n-data-table :columns="columns" :data="datum" :pagination="pagination" :bordered="false" :row-key="id" />
            </n-card>
        </div>
        <div v-else style="text-align: center">...loading</div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, h } from 'vue';
import axios from 'axios';
import store from '../store';
import { NButton, useMessage, DataTableColumns } from 'naive-ui'

const createColumns = ({
    play
}: {
    play: (row: IGenPlace) => void
}): DataTableColumns<IGenPlace> => {
    return [
        {
            type: 'expand',
            renderExpand: (rowData) => {
                return `${rowData.place_ru} ...`
            }
        },
        {
            title: '#',
            key: 'ui',
            render: (_, index) => {
                return `${index + 1}`
            }
        },
        {
            title: 'Type',
            key: 'place_type'
        },
        {
            title: 'BE',
            key: 'place_be'
        },
        {
            title: 'RU',
            key: 'place_ru'
        },
        {
            title: 'Action',
            key: 'actions',
            render(row) {
                return h(
                    NButton,
                    {
                        strong: true,
                        tertiary: true,
                        size: 'small',
                        onClick: () => play(row)
                    },
                    { default: () => 'View' }
                )
            }
        }
    ]
}


const message = useMessage();
const isLoaded = ref(false);
const datum = reactive([] as Array<IGenPlace>);
const columns = createColumns({
    play(row: IGenPlace) {
        message.info(`Play ${row.id}`)
    }
});
const pagination = false;

onBeforeMount(async () => {
    const data = await store.get('all');
    // const data = await store.get('search', 'пар');
    console.log(data);

    Object.assign(datum, data);
    isLoaded.value = true;
});
</script>