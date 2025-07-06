export function albumSlug(name: string)
{
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function artistSlug(name: string)
{
    return name.toLowerCase()
        .replace(/\(.+?\)/g, "")
        .replace(/[^a-z0-9]/g, "")
        //.replace(/\[.+?\]/g, "")
}