const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});
/** Default indicies and file names for easier testing */
const DEFAULT_WEATHER_COLUMNS = '0, 1, 2';
const WEATHER_DATA_DEFAULT_NAME = 'weather_data.txt';
const SOCCER_DATA_DEFAULT_NAME = 'soccer_data.txt';
const DEFAULT_SOCCER_COLUMNS = '1, 8, 6'

/**
 * Helper function to remove extra space from user input
 * @param {String} columnsString - string of text to parse into array
 * @returns {String[]}
 */
function getColumnsFromInput(columnsString) {
  /** Splitting on commas, and spaces if any */
  return columnsString.split(/,\s*/ig);
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

async function main() {
  const weatherFileName = await prompt('Please enter name of weather data file: \n', WEATHER_DATA_DEFAULT_NAME);
  const weatherDataString = fs.readFileSync(weatherFileName, 'utf8');
  const weatherColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_WEATHER_COLUMNS)
  const weatherColumns = getColumnsFromInput(weatherColumnsString);
  const weatherStringRows = weatherDataString.trim().split('\n');
  const weatherTable = createTable(weatherStringRows, weatherColumns);
  const weatherLowestMetric = findLowestSpread(weatherTable);
  console.log("Found lowest metric for weather data as", weatherLowestMetric);

  const soccerFileName = await prompt('Please enter name of soccer data file: \n', SOCCER_DATA_DEFAULT_NAME);
  const soccerDataString = fs.readFileSync(soccerFileName, 'utf8');
  const soccerColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_SOCCER_COLUMNS)
  const soccerColumns = getColumnsFromInput(soccerColumnsString);
  const soccerStringRows = soccerDataString.trim().split('\n');
  const soccerTable = createTable(soccerStringRows, soccerColumns);
  const soccerLowestMetric = findLowestSpread(soccerTable);
  console.log("Found lowest metric for soccer data as", soccerLowestMetric);
  process.exit(1);
}

main();