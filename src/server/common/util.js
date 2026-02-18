export const singularize = (word) =>
  word.endsWith('s') ? word.slice(0, -1) : word
