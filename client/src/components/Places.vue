<template>
    <div class="home">
        <div v-if="isLoaded" style="text-align: center; max-width: 900px; margin: auto">
            <n-card :bordered="false">
                <n-data-table :remote="true" :columns="columns" :data="datum" :pagination="pagination" :bordered="false"
                    :row-key="(rowData: IGenPlace) => rowData.id" />
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
                return `${JSON.stringify(rowData)}`
            }
        },
        {
            title: '#',
            key: 'id',
        },
        {
            title: '😥',
            key: 'code_ceased'
        },
        {
            title: '🏰',
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
};

const getData = async () => {
    const data = await store.get('places/1', null, { offset: 0, limit: pagination.pageSize });
    // const data = await store.get('search', 'пар');
    // console.log(data);
    Object.assign(datum, data);
}

onBeforeMount(async () => {
    await getData();
    isLoaded.value = true;
});

const message = useMessage();
const isLoaded = ref(false);
const datum = reactive([] as Array<IGenPlace>);
const columns = createColumns({
    play(row: IGenPlace) {
        message.info(`Play ${row.id}`)
    }
});

const pageSizes = [50, 100, 250];
const pagination = reactive({
    page: 1,
    pageSize: pageSizes[0],
    showSizePicker: true,
    pageSizes,
    onChange: (page: number) => {
        console.log("switch page", page);
        pagination.page = page
    },
    onUpdatePageSize: async (pageSize: number) => {
        console.log("switch pagesize", pageSize);
        pagination.pageSize = pageSize
        pagination.page = 1;
        await getData();
    }
})

</script>
