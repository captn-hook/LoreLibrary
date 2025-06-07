<script lang="ts">
    import DOMPurify from 'dompurify';
    export let html: string;
    // Sanitize the HTML input
    const tmp = document.createElement('div');
    tmp.innerHTML = DOMPurify.sanitize(html);
    console.log('tmp', tmp.innerHTML);

    // remove any script tags
    tmp.querySelectorAll('script').forEach(script => script.remove());
    
    //styling 
    tmp.querySelectorAll('h1').forEach(h1 => {
        console.log('h1', h1);
        h1.classList.add('text-5xl', 'font-bold', 'mb-4');
    });
    tmp.querySelectorAll('h2').forEach(h2 => {
        h2.classList.add('text-3xl', 'font-semibold', 'mb-3');
    });
    tmp.querySelectorAll('h3').forEach(h3 => {          
        h3.classList.add('text-2xl', 'font-semibold', 'mb-2');
    }); 
    tmp.querySelectorAll('p').forEach(p => {
        p.classList.add('text-base', 'mb-2');
    });
    tmp.querySelectorAll('ul').forEach(ul => {
        ul.classList.add('list-disc', 'pl-6', 'mb-2');
    });
    tmp.querySelectorAll('ol').forEach(ol => {
        ol.classList.add('list-decimal', 'pl-6', 'mb-2');
    });
    tmp.querySelectorAll('li').forEach(li => {       
        li.classList.add('text-base', 'mb-1');
    }); 
    tmp.querySelectorAll('blockquote').forEach(blockquote => {
        blockquote.classList.add('border-l-4', 'pl-4', 'italic', 'mb-2');
    });
    let sanitizedHtml = tmp.innerHTML;
</script>

{@html sanitizedHtml}