export const formatDuration = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return '0 min';
  }
  const totalMinutesRounded = Math.round(totalMinutes);
  const hours = Math.floor(totalMinutesRounded / 60);
  const minutes = totalMinutesRounded % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes}min`;
};
