<script>
  import { login, token, logout } from "$lib/context/userContext.svelte";

  let localToken = "";
  token.subscribe((value) => {
    localToken = value;
  });

  export let openLogin = () => {};

  function handleButtonClick() {
    if (localToken && localToken.trim() !== "") {
      console.log("Logging out...");
      logout();
    } else {
      console.log("Opening login modal...");
      openLogin();
    }
  }
</script>

<button class="btn preset-tonal-primary" on:click={handleButtonClick}>
  {localToken && localToken.trim() !== "" ? "Logout" : "Login"}
</button>