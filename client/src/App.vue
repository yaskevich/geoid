<template>
  <n-message-provider>
    <template id="main" v-if="loggedIn">
      <n-layout>
        <n-layout-header class="header">
          <n-space justify="center">
            <n-menu v-model:value="activeKey" mode="horizontal" :options="store.state.nav.options"
              @update:value="processMenu" />
          </n-space>
        </n-layout-header>
        <n-layout-content style="padding-bottom: 3rem">
          <router-view />
        </n-layout-content>
        <n-layout-footer style="padding: 0.25rem">
          <n-space justify="center">
            <n-button text tag="a" href="https://yaskevich.com/" target="_blank">
              <template #icon>
                <n-icon :component="MapFilled" />
              </template>
              2024 &nbsp;<strong>Geoid</strong>
            </n-button>
          </n-space>
        </n-layout-footer>
      </n-layout>
    </template>
    <div v-else style="max-width: 300px; margin: auto">
      <n-tabs default-value="signin" size="large" animated justify-content="center" style="margin: 0 -4px"
        pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
        <n-tab-pane name="signin" tab="Log in">
          <Login />
        </n-tab-pane>
        <n-tab-pane name="signup" tab="Register">
          <Register v-if="access" />
          <n-h2 v-else>
            <n-text type="warning">Registration is closed.</n-text>
          </n-h2>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-message-provider>
</template>
<script setup lang="ts">
import router from './router';
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { MenuOption, NIcon } from 'naive-ui';
import store from './store';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import { MapFilled } from '@vicons/material';

const vuerouter = useRoute();
const activeKey = ref<string | null>(null); // vuerouter?.name||'Home'
const loggedIn = computed(() => store?.state?.token?.length);
// const loggedIn =  true;
const access = ref(false);

const processMenu = async (key: string, item: MenuOption) => {
  if (key === 'logout') {
    store.logoutUser();
  } else if (key === 'profile') {
    router.push(`/user/${store?.state?.user?.id}`);
  }
};

onMounted(async () => {
  await store.getUser();
  console.log(vuerouter?.name);

  if (store?.state?.user?.username) {
    store.initMenu(vuerouter?.name);
    store.state.title = store?.state?.user?.settings?.title ||
      store.state?.user?.dir || '';
  } else {
    // const result = await store.getUnauthorized('registration');
    // access.value = result.status;
    access.value = true;
  }
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header {
  padding: 30px;

  a {
    color: #2c3e50;

    &.router-link-exact-active,
    &.router-link-active {
      color: #42b983;
    }
  }
}

.nav {
  margin-right: 5px;
}

.left {
  text-align: left;
}

.minimal {
  max-width: 600px;
  margin: auto;
}
</style>
