<script lang="ts">
    import { TagsInput } from '@skeletonlabs/skeleton-svelte';
    import IconDelete from '@lucide/svelte/icons/circle-x';
    import { clickOutside } from './clickOutside';
    import { createWorld } from '$lib/scripts/world';
    export let closeMenu: () => void;

    let name = '';
    let tags: string[] = [];
    let description = '';
    let imageUrl = '';
    let type = 'Region';

    const handleSubmit = () => {
        createWorld(
            name,
            tags,
            description,
            imageUrl,
            type
        );
        closeMenu();
    };
</script>
<div class="create-world-form bg-surface-100-900 w-[25%]"
    use:clickOutside={closeMenu}>
    <form
    class="bg-surface-100-900 space-y-4"
    on:submit|preventDefault={handleSubmit}>
        <div class="form-control">
            <label for="name" class="label">
                <span class="label-text">Name</span>
            </label>
            <input id="name" type="text" bind:value={name} placeholder="Enter name" required class="input input-bordered" />
        </div>
        <div class="form-control">
            <TagsInput 
    value={tags} 
    onValueChange={(e) => {
        if (tags.length >= 10 && e.value.length > tags.length) {
            alert('You can only add up to 10 tags.');
            return;
        }
        tags = e.value;
    }}
    placeholder="Add Tag...">
    {#snippet buttonDelete()}
        <IconDelete class="size-4" />
    {/snippet}
    </TagsInput>
        </div>
        <div class="form-control">
            <label for="description" class="label">
                <span class="label-text">Description</span>
            </label>
            <textarea id="description" bind:value={description} placeholder="Enter description" class="textarea textarea-bordered"></textarea>
        </div>
        <div class="form-control">
            <label for="image_url" class="label">
                <span class="label-text">Image URL</span>
            </label>
            <input id="image_url" type="text" bind:value={imageUrl} placeholder="Enter image URL" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label for="type" class="label">
                <span class="label-text">Type</span>
            </label>
            <select id="type" bind:value={type} required class="select select-bordered">
                <option value="Region">Region</option>
                <option disabled value="Wiki">Wiki</option>
                <option disabled value="Network">Network</option>
            </select>
        </div>
        <div class="form-actions flex justify-end space-x-2">
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="button" on:click={closeMenu} class="btn btn-secondary">Cancel</button>
        </div>
    </form>
</div>

<style>
    .create-world-form {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        z-index: 1000;
    }

    /* Optional: Add a backdrop */
    :global(body) {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
    }
</style>