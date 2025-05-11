<script lang="ts">
	import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
	import { editComponentContents } from "$lib/state/editState.svelte";

	// Recursive type definition for nested bullets
    const bulletList = [
			{ text: "Item 1", subBullets: [{ text: "Sub Item 1" }] },
			{ text: "Item 2", subBullets: [{ text: "Sub Item 1" }] },
			{ text: "Item 3", subBullets: [{ text: "Sub Item 1" }] }
		];
	type EditableBullet = {
		text: string;
		id: number;
		subBullets?: EditableBullet[];
	};

    function convertToEditableBulletList(bulletList: { text: string; subBullets?: any[] }[]): EditableBullet[] {
        let idCounter = 0;

        function createEditableBullet(item: { text: string; subBullets?: any[] }): EditableBullet {
            const editableBullet: EditableBullet = {
                text: item.text,
                id: idCounter++,
                subBullets: item.subBullets ? item.subBullets.map(createEditableBullet) : undefined
            };
            return editableBullet;
        }

        return bulletList.map(createEditableBullet);
    }

    convertToEditableBulletList(bulletList);

    const initialBulletList = convertToEditableBulletList(bulletList);
	// Push to store only if empty
	editComponentContents.update((contents) => {
		if (contents.length === 0) contents.push(initialBulletList);
		return contents;
	});
</script>

<h1>Workshop</h1>

{#each $editComponentContents as item, index (index)}
	<BulletListEditor items={item} index={index} />
{/each}
