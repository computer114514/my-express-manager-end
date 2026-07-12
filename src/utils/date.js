export const stampToPrettyDate = (stamp) => {
    const date = new Date(Number(stamp));
    return new Date(Number(stamp)).toLocaleDateString() + " " + date.toLocaleTimeString();
}