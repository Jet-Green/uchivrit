import { toast } from 'vue3-toastify';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const $apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onRequest({ request, options, error }) {
      // Логика обработки запроса
    },
    onResponse({ response }) {
      // response._data = new myBusinessResponse(response._data)
    },
    onResponseError({ response }) {
      if (response._data.message) {
        if (process.client)
          toast(response._data?.message || "Ошибка", { type: 'error', autoClose: 1000 });
      }
      if (response.status === 401) {
        useState('authRedirect').value = useRoute().path;
        navigateTo('/');
      }
    },
  });

  return {
    provide: {
      apiFetch: $apiFetch,
    },
  };
});