export default defineNuxtRouteMiddleware((to, from) => {
  let authStore = useAuth()
  let isAuth = !!authStore.user

  if (isAuth) {
    if (authStore.user?.roles.indexOf('teacher') != -1) {
      return true;
    }
  }
  return abortNavigation();
})