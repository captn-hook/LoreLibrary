<script lang="ts">
    import type { CardType } from '$lib/components/card/card.ts'; // Import the type
    import Card from '$lib/components/card/card.svelte'; // Import the Svelte component

    const card1: CardType = {
        imgSrc: "https://images.unsplash.com/photo-1463171515643-952cee54d42a?q=80&w=450&h=190&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        worldid: "1",
        category: "Dark Fantasy",
        title: "Magedors Mystic Mountain",
        description: "Below the mountain lies eons of history, waiting to be uncovered. The mountain is home to many secrets and treasures, guarded by ancient magic.",
        author: "MagedorTheGreat69",
        date: new Date().toLocaleDateString(),
    };

    const card2: CardType = {
        imgSrc: "https://images.unsplash.com/photo-1668475368605-a965547e55e1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        worldid: "2",
        category: "Cyberpunk",
        title: "Peon City",
        description: "In Peon City, only one thing is guaranteed: the pee on you. The city is a grimy cesspit where only the sociopathic and the insane can survive. The streets are filled with the stench of urine and the sound of gunfire.",
        author: "xX_PeeLiker_Xx",
        date: new Date().toLocaleDateString(),
    };

    const card3: CardType = {
        imgSrc: "https://images.unsplash.com/photo-1420582282039-a6d11404cb66?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        worldid: "3",
        category: "Solarpunk",
        title: "The Garden of Peedin",
        description: "In this lush utopia, the air is filled with the sweet scent of pee, and the sun shines down on a world where nature and technology coexist in perfect harmony. Yet, on the horizon, a storm brews, threatening to disrupt the delicate balance of this paradise.",
        author: "xX_PeeLiker_Xx",
        date: new Date().toLocaleDateString(),
    };
</script>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 1rem;">
    <Card card={card1} />
    <Card card={card2} />
    <Card card={card1} />
    <Card card={card3} />
    <Card card={card2} />
    <Card card={card3} />
    <Card card={card2} />
    <Card card={card1} />
    <Card card={card3} />
</div>