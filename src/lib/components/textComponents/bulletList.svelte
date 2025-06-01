<script lang="ts">
    import BulletList from '$lib/components/textComponents/bulletList.svelte';
    export let items: { text: string; subItems?: any[] }[] = [];
  </script>
  
  <ul class="list-disc pl-6">
    {#each items as item}
      <li class="my-2 text-base text-neutral-800 dark:text-neutral-200">
        {item.text}
  
        {#if item.subItems?.length}
          <BulletList items={item.subItems} />
        {/if}
      </li>
    {/each}
  </ul>
