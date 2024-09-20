function matcher(string, array) {
  // Filtrar elementos que no son cadenas de texto
  const filteredArray = array.filter((item) => typeof item === "string");

  return filteredArray.map((item) => {
    const accuracy = Math.round(
      ((string.length -
        levenshteinDistance(string.toLowerCase(), item.toLowerCase())) /
        string.length) *
        100
    );
    return { string: item, accuracy };
  });
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

module.exports = { matcher };
