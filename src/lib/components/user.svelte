<script>
  'use client';
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { token } from '$lib/context/userContext.svelte.js';

  $: if (browser && $token != null && $token != undefined && $token != '') {
      // Redirect to dashboard if user is already logged in
      let currentPath = window.location.pathname.split('/');
      let isRoot = currentPath.length == 2 && currentPath[1] == '';
      // if (isRoot){
        //if at root redirect to dashboard
        console.log('Redirecting to dashboard', $token);
        goto('/dashboard');
      // }
  } else if (browser) {
    console.log('Not logged in');
      // Redirect to login page if user is not logged in
      goto('/');
  }
</script>