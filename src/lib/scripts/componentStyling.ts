type SubOption = Record<string, string[]>;
export type MenuOptions = Record<string, SubOption[]>;


const menuOptions: MenuOptions = {
    'Text': [{'Size': ['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5']}, {'Color': []}, {'Font': ['Bold', 'Italic']}, {'Font Variant': ['Cinzel', 'Cormorant Garamond', 'Uncial Antiqua']}],
    'Background': [{'Color': []}],
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
};

const mdOptions: MenuOptions = {
    'Text': [{'Color': [], 'Font Variant': ['Cinzel', 'Cormorant Garamond', 'Uncial Antiqua']}],
    'Background': [{'Color': []}],
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
}

const imageOptions: MenuOptions = {
    'Border': [{'Color': []}, {'Width': ['1px', '2px', '3px', '4px', '5px']}, {'Rounding': ["Sharp", "Slight", "Medium", "Round", "Full"]}, {'Padding': ['0px', '1px', '2px', '3px', '4px', '5px']}],
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

export const getClass = (style: any): string => { 
    return `
    ${style?.text.size || "p"} text
    ${style?.text?.font ? `font-${style?.text?.font.toLowerCase()}` : "" }
    ${style?.text?.color ? `text-${style?.text?.color[0].toLowerCase()}-${style?.text.color[1]}` : "" }
    ${style?.border?.rounding ? `rounded-${roundingTranslations[style.border.rounding]}` : "" }
    ${style?.border?.color ? `border-${style.border.color[0].toLowerCase()}-${style.border.color[1]}` : "" }
    ${style?.border?.padding ? `p-${pixelTranslations[style.border.padding]}` : "" }
    ${style?.border?.width ? `border-${pixelTranslations[style.border.width]}` : "" }
    ${style?.background?.color ? `bg-${style.background.color[0].toLowerCase()}-${style.background.color[1]}` : "" }
    whitespace-pre-wrap break-words`;
}

export const getStyle = (style: any): string => {
    return `
       ${style?.text?.["font variant"] ? `font-family: '${style?.text?.["font variant"]}', serif;` : "" }`;
}

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