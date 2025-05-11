<script lang="ts">
	import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
	import NumberListEditor from "$lib/components/editComponents/textComponents/numberListEditor.svelte";
	import MarkdownEditor from "$lib/components/editComponents/textComponents/markdownEditor.svelte";
	import { editComponentContents } from "$lib/state/editState.svelte";

	// Recursive type definition for nested bullets
    var bulletList = {
		key: "bullet",
		value: [
			{ text: "Item 1", subBullets: [{ text: "Sub Item 1" }] },
			{ text: "Item 2", subBullets: [{ text: "Sub Item 1" }] },
			{ text: "Item 3", subBullets: [{ text: "Sub Item 1" }] }
		]	
	}
	type EditableBullet = {
		text: string;
		id: number;
		subBullets?: EditableBullet[];
	};
	var numberList = {
		key: "number",
		value: [
		{ text: "Item 1", subItems: [{ text: "Sub Item 1" }] },
		{ text: "Item 2", subItems: [{ text: "Sub Item 1" }] },
		{ text: "Item 3", subItems: [{ text: "Sub Item 1" }] }
		]
	}
	type EditableNumber = {
		text: string;
		id: number;
		subItems?: EditableNumber[];
	};
	var markdown = {
		key: "md",
		value: "# Welcome to the Markdown Reader\nThis is a **Markdown** example to test your component.\n\n## Features\n- **Bold text**: **Bold**\n-"
	}

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

	function convertToEditableNumberList(numberList: { text: string; subItems?: any[] }[]): EditableNumber[] {
		let idCounter = 0;

		function createEditableNumber(item: { text: string; subItems?: any[] }): EditableNumber {
			const editableNumber: EditableNumber = {
				text: item.text,
				id: idCounter++,
				subItems: item.subItems ? item.subItems.map(createEditableNumber) : undefined
			};
			return editableNumber;
		}

		return numberList.map(createEditableNumber);
	}
	
	var editableBulletList = {key: bulletList.key, value: [] as EditableBullet[]};
	var editableNumberList = {key: numberList.key, value: [] as EditableNumber[]};
	editableBulletList.value = convertToEditableBulletList(bulletList.value);
	editableNumberList.value = convertToEditableNumberList(numberList.value);
	// Push to store only if empty
	editComponentContents.update((contents) => {
		if (contents.length === 0) {
			contents.push(editableBulletList);
			contents.push(editableNumberList);
			contents.push(markdown);
		} 
		return contents;
	});

	editComponentContents.subscribe((value) => {
		console.log("editComponentContents", value);
	});
</script>

<h1>Workshop</h1>

{#each $editComponentContents as item, index}
	{#if item.key == "bullet"} 
		<BulletListEditor items={item.value} index={index} />
	{:else if item.key == "number"}
		<NumberListEditor items={item.value} index={index} />
	{:else if item.key == "md"}
		<MarkdownEditor content={item.value} index={index} />

	{/if}
{/each}
