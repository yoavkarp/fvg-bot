export const transformEnvToNumber = (item?: string): number | undefined => {
    if (!item) return undefined;
    const res = Number(item);
    if (isNaN(res)) return undefined;
    return res;
}