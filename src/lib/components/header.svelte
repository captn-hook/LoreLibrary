<script>
  import {token} from '$lib/context/userContext.svelte.js';
  function setToken(){
    token.set('token');
  }
  </script>
<div class="header p-4">
  <div class="flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <img src="/images/logo.png" alt="Logo" class="h-12 w-auto">
      <h1 class="text-xl font-bold">Lore Library</h1>
    </div>
    <div>
      <button type="button" class="btn preset-tonal-primary" on:click={setToken}>Hi</button>
    </div>
  </div>
</div>