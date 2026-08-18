export function normalizeResourceName(name: string): string {
  return name.normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

export function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);

    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
  });
}
