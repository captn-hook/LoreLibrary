<script lang="ts">
    import type { CardType } from "$lib/components/card/card.ts"; // Import the type
    import Card from "$lib/components/card/card.svelte"; // Import the Svelte component
    import { PUBLIC_API_URL } from "$env/static/public"; // Import the public API URL

    function getWorlds() {
        return fetch(`${PUBLIC_API_URL}/worlds`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Worlds data:", data); // Log the fetched data
                let cards = data.map((world: any) => {
                    let img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/500px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg'; // Default image URL
                    let desc = "No Description"; // Default description
                    let name = "No Name"; // Default name
                    let date = "unknown" // Default date

                    world.content.forEach((content: any) => {
                        if (content.image_url) {
                            img = content.image_url; // Update image URL if available
                        }
                        if (content.text) {
                            desc = content.text; // Update description if available
                        }
                        if (content.name) {
                            name = content.name; // Update name if available
                        }
                        if (content.date) {
                            date = content.date; // Update date if available
                        }
                    });                        
                    return {
                        imgSrc: img,
                        worldid: name,
                        category: world.tags,
                        title: world.name,
                        description: desc,
                        author: world.ownerId,
                        date: date,
                    } as CardType; // Map the data to the CardType
                });
                return cards; // Return the mapped data
            })
            .catch((error) => {
                console.error("Error fetching worlds:", error); // Log any errors
                throw error; // Rethrow the error to be caught in the template
            });
    }
</script>

<div
    style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 1rem;"
>
    {#await getWorlds() then worlds}
        {#each worlds as world}
            <Card
                card={world}
            />
        {/each}
    {:catch error}
        <p>Error loading worlds: {error.message}</p>
    {/await}
</div>
