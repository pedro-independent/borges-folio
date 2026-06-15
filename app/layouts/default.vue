<template>
  <div class="page">
    <AppNav />
    <main><slot /></main>
    <AppFooter :key="$route.path" />
  </div>
</template>
