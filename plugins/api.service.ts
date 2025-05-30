import MatchApi from "~/api/MatchApi";

const apiService = {
  ...MatchApi,
};

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: apiService // Injecting as $api
    }
  };
});

// --- Type Augmentation (in e.g., types/nuxt-plugins.d.ts) ---
declare module '#app' {
  interface NuxtApp {
    $api: typeof apiService;
  }
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: typeof apiService;
  }
}