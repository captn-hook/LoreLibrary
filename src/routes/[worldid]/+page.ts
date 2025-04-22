import { redirect } from '@sveltejs/kit';

export const load = ({ params: { worldid } }: { params: { worldid: string } }) => {
    console.log("worldid", worldid);
    throw redirect(302, `/world/${worldid}`);
}