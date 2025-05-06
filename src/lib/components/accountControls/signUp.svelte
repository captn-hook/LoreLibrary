<script>
    import {signup} from '$lib/scripts/user'
    export let open = false;
    export let onClose = () => {};
    export let openLogin = () => {};
  
    let username = '';
    let password = '';
    let email = '';
  
    function handleSignUp() {
     signup(username, email, password);
    onClose();
    }

    function handleLogin() {
        console.log("Logging in...");   
        onClose();
        openLogin();
    }


</script>
 {#if open}
<div
    class="fixed inset-0 bg-base-100 flex justify-center items-center z-10"
    role="button"
    tabindex="0"
    on:click={onClose}
    on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClose();
    }}
    style="background-color: rgba(0, 0, 0, 0.5);"
>
    <div
        class="bg-secondary p-6 rounded-lg w-80 shadow-lg text-center"
        role="dialog"
        tabindex="0"
        aria-modal="true"
        aria-labelledby="login-title"
        on:click|stopPropagation
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        style="background-color: #708090;"
    >
        <h2 id="login-title" class="text-xl font-bold mb-4 text-primary">Sign Up</h2>
        <label for="email" class="block text-primary font-medium mb-1 text-left">Email</label>
        <input
            id="email"
            type="text"
            placeholder="Email"
            bind:value={email}
            class="input input-bordered w-full mb-4 text-primary placeholder-primary"
        />
        <label for="username" class="block text-primary font-medium mb-1 text-left">Username</label>
        <input
            id="username"
            type="text"
            placeholder="Username"
            bind:value={username}
            class="input input-bordered w-full mb-4 text-primary placeholder-primary"
        />
        <label for="password" class="block text-primary font-medium mb-1 text-left">Password</label>
        <input
            id="password"
            type="password"
            placeholder="Password"
            bind:value={password}
            class="input input-bordered w-full mb-4 text-primary placeholder-primary"
        />
        <p>Already have an account? <a href="#" on:click={handleLogin} class="text-primary underline cursor-pointer">Login</a></p>
        <div class="flex justify-center"></div>
            <button on:click={handleSignUp} class="btn preset-tonal-primary mt-4 text-primary">Sign Up</button>
        </div>
    </div>
{/if}
