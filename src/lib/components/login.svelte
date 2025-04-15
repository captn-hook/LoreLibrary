<script>

</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1> Log in </h1>
    <input
        type="text"
        placeholder="Username"
        bind:value={username}
        class="border border-gray-300 rounded p-2 mb-4 w-full"
    />
    <input
        type="password"
        placeholder="Password"
        bind:value={password}
        class="border border-gray-300 rounded p-2 mb-4 w-full"
    />
    <button
        on:click={handleLogin}
        class="bg-blue-500 text-white rounded p-2 w-full"
    >
        Log In
    </button>
    {#if error}
        <p class="text-red-500 mt-2">{error}</p>
    {/if}
    {#if success}
        <p class="text-green-500 mt-2">{success}</p>
    {/if}
</div>