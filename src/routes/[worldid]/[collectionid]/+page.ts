export const load = ({ params: { worldid, collectionid } }: { params: { worldid: string; collectionid: string } }) => {
    return {
        worldid,
        collectionid
    };
};
