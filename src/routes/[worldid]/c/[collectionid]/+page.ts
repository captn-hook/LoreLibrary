
export const load = ({ params: { collectionid } }: { params: { collectionid: string } }) => {
    console.log("worldid", collectionid);
    return {
        collectionid
    };
}
