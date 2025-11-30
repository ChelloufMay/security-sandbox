export function getCsrfTokenFromCookie(): string | null {
    const name = "csrftoken=";
    const cookies = document.cookie.split(";").map((c) => c.trim());
    for (const c of cookies) {
        if (c.startsWith(name)) return c.substring(name.length);
    }
    return null;
}
