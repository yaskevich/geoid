<template>
    <div class="home">
        <div v-if="isLoaded" style="text-align: center; max-width: 900px; margin: auto">
            <n-card :bordered="false">
                <n-space vertical>
                    <n-popselect v-model:value="tableId" :options="tableSwitchOptions" :on-update:value="switchTable">
                        <n-button>{{ tableSwitchOptions.find(x => x.value === tableId)?.label }}</n-button>
                    </n-popselect>
                    <n-data-table :remote="true" :columns="columns" :data="datum.places" :pagination="pagination"
                        :summary="summary" :bordered="false" :row-key="(rowData: IGenPlace) => rowData.id" />
                </n-space>
            </n-card>
        </div>
        <div v-else style="text-align: center">...loading</div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, h, PropType } from 'vue';
import store from '../store';
import { NButton, useMessage, DataTableColumns } from 'naive-ui';
import type { DataTableCreateSummary } from 'naive-ui';
import Preview from './Preview.vue';

const message = useMessage();
const isLoaded = ref(false);
const datum = reactive({ stats: [] as Array<keyable>, places: [] as Array<IGenPlace> });
const pageSizes = [50, 100, 250];
const tableId = ref(0);

const tableSwitchOptions = [
    {
        label: 'Basic (Lem.)',
        value: 0
    },
    {
        label: 'Table 1',
        value: 1
    },
    {
        label: 'Table 2',
        value: 2
    },
    {
        label: 'Table 3',
        value: 3
    },
    {
        label: 'Table 4',
        value: 4
    },
];

const getData = async () => {
    const data = await store.get('places/' + tableId.value, null, { offset: (pagination.page - 1) * pagination.pageSize, limit: pagination.pageSize });
    // const data = await store.get('search', 'пар');
    // console.log(data);
    Object.assign(datum, data);
    // console.log(data.stats);
    pagination.itemCount = data.stats[tableId.value];
};

const switchTable = async (val: any) => {
    // console.log('switch', val);
    tableId.value = val;
    pagination.page = 1;
    await getData();
};

const summary: DataTableCreateSummary = () => {
    return {
        id: {
            value: h(
                'span',
                { style: { color: 'gray', fontWeight: 'bold' } },
                datum.stats[tableId.value]
            ),
        }
    }
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
    handleCell
}: {
    handleCell: (row: IGenPlace) => void
}): DataTableColumns<IGenPlace> => {
    return [
        {
            type: 'expand',
            renderExpand: (rowData) => h(Preview, { data: rowData }),
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
            key: 'belarusian',
            render(row) {
                return row.place_be || row.name_be || row.cur_name_be
            }
        },
        {
            title: 'RU',
            key: 'russian',
            render(row) {
                return row.place_ru || row.name_ru
            }
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
                        onClick: () => handleCell(row)
                    },
                    { default: () => 'View' }
                )
            }
        }
    ]
};

const columns = createColumns({
    handleCell(row: IGenPlace) {
        message.info(`Row #${row.id}. Action: not implemented`)
    }
});

onBeforeMount(async () => {
    await getData();
    isLoaded.value = true;
});

</script>
