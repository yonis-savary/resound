export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = await useUserSession()

  // redirect the user to the login screen if they're not authenticated
  if (!loggedIn.value) {
    const rememberMeToken = useCookie('remember_token');
    
    return rememberMeToken.value 
      ? navigateTo('/api/login/from-token/' + rememberMeToken.value)
      : navigateTo('/login')
  }
})
