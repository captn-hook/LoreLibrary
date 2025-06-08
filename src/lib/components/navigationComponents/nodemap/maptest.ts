import {get} from 'svelte/store';
import {settingsColors, settingsTypography} from '$lib/state/generator.svelte'
import {goto} from '$app/navigation';
import {getCollection, getEntry} from '$lib/scripts/world';
import { routerItems } from '$lib/state/routerState.svelte';
import { updateRouterStateFromPath } from "$lib/scripts/router";
type Node = {
    name: string;
    href: string;
    connections: Node[];
    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;
    color: string;
    draw: (ctx: CanvasRenderingContext2D) => void;
};

var data: Node | null = null;
var xmax = 1000;
var ymax = 1000;
var defaultX = 100;
var defaultY = 100;
var defaultDxMagnitude = 0;
var defaultDyMagnitude = 0;

const repulsionForce = 600;
const repulsionThreshold = 100;
const attractionForce = 0.0005;
const attractionThreshold = 50;
const damping = 0.9;

function allNodes(): Node[] {
    if (!data) return [];
    const nodes: Node[] = [];
    function traverse(node: Node) {
        nodes.push(node);
        for (const child of node.connections) {
            traverse(child);
        }
    }
    traverse(data);
    return nodes;
}

function allConnections(): { from: Node, to: Node }[] {
    if (!data) return [];
    const connections: { from: Node, to: Node }[] = [];
    function traverse(node: Node) {
        for (const child of node.connections) {
            connections.push({ from: node, to: child });
            traverse(child);
        }
    }
    traverse(data);
    return connections;
}

function applyForces(
    nodes: Node[] = allNodes(),
    connections: { from: Node, to: Node }[] = allConnections()
) {
    // Apply repulsion forces
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Apply repulsion only if nodes are too close
            if (distance < repulsionThreshold || distance < nodeA.size + nodeB.size) {
                const force = repulsionForce / (distance * distance);
                nodeA.dx -= (dx / distance) * force;
                nodeA.dy -= (dy / distance) * force;
                nodeB.dx += (dx / distance) * force;
                nodeB.dy += (dy / distance) * force;
            }
        }
    }

    // Apply attraction forces
    for (const connection of connections) {
        const { from, to } = connection;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply attraction only if nodes are too far apart
        if (distance > attractionThreshold) {
            const force = attractionForce * (distance - from.size - to.size);
            from.dx += (dx / distance) * force;
            from.dy += (dy / distance) * force;
            to.dx -= (dx / distance) * force;
            to.dy -= (dy / distance) * force;
        }
    }

    // Update positions and apply damping
    for (const node of nodes) {
        node.dx *= damping;
        node.dy *= damping;
        node.x += node.dx;
        node.y += node.dy;

        // Keep nodes within canvas bounds
        if (node.x < 0 || node.x > xmax) {
            node.dx *= -1; // Reverse direction
        }
        if (node.y < 0 || node.y > ymax) {
            node.dy *= -1; // Reverse direction
        }
    }
}

function drawGraph(ctx: CanvasRenderingContext2D | null, nodes: Node[] = allNodes(), connections: { from: Node, to: Node }[] = allConnections()) {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, xmax, ymax);

    // Draw connections with reduced opacity
    ctx.save();
    ctx.strokeStyle = settingsColors["--color-surface-contrast-900" as keyof typeof settingsColors] ?? "#e67e22";
    ctx.globalAlpha = 0.3;
    for (const connection of connections) {
        ctx.beginPath();
        ctx.moveTo(connection.from.x, connection.from.y);
        ctx.lineTo(connection.to.x, connection.to.y);
        ctx.stroke();
    }
    ctx.restore();

    // Draw nodes with full opacity
    for (const node of nodes) {
        node.draw(ctx);
    }
}

export function setupCanvas(canvas: HTMLCanvasElement, incoming_data: any, worldName: string, closeNodeMap: () => void) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set initial canvas size
    const scale = .8;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    xmax = canvas.width; 
    ymax = canvas.height;

    defaultX = canvas.width / 2;
    defaultY = canvas.height / 2;

    initializeCanvas(canvas, incoming_data, worldName, ctx, closeNodeMap);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
    });


    function animate() {
        const nodes = allNodes();
        const connections = allConnections();
        applyForces(nodes, connections);
        drawGraph(ctx, nodes, connections);
        requestAnimationFrame(animate);
    }

    animate();

    // Add drag interaction
    let draggedNode: Node | null = null;

    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const node of allNodes()) {
            const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
            if (distance < node.size) {
                draggedNode = node;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (draggedNode) {
            const rect = canvas.getBoundingClientRect();
            draggedNode.x = event.clientX - rect.left;
            draggedNode.y = event.clientY - rect.top;
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggedNode = null;
    });
}

export function initializeCanvas(canvas: HTMLCanvasElement, incoming_data: any, worldName: string, context: CanvasRenderingContext2D, closeNodeMap: () => void) {

    // if the d object is not empty, use it as data

    // Attach click and drag event listeners
    let draggedNode: Node | null = null;
    let dragStart = { x: 0, y: 0 };
    let dragMoved = false;

    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        dragStart = { x, y };
        dragMoved = false;

        for (const node of allNodes()) {
            const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
            if (distance < node.size) {
                draggedNode = node;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (draggedNode) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (Math.abs(x - dragStart.x) > 2 || Math.abs(y - dragStart.y) > 2) {
                dragMoved = true;
            }
            draggedNode.x = x;
            draggedNode.y = y;
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (draggedNode) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            // If mouse didn't move much, treat as click
            if (!dragMoved) {
                // Navigation logic
                // Example: route by node type
                if (draggedNode.name !== window.location.pathname) {//prevent navigation to self
                    goto(draggedNode.href);
                    routerItems.set(updateRouterStateFromPath(draggedNode.href));
                    closeNodeMap();
                }
            }
            draggedNode = null;
        }
    });



    createRootNode(worldName);    
    createNodes(incoming_data);

    console.log("Data structure initialized:\n", data);
}

function createNodes(incoming_data: any, parent: string | null = null) {
    for (const key of Object.keys(incoming_data)) {
        if (key === 'entries' && Array.isArray(incoming_data[key])) {
            for (const entry of incoming_data[key]) {
                createEntryNode(entry, parent);
            }
        } else {
            // Create a collection node for this key
            createCollectionNode(key, parent);
            // Run create nodes on the children of this key
            createNodes(incoming_data[key], key);
        }
    }
}

function createRootNode(name: string) {
    data = createNode(name.replace(/%20/g, " "), 10, 'world', `/${name.replace(/%20/g, " ")}`);
}

function createEntryNode(entry: string, parent: string | null = null) {
    let currentpath= window.location.pathname.split('/');
    let world = currentpath[1];
    if (!data) throw new Error("Data structure is not initialized. Call initializeCanvas first.");
    // if no parent, attach directly to the root
    if (!parent) {
        data.connections.push(createNode(entry, 5, 'entry', `/${world}/${world}/${entry}`));
    } else {
        // Find the parent node in the data structure
        const parentNode = findNodeByName(parent);
        if (parentNode) {
            if (world == parent){
                parentNode.connections.push(createNode(entry, 5, 'entry', `/${world}/${world}/${entry}` ));
            }
            parentNode.connections.push(createNode(entry, 5, 'entry', `/${world}/${parent}/${entry}`));
        } else {
            console.warn(`Parent node ${parent} not found.`);
        }
    }
}

function createCollectionNode(name: string, parent: string | null = null) {
    let currentpath= window.location.pathname.split('/');
    let world = currentpath[1];
    if (!data) throw new Error("Data structure is not initialized. Call initializeCanvas first.");

    if (!parent) {
        data.connections.push(createNode(name, 7, 'collection', `/${world}/${name}`));
    } else {
        const parentNode = findNodeByName(parent);
        if (parentNode) {
            parentNode.connections.push(createNode(name, 7, 'collection', `/${world}/${name}`));
        } else {
            console.warn(`Parent node ${parent} not found.`);
        }
    }
}

function createNode(name: string, size = 5, type="entry", href="/"): Node {
    let color: string;
    let textColor: string
    let mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // Detect dark or light mode from the browser
    
    if (mode === 'dark') {
        const darkKey = settingsTypography['--base-font-color-dark'].replace(/^var\((.*)\)$/, '$1');
        textColor = settingsColors[darkKey as keyof typeof settingsColors] ?? "#ffffff";

        if (type === 'world') {
            color = settingsColors["--color-primary-900" as keyof typeof settingsColors] ?? "#3498db";
        } else if (type === "collection") {
            color = settingsColors["--color-primary-500" as keyof typeof settingsColors] ?? "#e67e22";
        } else {
            color = settingsColors["--color-primary-200" as keyof typeof settingsColors] ?? "#9b59b6";
        }
    } else { // light mode
        const lightKey = settingsTypography['--base-font-color'].replace(/^var\((.*)\)$/, '$1');
        textColor = settingsColors[lightKey as keyof typeof settingsColors] ?? "#000000";
        if (type === 'world') {
            color = settingsColors["--color-primary-200" as keyof typeof settingsColors] ?? "#3498db";
        } else if (type === "collection") {
            color = settingsColors["--color-primary-500" as keyof typeof settingsColors] ?? "#e67e22";
        } else {
            color = settingsColors["--color-primary-900" as keyof typeof settingsColors] ?? "#9b59b6";
        }
    }
    return {
        name: name,
        size: size,
        href: href,
        connections: [],
        x: defaultX + Math.random() * defaultX - defaultX / 2, // Randomize initial position
        y: defaultY + Math.random() * defaultY - defaultY / 2, // Randomize initial position
        dx: Math.random() * defaultDxMagnitude - defaultDxMagnitude / 2,
        dy: Math.random() * defaultDyMagnitude - defaultDyMagnitude / 2,
        color: color,
        draw: function(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle= textColor;
            ctx.fillText(this.name, this.x + this.size + 5, this.y);
        }
    };
}

function findNodeByName(name: string): Node | null {
    if (!data) throw new Error("Data structure is not initialized. Call initializeCanvas first.");
    function traverse(node: Node): Node | null {
        if (node.name === name) return node;
        for (const child of node.connections) {
            const found = traverse(child);
            if (found) return found;
        }
        return null;
    }
    return traverse(data);
}