<script lang="ts">
    const imgSrc =
        "https://images.unsplash.com/photo-1463171515643-952cee54d42a?q=80&w=450&h=190&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    const worldid = "1234567890";

    const category = "Announcements";

    const title = "Skeleton is Awesome";

    const description =
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam aspernatur provident eveniet eligendi cumque consequatur tempore sint nisi sapiente. Iste beatae laboriosam iure molestias cum expedita architecto itaque quae rem.";

    const author = "Alex";

    const date = new Date().toLocaleDateString();
</script>

<div
    class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden"
>
    <a href="/world/{worldid}">
        <header>
            <img
                src={imgSrc}
                class="aspect-[21/9] w-full grayscale hue-rotate-90"
                alt="banner"
            />
        </header>
        <article class="space-y-4 p-4">
            <div>
                <h2 class="h6">{category}</h2>
                <h3 class="h3">{title}</h3>
            </div>
            <p class="opacity-60">
                {description}
            </p>
        </article>
    </a>
    <a href="/profile/{author}">
        <footer class="flex items-center justify-between gap-4 p-4">
            <small class="opacity-60">By {author}</small>
            <small class="opacity-60">On {date}</small>
        </footer>
    </a>
</div>
