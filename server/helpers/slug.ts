const UNSUPPORTED_CARACTERS_REGEX = /[^\u0400-\u04FF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-z0-9]/gi;

// \u0400–\u04FF	Cyrillic
// \uAC00–\uD7AF	Hangul
// \u3040–\u309F	Hiragana
// \u30A0–\u30FF	Katakana
// \u4E00–\u9FFF	Kanji / Han
// a-z latin
// 0-9 digits

export function albumSlug(name: string)
{
    return name.toLowerCase()
        .replace(UNSUPPORTED_CARACTERS_REGEX, "");
}

export function artistSlug(name: string)
{
    return name.toLowerCase()
        .replace(/\(.+?\)/g, "")
        .replace(UNSUPPORTED_CARACTERS_REGEX, "")
}

export function trackSlug(name: string)
{
    return name.toLowerCase()
        .replace(UNSUPPORTED_CARACTERS_REGEX, "")
}