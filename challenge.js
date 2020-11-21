const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});
/** Default indicies and file names for easier testing */
const DEFAULT_WEATHER_COLUMNS = 'Dy, MnT, MxT';
const WEATHER_DATA_DEFAULT_NAME = 'weather_data.txt';
const SOCCER_DATA_DEFAULT_NAME = 'soccer_data.txt';
const DEFAULT_SOCCER_COLUMNS = 'Team, F, A'

/**
 * Helper function to remove extra space from user input
 * @param {String} columnsString - string of text to parse into array
 * @returns {String[]}
 */
function getColumnsFromInput(dataString, columnsString) {
  const columnsKeyArray = columnsString.split(/,\s*/ig);
  const htmlStripped = dataString.trim().replace(/<[^>]*>?/gm, '');
  const headerRow = getHeaderRow(htmlStripped, columnsKeyArray[0]);
  const dataSplitByNewLine = htmlStripped.split('\n');
  const headerRowIndex = dataSplitByNewLine.findIndex((val) => val == headerRow);
  const stringStartingAtHeaderRow = dataSplitByNewLine.filter((val, index) => index >= headerRowIndex && !!val);
  const indices = columnsKeyArray.map((val) => {
    return getKeyIndexFromColumnValue(stringStartingAtHeaderRow, val)
  })
  return [indices, columnsKeyArray];
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
 * @returns {String[]}
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
 * @returns {String[]}
 */
function getHeaderRow(string, metric) {
  return string.split(/\n/ig).find((line) => {
    return line.match(new RegExp(metric  + '\\s+'))
  })
}

/**
 * Helper function to find the column index from a given key name 
 * @param {String[]} stringSplit - the string split by new lines but still retaining front white space
 * @param {String} key - Key name for the column to find
 * @returns {Number}
 */
function getKeyIndexFromColumnValue(stringSplit, key) {
  const indexOfHeader = stringSplit[0].indexOf(key);
  const keyAtIndex = stringSplit[1].substr(indexOfHeader, stringSplit[1].length).split(' ').filter((exists) => !!exists)[0];
  return stringSplit[1].trim().split(/\s+/).findIndex((val) => keyAtIndex == val)
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

async function main() {
  /** Get file name from user */
  const weatherFileName = await prompt('Please enter name of weather data file: \n', WEATHER_DATA_DEFAULT_NAME);
  /** Read file string from file system */
  const weatherDataString = fs.readFileSync(weatherFileName, 'utf8');
  /** Get columns to find minimum spread from user */
  const weatherColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_WEATHER_COLUMNS)
  /** Get the corresponding column indiceies for the column names */
  const [weatherColumnsIndexed, weatherColumnsKeys] = getColumnsFromInput(weatherDataString, weatherColumnsString);
  /** Split the input based on new lines to prepare for data table creation */
  const weatherStringRows = getRowsFromDataString(weatherDataString, weatherColumnsKeys[0]);
  /** Create data table of min, max, and metric key i.e. [88, 36, 14] */
  const weatherTable = createTable(weatherStringRows, weatherColumnsIndexed);
  /** Compute the lowest spread given a table */
  const weatherLowestMetric = findLowestSpread(weatherTable);
  console.log("Found lowest metric for weather data as", weatherLowestMetric);

  const soccerFileName = await prompt('Please enter name of soccer data file: \n', SOCCER_DATA_DEFAULT_NAME);
  const soccerDataString = fs.readFileSync(soccerFileName, 'utf8');
  const soccerColumnsString = await prompt('Please enter the columns indices to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_SOCCER_COLUMNS)
  const [soccerColumnsIndexed, soccerColumnsKeys]= getColumnsFromInput(soccerDataString, soccerColumnsString);
  const soccerStringRows = getRowsFromDataString(soccerDataString, soccerColumnsKeys[0]);
  const soccerTable = createTable(soccerStringRows, soccerColumnsIndexed);
  const soccerLowestMetric = findLowestSpread(soccerTable);
  console.log("Found lowest metric for soccer data as", soccerLowestMetric);
  process.exit(1);
}

main()