import colorsSql from '../../../Colors/colors.sql?raw';
import gradesSql from '../../../Grades/grades.sql?raw';
import namesSql from '../../../Names/names.sql?raw';
import proverbsSql from '../../../Proverbs/proverbs.sql?raw';
import skillsSql from '../../../Skills/skills.sql?raw';
import citiesSql from '../../../States/cities.sql?raw';
import districtsSql from '../../../States/districts.sql?raw';
import nighboursSql from '../../../States/nighbours.sql?raw';
import provincesSql from '../../../States/provinces.sql?raw';
import wordsSql from '../../../Words/words.sql?raw';
import { parseInsertStatements } from './sqlParser';

function rows(tableMap, tableName) {
  return Array.isArray(tableMap[tableName]) ? tableMap[tableName] : [];
}

function normalizeWords(wordRows) {
  return wordRows.map((row) => {
    const tagsRaw = typeof row.tags === 'string' ? row.tags : '[]';
    let tags = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }

    return {
      text: row.text,
      tags,
    };
  });
}

function normalizeSkills(skillRows) {
  return skillRows.map((row) => {
    if (row.name) {
      return row.name;
    }

    if (Array.isArray(row) && row[0]) {
      return row[0];
    }

    return '';
  }).filter(Boolean);
}

const colorsTables = parseInsertStatements(colorsSql);
const gradesTables = parseInsertStatements(gradesSql);
const namesTables = parseInsertStatements(namesSql);
const proverbsTables = parseInsertStatements(proverbsSql);
const skillsTables = parseInsertStatements(skillsSql);
const provincesTables = parseInsertStatements(provincesSql);
const citiesTables = parseInsertStatements(citiesSql);
const districtsTables = parseInsertStatements(districtsSql);
const nighboursTables = parseInsertStatements(nighboursSql);
const wordsTables = parseInsertStatements(wordsSql);

const provinces = rows(provincesTables, 'provinces');
const cities = rows(citiesTables, 'cities');
const districts = rows(districtsTables, 'districts');
const nighbours = rows(nighboursTables, 'nighbours');

const provincesById = Object.fromEntries(provinces.map((province) => [province.id, province]));

const citiesByProvince = cities.reduce((acc, city) => {
  const list = acc[city.province_id] ?? [];
  list.push(city);
  acc[city.province_id] = list;
  return acc;
}, {});

const districtsByCity = districts.reduce((acc, district) => {
  const list = acc[district.city_id] ?? [];
  list.push(district);
  acc[district.city_id] = list;
  return acc;
}, {});

const neighborsByState = nighbours.reduce((acc, relation) => {
  const list = acc[relation.state_id] ?? [];
  list.push(relation.to_state_id);
  acc[relation.state_id] = list;
  return acc;
}, {});

export const dataStore = {
  colors: rows(colorsTables, 'colors'),
  grades: rows(gradesTables, 'grades'),
  names: rows(namesTables, 'names'),
  proverbs: rows(proverbsTables, 'proverbs').map((row) => row.text).filter(Boolean),
  skills: normalizeSkills(rows(skillsTables, 'skills')),
  words: normalizeWords(rows(wordsTables, 'words')),
  states: {
    provinces,
    provincesById,
    cities,
    citiesByProvince,
    districts,
    districtsByCity,
    nighbours,
    neighborsByState,
  },
};
