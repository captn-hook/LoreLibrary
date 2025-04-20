<script lang="ts">
  // import { showLogin } from "$lib/context/userContext.svelte";
  import Login from "$lib/components/accountControls/login.svelte";
  import SignUp from "$lib/components/accountControls/signUp.svelte";
  import LogButton from "$lib/components/accountControls/logButton.svelte";
  let showLogin = false;
  let showSignUp = false;


  function openLogin() {
    showLogin = true;
  }
  function openSignUp() {
    showSignUp = true;
  }
</script>

<div class="header p-4">
  <div class="flex justify-between items-center">
    <a href="/" class="flex items-center space-x-4">
      <img src="/images/logo.png" alt="Logo" class="h-12 w-auto" />
      <h1 class="text-xl font-bold">Lore Library</h1>
    </a>
    <LogButton openLogin={openLogin} />
  </div>
  <Login open={showLogin} onClose={() => (showLogin = false)} openSignUp={openSignUp} />
  <SignUp open={showSignUp} onClose={() => (showSignUp = false)} openLogin={openLogin}/>
</div>
