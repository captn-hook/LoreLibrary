<script>
    'use client';
    import { goto } from '$app/navigation';
    import {token} from '$lib/context/userContext.svelte.js';
    $: if ($token != null && $token != undefined && $token != '') {
      // Redirect to dashboard if user is already logged in
      goto('/dashboard');
    }
</script>