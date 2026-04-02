function normalizePersianText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[أإٱآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ـ]/g, '')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/["'`.,!?؛:()\[\]{}<>\\/\-+*_~=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeAdvancedQuery(query) {
  return String(query ?? '')
    .split(/[\/|،,\n]+/)
    .map((part) => normalizePersianText(part))
    .filter(Boolean);
}

function damerauLevenshteinDistance(a, b) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);

  const n = source.length;
  const m = target.length;

  if (n === 0) {
    return m;
  }

  if (m === 0) {
    return n;
  }

  const table = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i += 1) {
    table[i][0] = i;
  }

  for (let j = 0; j <= m; j += 1) {
    table[0][j] = j;
  }

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;

      let value = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost,
      );

      if (
        i > 1 &&
        j > 1 &&
        source[i - 1] === target[j - 2] &&
        source[i - 2] === target[j - 1]
      ) {
        value = Math.min(value, table[i - 2][j - 2] + 1);
      }

      table[i][j] = value;
    }
  }

  return table[n][m];
}

function lcsLength(a, b) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);

  if (!source || !target) {
    return 0;
  }

  const dp = Array.from({ length: source.length + 1 }, () => Array(target.length + 1).fill(0));

  for (let i = 1; i <= source.length; i += 1) {
    for (let j = 1; j <= target.length; j += 1) {
      if (source[i - 1] === target[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[source.length][target.length];
}

function jaroWinklerSimilarity(a, b) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);

  if (!source && !target) {
    return 1;
  }

  if (!source || !target) {
    return 0;
  }

  if (source === target) {
    return 1;
  }

  const matchDistance = Math.floor(Math.max(source.length, target.length) / 2) - 1;
  const sourceMatches = Array(source.length).fill(false);
  const targetMatches = Array(target.length).fill(false);

  let matches = 0;
  for (let i = 0; i < source.length; i += 1) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, target.length);

    for (let j = start; j < end; j += 1) {
      if (targetMatches[j] || source[i] !== target[j]) {
        continue;
      }
      sourceMatches[i] = true;
      targetMatches[j] = true;
      matches += 1;
      break;
    }
  }

  if (matches === 0) {
    return 0;
  }

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < source.length; i += 1) {
    if (!sourceMatches[i]) {
      continue;
    }
    while (!targetMatches[k]) {
      k += 1;
    }
    if (source[i] !== target[k]) {
      transpositions += 1;
    }
    k += 1;
  }

  const jaro = (
    (matches / source.length) +
    (matches / target.length) +
    ((matches - transpositions / 2) / matches)
  ) / 3;

  let prefixLength = 0;
  const prefixLimit = Math.min(4, source.length, target.length);
  while (prefixLength < prefixLimit && source[prefixLength] === target[prefixLength]) {
    prefixLength += 1;
  }

  return jaro + (prefixLength * 0.1 * (1 - jaro));
}

function getNgrams(text, n) {
  if (text.length < n) {
    return [];
  }

  const grams = [];
  for (let i = 0; i <= text.length - n; i += 1) {
    grams.push(text.slice(i, i + n));
  }
  return grams;
}

function diceCoefficient(a, b, n = 2) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);

  if (!source && !target) {
    return 1;
  }

  if (!source || !target) {
    return 0;
  }

  const sourceGrams = getNgrams(source, n);
  const targetGrams = getNgrams(target, n);

  if (sourceGrams.length === 0 || targetGrams.length === 0) {
    return source === target ? 1 : 0;
  }

  const sourceMap = new Map();
  sourceGrams.forEach((gram) => {
    sourceMap.set(gram, (sourceMap.get(gram) ?? 0) + 1);
  });

  let overlap = 0;
  targetGrams.forEach((gram) => {
    const count = sourceMap.get(gram) ?? 0;
    if (count > 0) {
      overlap += 1;
      sourceMap.set(gram, count - 1);
    }
  });

  return (2 * overlap) / (sourceGrams.length + targetGrams.length);
}

function buildCandidateWindows(term, name) {
  const normalizedTerm = normalizePersianText(term);
  const normalizedName = normalizePersianText(name);

  if (!normalizedTerm || !normalizedName) {
    return [];
  }

  const windows = new Set([normalizedName]);
  const termLength = normalizedTerm.length;
  const minLength = Math.max(1, termLength - 1);
  const maxLength = Math.min(normalizedName.length, termLength + 2);

  for (let size = minLength; size <= maxLength; size += 1) {
    for (let start = 0; start <= normalizedName.length - size; start += 1) {
      windows.add(normalizedName.slice(start, start + size));
    }
  }

  return Array.from(windows);
}

function scorePair(term, candidate, fullName) {
  const normalizedTerm = normalizePersianText(term);
  const normalizedCandidate = normalizePersianText(candidate);
  const normalizedFullName = normalizePersianText(fullName);

  const maxLength = Math.max(normalizedTerm.length, normalizedCandidate.length, 1);
  const distance = damerauLevenshteinDistance(normalizedTerm, normalizedCandidate);
  const editScore = Math.max(0, ((maxLength - distance) / maxLength) * 100);

  const jaroScore = jaroWinklerSimilarity(normalizedTerm, normalizedCandidate) * 100;
  const diceScore = diceCoefficient(normalizedTerm, normalizedCandidate, 2) * 100;
  const lcs = lcsLength(normalizedTerm, normalizedCandidate);
  const lcsScore = ((2 * lcs) / (normalizedTerm.length + normalizedCandidate.length || 1)) * 100;

  let score =
    (jaroScore * 0.35) +
    (editScore * 0.3) +
    (diceScore * 0.2) +
    (lcsScore * 0.15);

  if (normalizedFullName.includes(normalizedTerm)) {
    score += 10;
  }

  if (normalizedCandidate.startsWith(normalizedTerm) || normalizedFullName.startsWith(normalizedTerm)) {
    score += 6;
  }

  return Math.min(100, score);
}

export function calculateNameMatch(term, name) {
  const normalizedTerm = normalizePersianText(term);
  const normalizedName = normalizePersianText(name);

  if (!normalizedTerm || !normalizedName) {
    return 0;
  }

  const windows = buildCandidateWindows(normalizedTerm, normalizedName);
  if (windows.length === 0) {
    return 0;
  }

  let best = 0;
  for (const window of windows) {
    const candidateScore = scorePair(normalizedTerm, window, normalizedName);
    if (candidateScore > best) {
      best = candidateScore;
    }
  }

  return Math.round(best);
}

export function getCombinedAdvancedMatch(name, terms) {
  if (!Array.isArray(terms) || terms.length === 0) {
    return {
      score: 0,
      strongestTerm: '',
      matchedTerms: 0,
      totalTerms: 0,
      termScores: [],
    };
  }

  const termScores = terms.map((term) => ({ term, score: calculateNameMatch(term, name) }));
  const scores = termScores.map((item) => item.score);

  const bestScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const avgScore = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const variance = scores.reduce((sum, value) => sum + ((value - avgScore) ** 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  const matchedTerms = termScores.filter((item) => {
    const normalized = normalizePersianText(item.term);
    const dynamicThreshold = normalized.length <= 3 ? 68 : normalized.length <= 5 ? 55 : 48;
    return item.score >= dynamicThreshold;
  }).length;

  const coverageRatio = matchedTerms / scores.length;
  const coverageScore = coverageRatio * 100;

  let finalScore =
    (avgScore * 0.45) +
    (minScore * 0.25) +
    (bestScore * 0.15) +
    (coverageScore * 0.15);

  if (matchedTerms === scores.length) {
    finalScore += 6;
  }

  if (stdDev <= 8) {
    finalScore += 3;
  }

  const strongest = termScores.reduce((currentBest, item) => {
    if (!currentBest || item.score > currentBest.score) {
      return item;
    }
    return currentBest;
  }, null);

  return {
    score: Math.min(100, Math.round(finalScore)),
    strongestTerm: strongest?.term ?? '',
    matchedTerms,
    totalTerms: scores.length,
    termScores,
  };
}
