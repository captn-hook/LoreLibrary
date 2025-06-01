<script lang="ts">
    import type { CardType } from "./card";
    export let card: CardType;
</script>

<div
    class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden"
>
    <a href="/{card.worldName}">
        <header>
            <img
                src={card.imgSrc}
                class="aspect-[21/9] w-full grayscale hue-rotate-90"
                alt="banner"
            />
        </header>
        <article class="space-y-4 p-4">
            <div>
                <h2 class="h6">{#each card.category as category}
                    <span class="badge badge-primary">{category}</span>
                {/each}</h2>
                <h3 class="h3">{card.worldName}</h3>
            </div>
            <p class="opacity-60">
                {card.description}
            </p>
        </article>
    </a>
    <footer class="flex items-center justify-between gap-4 p-4">
        <a
            href="/profile/{card.author}"
            style="hover: font-weight: bold !important;"
        >
            <small class="opacity-60">By {card.author}</small>
        </a>
        <small class="opacity-60">On {card.date}</small>
    </footer>
</div>
