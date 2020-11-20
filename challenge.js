const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});
/** Default indicies and file names for easier testing */
const DEFAULT_WEATHER_COLUMNS = 'Dy, Mnt, Mxt';
const WEATHER_DATA_DEFAULT_NAME = 'weather_data.txt';
const SOCCER_DATA_DEFAULT_NAME = 'soccer_data.txt';
const DEFAULT_SOCCER_COLUMNS = 'Team, 8, 6'

/**
 * Helper function to remove extra space from user input
 * @param {String} columnsString - string of text to parse into array
 * @returns {String[]}
 */
function getColumnsFromInput(dataString, columnsString) {
  const columnsKeyArray = columnsString.split(/,\s*/ig);
  const res = columnsKeyArray.map((val) => {
    console.log("val", val)
    return getKeyIndexFromColumnValue(dataString, val)
  })
  console.log("res", res);
}

/**
 * A wrapper function to handle user input synchronously
 * @param {String} question - Question to prompt user
 * @param {String?} defaultAnswer - (optional) string to pass as placeholder text
 * @returns { Promise<String> }
 */
function prompt(question, defaultAnswer) {
  return new Promise((resolve, reject) => {
    rl.question(question, (resp) => {
      if (typeof (resp) === 'string') {
        resolve(resp);
      } else {
        reject('There was an error, please try again');
        rl.close();
      }
    })
    if (defaultAnswer) {
      rl.write(defaultAnswer);
    }
  })
}

/**
 * Helper function to create a table from a string input of columns/rows
 * @param {String[]} stringRows - The remaining rows of the data to parse
 * @param {Number[]} keyIndices - The key indicies to use for row values, given by user
 * @returns {Number[]}
 */
function createTable(stringRows, keyIndices, table = []) {
  /** If at the end of the string rows return */
  if (!stringRows[0]) return table;

  const line = stringRows[0];
  const lineArray = line.trim().split(/[\s]+/g);
  /** Retrieve the values for the table from the given column indicies */
  const rowArray = keyIndices.map((index) => lineArray[index]);
  table.push(rowArray);
  stringRows.shift();
  return createTable(stringRows, keyIndices, table);
}
/**
 * Helper function to compute spread of two intgers
 * @param {Number} max - Maximum integer in the spread
 * @param {Number} min - Minumum integer in the spread
 * @returns {Number}
 */
function getSpread(max, min) {
  return Math.abs(max - min);
}

/**
 * Recursive function to find the minimum spread given a table of min/max's
 * @param {Number[]} table - Table of metric, max, and min values in order to solve for minimum spread
 * @param {Numer} index - Current index of interation in table
 * @param {String} lowest - The lowest spread found at each loop iteration 
 * @param {String|Number} lowestMetric - The lowest metric pertaining to the max, mins given
 * @returns {String|Number|Function}
 */
function findLowestSpread(table, index = 0, lowest = Number.POSITIVE_INFINITY, lowestMetric) {
  /** If at the end of the table return */
  if (!table[index]) return lowestMetric;

  const [metric, max, min] = table[index];
  const spread = getSpread(max, min);
  if (spread < lowest) {
    lowest = spread;
    lowestMetric = metric;
  }
  /** Iterating index each time */
  return findLowestSpread(table, index + 1, lowest, lowestMetric)
}

/**
 * Helper function to create row from the raw string input, which might need cleaning
 * @param {String} dataString - The entire data string
 * @param {String} metric - The key of the column to indicate the metric to solve for
 */
function getRowsFromDataString(dataString, metric) {
  const htmlStripped = dataString.trim().replace(/<[^>]*>?/gm, '');
  const headerRow = getHeaderRow(htmlStripped, metric);
  const table = htmlStripped.replace(/<[^>]*>?/gm, '').split(headerRow)[1];
  return table.split(/\n/ig).filter((exists) => !!exists);
}

/**
 * Helper function to find 
 * @param {String} string - The entire data string
 * @param {String} metric - The key of the column to indicate the metric to solve for
 */
function getHeaderRow(string, metric) {
  return string.split(/\n/ig).find((line) => {
    return line.match(new RegExp(metric  + '\\s+'))
  })
}

/**
 * helper function to find the index of the corresponding in columns metric
 * @param {*} dataString - The entire data string
 * @param {*} columns - The columns of the indicies given by user to parse
 */
function getMetricIndex(dataString, columns) {
  const htmlStripped = dataString.trim().replace(/<[^>]*>?/gm, '');
  const headerRow = getHeaderRow(htmlStripped, columns[0]);
  const headerRowSplit = headerRow.trim().split(/\s+/);
  const index = headerRowSplit.findIndex((val) => columns[0] == val);
  return index;
}

function getKeyIndexFromColumnValue(string, key) {
  const stringSplit = string.split(/\n/);
  console.log("stringSplit", stringSplit);
  const indexOfHeader = stringSplit[0].indexOf(key);
  const keyAtIndex = stringSplit[1].substr(indexOfHeader, stringSplit[1].length).split(' ')[0]
  return stringSplit[1].trim().split(/\s+/).findIndex((val) => keyAtIndex == val)
}

async function main() {
  const weatherFileName = await prompt('Please enter name of weather data file: \n', WEATHER_DATA_DEFAULT_NAME);
  const weatherDataString = fs.readFileSync(weatherFileName, 'utf8');
  const weatherColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_WEATHER_COLUMNS)
  const weatherColumns = getColumnsFromInput(weatherColumnsString);
  // const weatherStringRows = getRowsFromDataString(weatherDataString, weatherColumns[0]);
  // const weatherMetricIndex = getMetricIndex(weatherDataString, weatherColumns);
  // const weatherKeyIndecies = [weatherMetricIndex, weatherColumns[1], weatherColumns[2]]
  // const weatherTable = createTable(weatherStringRows, weatherKeyIndecies);
  // const weatherLowestMetric = findLowestSpread(weatherTable);
  // console.log("Found lowest metric for weather data as", weatherLowestMetric);

  // const soccerFileName = await prompt('Please enter name of soccer data file: \n', SOCCER_DATA_DEFAULT_NAME);
  // const soccerDataString = fs.readFileSync(soccerFileName, 'utf8');
  // const soccerColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_SOCCER_COLUMNS)
  // const soccerColumns = getColumnsFromInput(soccerColumnsString);
  // const soccerStringRows = getRowsFromDataString(soccerDataString, soccerColumns[0]);
  // const soccerMetricIndex = getMetricIndex(soccerDataString, soccerColumns);
  // const soccerKeyIndecies = [soccerMetricIndex, soccerColumns[1], soccerColumns[2]]
  // const soccerTable = createTable(soccerStringRows, soccerKeyIndecies);
  // const soccerLowestMetric = findLowestSpread(soccerTable);
  // console.log("Found lowest metric for soccer data as", soccerLowestMetric);
  process.exit(1);
}

main()