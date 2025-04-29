export const load = ({ params: { worldid, collectionid, entryid } }: { params: { worldid: string; collectionid: string; entryid: string } }) => {
    return {
        worldid,
        collectionid,
        entryid
    };
};
