import axios from 'axios';

const protectedPaths = [
  '/dev_console',
];

export default async function ({ store, route, redirect }) {
  await store.dispatch('authentication/checkAuth');

  if (route.path === '/login' || route.path === '/register') {
    if (store.getters['authentication/isLoggedIn']) {
      redirect('/');
      return;
    }
  }

  if (protectedPaths.includes(route.path)) {
    if (!store.getters['authentication/isLoggedIn']) {
      redirect('302', '/login', {
        redirect: route.fullPath,
      });
      return;
    }

    // Check if you are authorized to continue
    const payload = {
      path: route.path,
    };
    const resp = await fetch('/', (response) => response);
    await axios.post('/is_authorized', payload, {
      headers: { 'X-CSRF-TOKEN': resp.headers.get('X-CSRF-TOKEN') },
    }).then((response) => {
      if (response.data.authorized === 'false') {
        redirect('/');
      }
    }).catch(() => {
      redirect('/');
    });
  }
}
