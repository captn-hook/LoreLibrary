<script lang="ts">
	import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
	import NumberListEditor from "$lib/components/editComponents/textComponents/numberListEditor.svelte";
	import MarkdownEditor from "$lib/components/editComponents/textComponents/markdownEditor.svelte";
	import HtmlEditor from "$lib/components/editComponents/textComponents/htmlEditor.svelte";
	import { editComponentContents } from "$lib/state/editState.svelte";

	// Recursive type definition for nested bullets
    var bulletList = {
		key: "bullet",
		value: [
			{ text: "Item 1", subItems: [{ text: "Sub Item 1" }] },
			{ text: "Item 2", subItems: [{ text: "Sub Item 1" }] },
			{ text: "Item 3", subItems: [{ text: "Sub Item 1" }] }
		]	
	}
	type EditableBullet = {
		text: string;
		id: number;
		subItems?: EditableBullet[];
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
	var html = {
		key: "html",
		value: "<h1>Welcome to the HTML Reader</h1>\n<p>This is a <strong>HTML</strong> example to test your component.</p>\n<ul>\n<li><strong>Bold text</strong>: <strong>Bold</strong>\n</li>\n</ul>"
	}

    function convertToEditableBulletList(bulletList: { text: string; subItems?: any[] }[]): EditableBullet[] {
        let idCounter = 0;

        function createEditableBullet(item: { text: string; subItems?: any[] }): EditableBullet {
            const editableBullet: EditableBullet = {
                text: item.text,
                id: idCounter++,
                subItems: item.subItems ? item.subItems.map(createEditableBullet) : undefined
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
			contents.push(html);
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
	{:else if item.key == "html"}
		<HtmlEditor content={item.value} index={index} />
	{:else}
		<p>Unknown component type</p>
	{/if}
{/each}
