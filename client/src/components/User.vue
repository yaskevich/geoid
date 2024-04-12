<template>
  <n-card
    :title="user?.id ? `${user.firstname} ${user.lastname}` : 'User'"
    :bordered="false"
    class="minimal left"
    v-if="isLoaded">
    <n-form ref="formRef" :label-width="80" :model="user" :rules="rules">
      <n-form-item label="Username" path="username">
        <n-input v-model:value="user.username" @input="user.username = user.username.toLocaleLowerCase()" />
      </n-form-item>
      <n-form-item label="E-mail" path="email">
        <n-input v-model:value="user.email" placeholder="test@mail.com" />
      </n-form-item>
      <n-form-item label="First Name" path="firstname">
        <n-input v-model:value="user.firstname" />
      </n-form-item>
      <n-form-item label="Last Name" path="lastname">
        <n-input v-model:value="user.lastname" />
      </n-form-item>
      <n-space>
        <template v-if="store?.state?.user?.privs === 1">
          <template v-if="user.activated">
            <n-alert
              v-if="String(store?.state?.user?.id) === id"
              title="Disabling your own account is not allowed"
              type="warning"
              >Ask other administrators to deactivate your account if you do not need it anymore</n-alert
            >
            <n-button v-else type="error" @click="changeActivationStatus(false)">Deactivate</n-button>
            <n-button v-if="user.activated && user.privs > 1" type="warning" @click="requestElevation"
              >Make administrator</n-button
            >
          </template>
          <template v-else>
            <n-button type="success" @click="changeActivationStatus(true)">Activate</n-button>
          </template>
          <n-button type="error" @click="resetPassword">Reset password</n-button>
          <n-button type="info" @click="saveUser">Save</n-button>
        </template>
        <template v-else>
          <n-button v-if="store?.state?.user?.id === user?.id" type="info" @click="saveUser">Save</n-button>
        </template>
      </n-space>
      <div style="font-family: monospace; font-size: 1.7rem; margin-top: 2rem">{{ datum?.message }}</div>
    </n-form>
  </n-card>
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
const user = reactive({} as IUser);
const datum = reactive({ message: '' });

const rules = {
  username: {
    required: true,
    message: 'Username cannot be empty and must contain English letters and numbers only',
    trigger: ['input', 'blur'],
    pattern: new RegExp(/^[a-z][a-z0-9]+$/),
  },
  firstname: {
    required: true,
    message: 'First name cannot be empty',
    trigger: ['input', 'blur'],
  },
  lastname: {
    required: true,
    message: 'Last name cannot be empty',
    trigger: ['input', 'blur'],
  },
  email: {
    required: true,
    message: 'E-mail cannot be empty',
    trigger: ['input', 'blur'],
    type: 'email',
  },
};

const changeActivationStatus = async (status: boolean) => {
  const data = await store.post('user/activate', { id: id.value, status: status });
  console.log('activation status', status, data);
  if (data?.id) {
    user.activated = status;
  }
};

const requestElevation = async () => {
  const data = await store.post('user/elevate', { id: id.value });
  console.log('elevated', data);
  if (data?.id) {
    user.privs = 1;
  }
};

const saveUser = async (e: MouseEvent) => {
  e.preventDefault();
  try {
    await formRef.value?.validate(async errors => {
      if (!errors) {
        // message.success('Valid');
        const data = await store.post('user/update', user);
        // console.log("save", data);
        if (!data?.id) {
          message.error(data?.error ? data.error : 'unknown error');
        }
      } else {
        console.log(errors);
        // message.error('Not all required fields are filled!');
      }
    });
  } catch (error) {
    console.log('fail');
  }
};

const resetPassword = async () => {
  const data = await store.post('user/reset', user);
  Object.assign(datum, data);
  if (!data?.id) {
    message.error(data?.error ? data.error : 'unknown error');
  }
};

onBeforeMount(async () => {
  if (id.value) {
    const data = await store.get('users', id.value);
    // console.log('user', data?.[0]);
    Object.assign(user, data.shift());
  } else {
    console.log('add new');
  }
  isLoaded.value = true;
});
</script>
