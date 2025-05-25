<script lang="ts">
    export let content: Array<{ key: string; value: any }>;
    import {onMount} from "svelte";
    import {editComponentContents} from "$lib/state/editState.svelte";
    import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
    import NumberListEditor from "$lib/components/editComponents/textComponents/numberListEditor.svelte";
    import MarkdownEditor from "$lib/components/editComponents/textComponents/markdownEditor.svelte";
    import HtmlEditor from "$lib/components/editComponents/textComponents/htmlEditor.svelte";
    import ParagraphEditor from "./textComponents/paragraphEditor.svelte";
    import AddComponentButton from "$lib/components/editComponents/controls/addComponentButton.svelte";
    import HeaderEditor from "$lib/components/editComponents/textComponents/headerEditor.svelte";
    type EditableBullet = {
		text: string;
		id: number;
		subBullets?: EditableBullet[];
	};
	type EditableNumber = {
		text: string;
		id: number;
		subItems?: EditableNumber[];
	};

    function convertToEditableBulletList(bulletList: {key: string, value: { text: string; subBullets?: any[] }[]}): EditableBullet[] {
        let idCounter = 0;

        function createEditableBullet(item: { text: string; subBullets?: any[] }): EditableBullet {
            const editableBullet: EditableBullet = {
                text: item.text,
                id: idCounter++,
                subBullets: item.subBullets ? item.subBullets.map(createEditableBullet) : undefined
            };
            return editableBullet;
        }

        return bulletList.value.map(createEditableBullet);
    }

	function convertToEditableNumberList(numberList: {key: string, value: {text: string; subItems?: any[] }[]}): EditableNumber[] {
		let idCounter = 0;

		function createEditableNumber(item: { text: string; subItems?: any[] }): EditableNumber {
			const editableNumber: EditableNumber = {
				text: item.text,
				id: idCounter++,
				subItems: item.subItems ? item.subItems.map(createEditableNumber) : undefined
			};
			return editableNumber;
		}
        console.log(numberList);
		return numberList.value.map(createEditableNumber);
	}

    function convertContentToEditableContent(content: Array<{key: string; value: any }>){
        let editableContent = content.map((item: any, index: number) => {
            if (item.key === 'bulletList') {
                return {key: item.key, value: convertToEditableBulletList(item)};
            } else if (item.key === 'numberedList') {
                return {key: item.key, value: convertToEditableNumberList(item)};
            } else if (item.key === 'md') {
                return { key: 'md', value: item.value };
            } else if (item.key === 'html') {
                return { key: 'html', value: item.value };
            }else if (item.key === "text"){
                return {key: item.key, value: item.value};
            }else {
                return {key: item.key, value: item.value};
            }
        }).filter(Boolean);
        return editableContent;
    }

    onMount(() => {
        let editableContent = convertContentToEditableContent(content);
        if ($editComponentContents){
            editComponentContents.set(editableContent);
            }
        });
</script>
<div class="w-[50%] flex flex-col items-center mx-0">
<AddComponentButton index={0} />
{#each $editComponentContents as item, index}
	{#if item.key == "bulletList"} 
		<BulletListEditor items={item.value} index={index} />
	{:else if item.key == "numberedList"}
		<NumberListEditor items={item.value} index={index} />
	{:else if item.key == "md"}
		<MarkdownEditor content={item.value} index={index} />
	{:else if item.key == "html"}
		<HtmlEditor content={item.value} index={index} />
    {:else if item.key == "text"}   
        <ParagraphEditor content={item.value} index={index} />
	{:else if item.key == "image"}
        <!-- Handle image component here if needed -->
        <p>Image component not implemented yet.</p>
    {:else if item.key == "title"}
        <HeaderEditor content={item.value} index={index} />
    {:else}
        <!-- Handle other types of components here if needed -->
        <p>Unknown component type: {item.key}</p>
    {/if}
    <AddComponentButton index={index + 1} />


{/each}
</div>