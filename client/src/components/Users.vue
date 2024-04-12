<template>
  <n-card title="Users" :bordered="false" class="minimal left" v-if="isLoaded">
    <template #header-extra>
      <n-button type="primary" @click="editUser">+ new</n-button>
    </template>
    <n-space vertical size="large">
      <n-grid cols="2 s:3 m:3 l:3 xl:3" x-gap="12" responsive="screen" v-for="item in users" :key="item.id">
        <n-gi>
          <n-button-group size="small">
            <n-tag :type="item.activated ? 'success' : 'warning'">
              {{ item.firstname }} {{ item.lastname }}
              <template #icon>
                <n-icon
                  :component="
                    item.activated ? (item.privs > 1 ? CheckCircleRound : SecurityFilled) : RadioButtonUncheckedFilled
                  " />
              </template>
            </n-tag>
            <n-tooltip trigger="hover" v-if="item?.note">
              <template #trigger>
                <n-tag type="default">
                  <template #icon>
                    <n-icon :component="InfoOutlined" />
                  </template>
                </n-tag>
              </template>
              {{ item.note }}
            </n-tooltip>
          </n-button-group>
        </n-gi>
        <n-gi>
          <n-tooltip trigger="hover" placement="right" v-if="item?.requested">
            <template #trigger>
              <n-tag>
                <n-time :time="new Date(item.requested)" type="relative" />
              </n-tag>
            </template>
            <n-time :time="new Date(item.requested)" />
          </n-tooltip>
        </n-gi>
        <n-gi style class="aligned">
          <n-button type="info" size="small" @click="editUser(item)">Manage</n-button>
        </n-gi>
      </n-grid>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import store from '../store';
import router from '../router';
import { ref, reactive, onBeforeMount, h } from 'vue';
import { CheckCircleRound, SecurityFilled, RadioButtonUncheckedFilled, InfoOutlined } from '@vicons/material';
import { NAlert, useMessage } from 'naive-ui';
import type { MessageRenderMessage } from 'naive-ui';

const renderMessage: MessageRenderMessage = props => {
  const { type } = props;
  return h(
    NAlert,
    {
      closable: props.closable,
      onClose: props.onClose,
      type: type === 'loading' ? 'default' : type,
      title: 'Registration procedure',
      style: {
        boxShadow: 'var(--n-box-shadow)',
        maxWidth: '250px',
      },
    },
    {
      default: () => props.content,
    }
  );
};

const message = useMessage();
const users: Array<IUser> = reactive([] as Array<IUser>);
const isLoaded = ref(false);

onBeforeMount(async () => {
  const data = await store.get('users');
  Object.assign(users, data);
  // console.log('data from server', data);
  isLoaded.value = true;
});

const editUser = async (user: IUser) => {
  if (user?.id) {
    router.push(`/user/${user.id || ''}`);
  } else {
    message.info(
      `New users register by themselves. After that, the administrators will be able to activate new accounts.`,
      {
        render: renderMessage,
        closable: true,
        duration: 10000,
      }
    );
  }
};
</script>

<style>
.aligned {
  text-align: right;
}

@media only screen and (max-width: 600px) {
  .aligned {
    text-align: left;
  }
}
</style>
