<script lang="ts">
    export let content: Array<{ key: string; value: any }>;
    import {onMount} from "svelte";
    import {editComponentContents} from "$lib/state/editState.svelte";
    import BulletListEditor from "$lib/components/editComponents/textComponents/bulletListEditor.svelte";
    import NumberListEditor from "$lib/components/editComponents/textComponents/numberListEditor.svelte";
    import MarkdownEditor from "$lib/components/editComponents/textComponents/markdownEditor.svelte";
    import HtmlEditor from "$lib/components/editComponents/textComponents/htmlEditor.svelte";
  import ParagraphEditor from "./textComponents/paragraphEditor.svelte";

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

    function convertToEditableBulletList(bulletList: { text: string; subItems?: any[] }[]): EditableBullet[] {
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

	function convertToEditableNumberList(numberList: { text: string; subItems?: any[] }[]): EditableNumber[] {
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

    function convertContentToEditableContent(content: Array<{key: string; value: any }>){
        let editableContent = content.map((item: any, index: number) => {
            if (item.key === 'bulletList') {
                return {key: item.key, value: convertToEditableBulletList(item.value)};
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
	{/if}
{/each}