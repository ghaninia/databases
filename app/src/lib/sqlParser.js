const INSERT_REGEX = /INSERT\s+INTO\s+[`"]?([\w]+)[`"]?\s*(?:\(([^)]*)\))?\s*VALUES\s*(.+?);/gis;

function splitTuples(valuesBlock) {
  const tuples = [];
  let inString = false;
  let quote = "";
  let depth = 0;
  let start = -1;

  for (let i = 0; i < valuesBlock.length; i += 1) {
    const ch = valuesBlock[i];

    if (inString) {
      if (ch === quote) {
        const escaped = valuesBlock[i + 1] === quote;
        if (escaped) {
          i += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === "(") {
      if (depth === 0) {
        start = i + 1;
      }
      depth += 1;
      continue;
    }

    if (ch === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        tuples.push(valuesBlock.slice(start, i));
        start = -1;
      }
    }
  }

  return tuples;
}

function splitFields(tupleBody) {
  const fields = [];
  let inString = false;
  let quote = "";
  let current = "";

  for (let i = 0; i < tupleBody.length; i += 1) {
    const ch = tupleBody[i];

    if (inString) {
      current += ch;
      if (ch === quote) {
        const escaped = tupleBody[i + 1] === quote;
        if (escaped) {
          current += tupleBody[i + 1];
          i += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = true;
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === ",") {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim().length > 0) {
    fields.push(current.trim());
  }

  return fields;
}

function parseLiteral(raw) {
  if (/^null$/i.test(raw)) {
    return null;
  }

  if (/^true$/i.test(raw)) {
    return true;
  }

  if (/^false$/i.test(raw)) {
    return false;
  }

  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    const quote = raw[0];
    const inner = raw.slice(1, -1);
    const escapedQuote = new RegExp(`${quote}${quote}`, "g");
    return inner.replace(escapedQuote, quote);
  }

  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return Number(raw);
  }

  return raw;
}

function parseColumns(columnsBlock) {
  if (!columnsBlock) {
    return [];
  }

  return columnsBlock
    .split(",")
    .map((col) => col.trim().replace(/[`"']/g, ""))
    .filter(Boolean);
}

export function parseInsertStatements(sql) {
  const rowsByTable = {};

  for (const match of sql.matchAll(INSERT_REGEX)) {
    const [, tableName, columnsBlock, valuesBlock] = match;
    const columns = parseColumns(columnsBlock);
    const tuples = splitTuples(valuesBlock);

    if (!rowsByTable[tableName]) {
      rowsByTable[tableName] = [];
    }

    for (const tuple of tuples) {
      const values = splitFields(tuple).map(parseLiteral);
      if (columns.length > 0) {
        const row = {};
        columns.forEach((column, index) => {
          row[column] = values[index] ?? null;
        });
        rowsByTable[tableName].push(row);
      } else {
        rowsByTable[tableName].push(values);
      }
    }
  }

  return rowsByTable;
}
