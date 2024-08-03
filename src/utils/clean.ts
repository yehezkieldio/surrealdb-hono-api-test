export function clean(input: string): string {
    return input.replace(/['";]/g, "");
}
