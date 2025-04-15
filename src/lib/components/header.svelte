<script>
  import { login, token, logout } from "$lib/context/userContext.svelte.js";
  let localToken = "";
  token.subscribe((value) => {
    localToken = value;
  });
</script>

<div class="header p-4">
  <div class="flex justify-between items-center">
    <a href="/" class="flex items-center space-x-4">
      <img src="/images/logo.png" alt="Logo" class="h-12 w-auto" />
      <h1 class="text-xl font-bold">Lore Library</h1>
    </a>
    <button
      type="button"
      class="btn preset-tonal-primary"
      on:click={() =>
        localToken && localToken.trim() != "" ? logout() : login("token")}
    >
      {localToken && localToken.trim() != "" ? "Log Out" : "Log In"}
    </button>
  </div>
</div>
