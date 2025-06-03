<script lang='ts'>
  import {token} from "$lib/state/userState.svelte";
  import {logout} from "$lib/scripts/user"

  let localToken: string | null = null;
  token.subscribe((value) => {
    localToken = value;
  });

  export let openLogin = () => {};

  function handleButtonClick() {
    if (localToken !== null && localToken.trim() !== "") {
      // User is logged in, perform logout action
      logout();
    } else {
      openLogin();
    }
  }
</script>

<button class="btn preset-tonal-primary" on:click={handleButtonClick}>
  {localToken && localToken.trim() !== "" ? "Logout" : "Login"}
</button>