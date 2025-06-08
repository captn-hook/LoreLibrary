import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { RouterItem } from "../types/routerItem";
import { get } from "svelte/store";
export function updateRouterStateFromPath(path: string) : RouterItem[]{
    const pathParts = path.split('/').splice(1);
    const newRouter: RouterItem[] = [];
    for (let i = 0; i < pathParts.length; i++) {
        let name = pathParts[i].replace(/and|%20/g, ' ');
        let href;
        switch (i) {
            case 0: //world
                href = `/${pathParts[0]}`;
                if (pathParts[0].replace(/and|%20/g, ' ') == pathParts[1].replace(/and|%20/g, ' ')) { // a worlds entry
                    i+=1; // skip next router item since it is a duplicate
                }
                break;
            case 1: //world/collection
                href = `/${pathParts[0]}/${pathParts[1]}`;
                break;
            case 2: //world/collection/entry
                href = `/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`;
                break;
            default: 
                href = `/${pathParts.slice(0, i + 1).join('/')}`;
                break;
        }
        newRouter.push(new RouterItem(name, href));

    }
    return newRouter;
}