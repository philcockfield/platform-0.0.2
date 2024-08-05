const colors = [
  '#FF0000', // red
  '#0000FF', // blue
  '#00FF00', // green
  '#FFFF00', // yellow
  '#00FFFF', // cyan
  '#FFA500', // orange
  '#FFC0CB', // pink
  '#ADD8E6', // light blue
  '#32CD32', // lime green
];

let index = 0;

export const Color = {
  next() {
    const color = colors[index];
    index = (index + 1) % colors.length;
    return color;
  },
} as const;
