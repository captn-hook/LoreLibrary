type SubOption = Record<string, string[]>;
export type MenuOptions = Record<string, SubOption[]>;

//TODO - add contrast switch for color 
//TODO - add svelte color picker as alternative(use hex)
const menuOptions: MenuOptions = {
    'Text': [{'Size': ['Paragraph', 'Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5']}, {'Color': []}, {'Font': ['Bold', 'Italic']}, {'Font Variant': ['Cinzel', 'Cormorant Garamond', 'Uncial Antiqua']}],
    'Background': [{'Color': []}],
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
};//TODO - add align

const mdOptions: MenuOptions = {
    'Text': [{'Color': [], 'Font Variant': ['Cinzel', 'Cormorant Garamond', 'Uncial Antiqua']}],
    'Background': [{'Color': []}],
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
}//TODO - add align

const imageOptions: MenuOptions = {
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
    'Background': [{'Color': []}], //TODO - add align
}

export const getMenuOptions = (type: string): MenuOptions => {
    switch(type) {
        case 'md':
            return mdOptions;
        case 'img':
            return imageOptions;
        default:
            return menuOptions;
    }
}

const roundingTranslations: Record<string, string> = {
    "Sharp": "none",
    "Slight": "sm",
    "Medium": "md",
    "Round": "lg",
    "Full": "full"
};

const pixelTranslations: Record<string, string> = {
    "0px": "0",
    "1px": "1",
    "2px": "2",
    "3px": "3",
    "4px": "4",
    "5px": "5"
};

export const sizeTranslations: Record<string, string> = {
    "Paragraph": "p",
    "Header 1": "h1",
    "Header 2": "h2",
    "Header 3": "h3",
    "Header 4": "h4",
    "Header 5": "h5"
}

export const getClass = (style: any): string => { 
    return `
    ${sizeTranslations[style?.text?.size] || ""} text
    ${style?.text?.font ? `font-${style?.text?.font.toLowerCase()}` : "" }
    
    ${style?.border?.rounding ? `rounded-${roundingTranslations[style.border.rounding]}` : "" }

    ${style?.border?.padding ? `p-${pixelTranslations[style.border.padding]}` : "" }
    ${style?.border?.color ? 'border' : "" }

    whitespace-pre-wrap break-words`;
}

export const getStyle = (style: any): string => {
    return `
        ${style?.text?.color
            ? `color: var(--color-${style.text.color[0].toLowerCase()}-${style.text.color[1]});`
            : ""}
        ${style?.background?.color
            ? `background-color: var(--color-${style.background.color[0].toLowerCase()}-${style.background.color[1]});`
            : ""}
        ${style?.border?.color
            ? `border-color: var(--color-${style.border.color[0].toLowerCase()}-${style.border.color[1]});`
            : ""}
            ${style?.border?.width ? `border-width: ${style.border.width};` : "" }
        ${style?.text?.["font variant"]
            ? `font-family: '${style.text["font variant"]}', serif;`
            : ""}
    `;
};

export const loadFont = (fontName: string) => {
    if (!fontName) return;
    const formattedFont = fontName.replace(/ /g, "+");

    const id = `font-${formattedFont}`;

    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
      document.head.appendChild(link);
    }
  };