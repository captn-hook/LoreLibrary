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
    import DeleteComponentButton from "$lib/components/editComponents/controls/deleteComponentButton.svelte";
    import ImageEditor from "$lib/components/editComponents/imageEditor.svelte";

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

    function convertContentToEditableContent(content: Content): Content {
        let editableContent = content.map((item: any) => {
            let id = crypto.randomUUID();
            if (item.bulletList) {
                return { id: id, bulletList: convertToEditableBulletList(item.bulletList) };
            } else if (item.numberedList) {
                return { id: id, numberedList: convertToEditableNumberList(item.numberedList) };
            } else {
                return {...item, id: id };
            }
        });
        console.log(editableContent);
        return editableContent;
    }

    let draggedIndex: number | null = null;

    function onDragStart(index: number, event: DragEvent) {
    draggedIndex = index;

    const target = event.currentTarget as HTMLElement;

    const editorElement = target.closest('.editor-row') as HTMLElement;
    event.dataTransfer?.setDragImage(editorElement, 0, 0);
    }

    function onDrop(targetIndex: number) {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        editComponentContents.update(contents => {
        const next = [...contents];
        const [moved] = next.splice(draggedIndex!, 1);
        next.splice(targetIndex, 0, moved);
        return next;
        });

        draggedIndex = null;
    }

    onMount(() => {
        let editableContent = convertContentToEditableContent(content);
        if ($editComponentContents){
            editComponentContents.set(editableContent);
            }
        });
</script>
<div class="w-[75%] flex flex-col mx-0">
  <AddComponentButton index={0} />

  {#each $editComponentContents as item, index }
  {console.log(item)}
    <div
      role="listitem"
      class="flex flex-col w-full h-full editor-row"
      on:dragstart={(event) => onDragStart(index, event)}
      on:dragover|preventDefault
      on:drop={() => onDrop(index)}
    >
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
      {:else if item.image_url !== undefined}
        <ImageEditor content={item.image_url} index={index} />
      {:else if item.title !== undefined}
        <HeaderEditor content={item.title} index={index} />
      {:else}
        <div class="relative min-h-13">
          <p>Unknown component type: {Object.keys(item)}</p>
          <div class="absolute top-2 right-2">
            <DeleteComponentButton {index} />
          </div>
        </div>
      {/if}

      <AddComponentButton index={index + 1} />
    </div>
  {/each}
</div>