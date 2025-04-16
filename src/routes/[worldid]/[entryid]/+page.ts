
export const load = ({ params: { entryid } }: { params: { entryid: string } }) => {
    console.log("entryid", entryid);
    return {
        entryid
    };
}
