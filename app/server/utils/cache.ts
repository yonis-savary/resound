type CacheEntry<T> = {
    value: T
    expiresAt?: number
}

const storage = () => useStorage('data')

export async function getCache<T>(key: string): Promise<T | null> {
    const raw = await storage().getItem<CacheEntry<T>>(key)

    if (!raw)
        return null

    if (raw.expiresAt && raw.expiresAt < Date.now()) {
        await storage().removeItem(key)
        return null
    }

    return raw.value
}

export async function setCache<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    }

    await storage().setItem(key, entry)
}

export async function hasCache(key: string): Promise<boolean> {
    const raw = await storage().getItem<CacheEntry<unknown>>(key)

    if (!raw) return false
    if (raw.expiresAt && raw.expiresAt < Date.now()) {
        await storage().removeItem(key)
        return false
    }

    return true
}
