<script lang="ts">
  // import { showLogin } from "$lib/context/userContext.svelte";
  import Login from "$lib/components/accountControls/login.svelte";
  import SignUp from "$lib/components/accountControls/signUp.svelte";
  import LogButton from "$lib/components/accountControls/logButton.svelte";
  import { onMount } from "svelte";
  let showLogin = false;
  let showSignUp = false;
  let logoSrc = "/images/logo_l.png"; // Default to light mode logo
  let logo_bg_color = "bg-surface-200";



  function openLogin() {
    showLogin = true;
  }
  function openSignUp() {
    showSignUp = true;
  }

  function updateLogoBasedOnTheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      logoSrc = "/images/logo_d.png";
      logo_bg_color = "bg-surface-800";
    } else {
      logoSrc = "/images/logo_l.png";
      logo_bg_color = "bg-surface-200";
    }
  }

  onMount(() => {
    // Initial logo setup
    updateLogoBasedOnTheme();

    // Listen for changes in the color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateLogoBasedOnTheme();
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on component destroy
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });

</script>

<div class="header pt-4 pl-4 pr-4">
  <div class="flex justify-between items-center">
    <a href="/" class="flex items-center space-x-4">
      <img 
        src={logoSrc} 
        alt="Logo" 
        class="h-12 w-12 rounded-full {logo_bg_color}"
      />
      <h1 class="text-xl font-bold">Lore Library</h1>
    </a>
    <LogButton openLogin={openLogin} />
  </div>
  <Login open={showLogin} onClose={() => (showLogin = false)} openSignUp={openSignUp} />
  <SignUp open={showSignUp} onClose={() => (showSignUp = false)} openLogin={openLogin}/>
</div>
