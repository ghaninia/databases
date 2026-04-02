function normalizePersianText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ه')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeAdvancedQuery(query) {
  return normalizePersianText(query)
    .split(/[\/|،,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function bfsEditDistance(a, b) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);

  const rows = source.length + 1;
  const cols = target.length + 1;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Number.POSITIVE_INFINITY));
  dist[0][0] = 0;

  const deque = [[0, 0]];

  while (deque.length > 0) {
    const [i, j] = deque.shift();
    const current = dist[i][j];

    if (i < source.length) {
      const nextCost = current + 1;
      if (nextCost < dist[i + 1][j]) {
        dist[i + 1][j] = nextCost;
        deque.push([i + 1, j]);
      }
    }

    if (j < target.length) {
      const nextCost = current + 1;
      if (nextCost < dist[i][j + 1]) {
        dist[i][j + 1] = nextCost;
        deque.push([i, j + 1]);
      }
    }

    if (i < source.length && j < target.length) {
      const stepCost = source[i] === target[j] ? 0 : 1;
      const nextCost = current + stepCost;
      if (nextCost < dist[i + 1][j + 1]) {
        dist[i + 1][j + 1] = nextCost;
        if (stepCost === 0) {
          deque.unshift([i + 1, j + 1]);
        } else {
          deque.push([i + 1, j + 1]);
        }
      }
    }
  }

  return dist[source.length][target.length];
}

function dfsLcsLength(a, b) {
  const source = normalizePersianText(a);
  const target = normalizePersianText(b);
  const memo = new Map();

  function dfs(i, j) {
    if (i >= source.length || j >= target.length) {
      return 0;
    }

    const key = `${i}|${j}`;
    if (memo.has(key)) {
      return memo.get(key);
    }

    let result;
    if (source[i] === target[j]) {
      result = 1 + dfs(i + 1, j + 1);
    } else {
      result = Math.max(dfs(i + 1, j), dfs(i, j + 1));
    }

    memo.set(key, result);
    return result;
  }

  return dfs(0, 0);
}

export function calculateNameMatch(term, name) {
  const normalizedTerm = normalizePersianText(term);
  const normalizedName = normalizePersianText(name);

  if (!normalizedTerm || !normalizedName) {
    return 0;
  }

  const editDistance = bfsEditDistance(normalizedTerm, normalizedName);
  const maxLength = Math.max(normalizedTerm.length, normalizedName.length);
  const editScore = maxLength === 0 ? 100 : Math.max(0, ((maxLength - editDistance) / maxLength) * 100);

  const lcsLength = dfsLcsLength(normalizedTerm, normalizedName);
  const lcsDenominator = normalizedTerm.length + normalizedName.length;
  const lcsScore = lcsDenominator === 0 ? 100 : ((2 * lcsLength) / lcsDenominator) * 100;

  let finalScore = (editScore * 0.65) + (lcsScore * 0.35);

  if (normalizedName.includes(normalizedTerm)) {
    finalScore += 12;
  }

  if (normalizedName.startsWith(normalizedTerm)) {
    finalScore += 8;
  }

  return Math.min(100, Math.round(finalScore));
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

  const coverageThreshold = 45;
  const matchedTerms = scores.filter((score) => score >= coverageThreshold).length;
  const coverageRatio = matchedTerms / scores.length;
  const coverageScore = coverageRatio * 100;

  let finalScore =
    (avgScore * 0.55) +
    (bestScore * 0.2) +
    (minScore * 0.15) +
    (coverageScore * 0.1);

  if (matchedTerms === scores.length) {
    finalScore += 8;
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
