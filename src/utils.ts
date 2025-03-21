export const capitalizeFirstLetter = (str: string | null): string | null => {
    if (!str) return null;
    return str.charAt(0).toUpperCase() + str.slice(1);
};