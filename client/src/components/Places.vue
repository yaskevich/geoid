<template>
    <div class="home">
        <div v-if="isLoaded" style="text-align: center; max-width: 900px; margin: auto">
            <n-card :bordered="false" :summary="summary">
                <n-data-table :remote="true" :columns="columns" :data="datum.places" :pagination="pagination"
                    :summary="summary" :bordered="false" :row-key="(rowData: IGenPlace) => rowData.id" />
            </n-card>
        </div>
        <div v-else style="text-align: center">...loading</div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, h } from 'vue';
import axios from 'axios';
import store from '../store';
import { NTag, NSpace, NIcon } from 'naive-ui';
import { NButton, useMessage, DataTableColumns } from 'naive-ui';
import type { DataTableCreateSummary } from 'naive-ui';

import Preview from './Preview.vue';


const summary: DataTableCreateSummary = () => {
    return {
        id: {
            value: h(
                'span',
                { style: { color: 'gray', fontWeight: 'bold' } },
                datum.stats[tableId]
            ),
        }
    }
};

const tableId = 1;
const message = useMessage();
const isLoaded = ref(false);
const datum = reactive({ stats: [] as Array<keyable>, places: [] as Array<IGenPlace> });
const pageSizes = [50, 100, 250];

const getData = async () => {
    const data = await store.get('places/' + tableId, null, { offset: (pagination.page - 1) * pagination.pageSize, limit: pagination.pageSize });
    // const data = await store.get('search', 'пар');
    // console.log(data);
    Object.assign(datum, data);
    pagination.itemCount = data.stats[tableId];
};

const pagination = reactive({
    page: 1,
    itemCount: 0,
    pageSize: pageSizes[0],
    showSizePicker: true,
    pageSizes,
    onChange: async (page: number) => {
        // console.log("switch page", page);
        pagination.page = page;
        await getData();
    },
    onUpdatePageSize: async (pageSize: number) => {
        // console.log("switch pagesize", pageSize);
        pagination.pageSize = pageSize
        pagination.page = 1;
        await getData();
    }
});


const createColumns = ({
    play
}: {
    play: (row: IGenPlace) => void
}): DataTableColumns<IGenPlace> => {
    return [
        {
            type: 'expand',
            renderExpand: (rowData) => {
                return h(
                    NSpace, null, {
                    default: () => [
                        Object.entries(rowData).filter(x => x?.[1] && !['id', 'place_be', 'place_ru', 'lon', 'lat'].includes(x[0])).map(x => h(
                            NTag,
                            { style: { color: 'gray', fontWeight: 'bold' } },
                            `${x[0]} ${x[1]}`
                        ))]
                });
            },
        },
        {
            title: '#',
            key: 'id',
        },
        {
            // title: '😥',
            title: 'Lon',
            // key: 'code_ceased'
            key: 'lon'
        },
        {
            // title: '🏰',
            title: 'Lat',
            // key: 'place_type'
            key: 'lat'
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
};

const columns = createColumns({
    play(row: IGenPlace) {
        message.info(`Play ${row.id}`)
    }
});

onBeforeMount(async () => {
    await getData();
    isLoaded.value = true;
});

</script>
