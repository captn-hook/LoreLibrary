<script>
  'use client';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { token } from '$lib/context/userContext.svelte.js';

  let currentPath = [];
  let isRoot = false;

  if (browser) {
    currentPath = window.location.pathname.split('/');
    isRoot = currentPath.length === 2 && currentPath[1] === '';
  }

  $: if (browser && $token != null && $token.trim() !== '') {
    // Redirect to dashboard if user is already logged in
    if (isRoot) {
      console.log('Redirecting to dashboard', $token);
      goto('/dashboard');
    }
  } else if (browser) {
    if (currentPath.length === 2 && currentPath[1] === 'dashboard') {
      // Redirect to root if at dashboard
      console.log('Redirecting to root');
      goto('/');
    }
  }
</script>