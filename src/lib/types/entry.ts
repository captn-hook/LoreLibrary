export class Entry {
    id: string;
    ownerId: string;
    parentId: string;
    content: { key: string; value: any }[];


    constructor(id: string, ownerId: string, parentId: string, content: { key: string; value: any }[]) {
        this.id = id;
        this.ownerId = ownerId
        this.parentId = parentId;
        this.content = content;
    }

    static fromJson(json: any): Entry {
        // console.log("Entry JSON:", json); // Log the JSON data
        return new Entry(
            json.name,
            json.ownerId,
            json.parentId,
            // json.content.map((item: any) => {
            //     const key = Object.keys(item)[0];
            //     const value = item[key];
            //     return { key, value };
            // })
            [
                { key: "bulletList", value: [{ text: "hi, im a recusive bullet list", subBullets: [] }, { text: "top level bullet", subBullets: [{ text: "lower level bullet", subBullets: [{ text: "another level down", subBullets: [] }] }] }, { text: "this is a bullet list", subBullets: [] }, { text: "bye", subBullets: [] }] },
                { key: "numberedList", value: [{ text: "hi, im a recursive numbered list", subItems: [] }, { text: "this is an item", subItems: [{ text: "a lower level", subItems: [{ text: "another level down", subBullets: [] }] }] }, { text: "bye", subItems: [] }] },
                { 
                    key: "md", 
                    value: `
# Welcome to the Markdown Reader
This is a **Markdown** example to test your component.

## Features
- **Bold text**: **Bold**
- *Italic text*: *Italic*
- [Links](https://example.com): [Link text](https://example.com)
- Inline code: \`code\`
- Code blocks:
\`\`\`javascript
console.log('Hello, world!');
\`\`\`

# h1
## h2
### h3
#### h4
##### h5
###### h6

- Blockquotes:

> This is a blockquote.
> It can span multiple lines.
> Just like this.

- Lists:
- Item 1
- Item 2
- Sub-item 1
- Sub-item 2

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Data 2   |
| Row 2    | Data 3   | Data 4   |
| Row 3    | Data 5   | Data 6   |
`
                  },
                  { key: "html", value: "<h1>Welcome to the HTML Reader</h1><p>This is an <strong>HTML</strong> example to test your component.</p><h2>Features</h2><ul><li><strong>Bold text</strong>: <strong>Bold</strong></li><li><em>Italic text</em>: <em>Italic</em></li><li><a href=\"https://example.com\">Links</a>: <a href=\"https://example.com\">Link text</a></li><li>Inline code: <code>code</code></li><li>Code blocks:<pre><code class=\"language-javascript\">console.log('Hello, world!');\n</code></pre></li></ul><script>var evil = `evil script1; console.log(evil); </script> " }               
                ]
        );
    }


}