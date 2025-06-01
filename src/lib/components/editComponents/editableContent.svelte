<script lang="ts">
    import type {Content} from "$lib/types/content";
    import {onMount} from "svelte";
    import {editComponentContents} from "$lib/state/editState.svelte";
    import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
    import NumberListEditor from "$lib/components/editComponents/textComponents/numberListEditor.svelte";
    import MarkdownEditor from "$lib/components/editComponents/textComponents/markdownEditor.svelte";
    import HtmlEditor from "$lib/components/editComponents/textComponents/htmlEditor.svelte";
    import ParagraphEditor from "./textComponents/paragraphEditor.svelte";
    import AddComponentButton from "$lib/components/editComponents/controls/addComponentButton.svelte";
    import HeaderEditor from "$lib/components/editComponents/textComponents/headerEditor.svelte";

    export let content: Content;

    type EditableBullet = {
		text: string;
		id: string;
		subItems?: EditableBullet[];
	};
	type EditableNumber = {
		text: string;
		id: string;
		subItems?: EditableNumber[];
	};

    function convertToEditableBulletList(bulletList: { text: string; subBullets?: any[] }[]): EditableBullet[] {
        let idCounter = 0;

        function createEditableBullet(item: { text: string; subItems?: any[] }): EditableBullet {
            const editableBullet: EditableBullet = {
                text: item.text,
                id: (idCounter++).toString(),
                subItems: item.subItems ? item.subItems.map(createEditableBullet) : undefined
            };
            return editableBullet;
        }

        return bulletList.map(createEditableBullet);
    }

	function convertToEditableNumberList(numberList: {text: string; subItems?: any[]}[]): EditableNumber[] {
		let idCounter = 0;

		function createEditableNumber(item: { text: string; subItems?: any[] }): EditableNumber {
			const editableNumber: EditableNumber = {
				text: item.text,
				id: (idCounter++).toString(),
				subItems: item.subItems ? item.subItems.map(createEditableNumber) : undefined
			};
			return editableNumber;
		}
		return numberList.map(createEditableNumber);
	}

    function convertContentToEditableContent(content: Content): Content[] {
        let editableContent = content.map((item: any) => {
            if (item.bulletList) {
                return { bulletList: convertToEditableBulletList(item.bulletList) };
            } else if (item.numberedList) {
                return { numberedList: convertToEditableNumberList(item.numberedList) };
            } else {
                return item;
            }
        }).filter(Boolean);
        console.log(editableContent);
        return editableContent;
    }

    onMount(() => {
        let editableContent = convertContentToEditableContent(content);
        if ($editComponentContents){
            editComponentContents.set(editableContent);
            }
        });
</script>
<div class="w-[50%] flex flex-col mx-0">
<AddComponentButton index={0} />
{#each $editComponentContents as item, index}
	{#if item.bulletList != undefined} 
		<BulletListEditor items={item.bulletList} index={index} />
	{:else if item.numberedList != undefined}
		<NumberListEditor items={item.numberedList} index={index} />
	{:else if item.md !== undefined}
		<MarkdownEditor content={item.md} index={index} />
	{:else if item.html !== undefined}
		<HtmlEditor content={item.html} index={index} />
    {:else if item.text !== undefined}   
        <ParagraphEditor content={item.text} index={index} />
	{:else if item.image !== undefined}
        <!-- Handle image component here if needed -->
        <p>Image component not implemented yet.</p>
    {:else if item.title !== undefined}
        <HeaderEditor content={item.title} index={index} />
    {:else}
        <!-- Handle other types of components here if needed -->
        <p>Unknown component type: {Object.keys(item)}</p>
    {/if}
    <AddComponentButton index={index + 1} />


{/each}
</div>