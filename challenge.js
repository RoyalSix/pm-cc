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
 * Helper function to create row from the raw string input, which might need cleaning
 * @param {String} dataString - The entire data string
 * @returns {String[]}
 */
function getRowsFromDataString(dataString) {
  const htmlStripped = dataString.trim().replace(/<[^>]*>?/gm, '');
  return htmlStripped.split(/\n/ig).filter((exists) => !!exists);
}

/**
 * Helper function to find the value of the column at a specified row index
 * @param {String[]} dataRows - the string split by new lines but still retaining front white space
 * @param {String} columnName - Key name for the column to find
 * @param {Number} headerRowIndex - The row index of the header to specify when to stop iterating
 * @param {Number} lineIndex - The index of the row which contains the value retrieved
 * @returns {String}
 */
function getColumnValuesFromDataString(dataRows, columnName, headerRowIndex, lineIndex) {
  const indexOfHeaderValue = dataRows[headerRowIndex].indexOf(columnName);
  if (dataRows[lineIndex][indexOfHeaderValue].match(/\S/)) {
    //Header column lines up directly above row values
    const valueAtIndex = dataRows[lineIndex].match(new RegExp(`.{${indexOfHeaderValue}}(\\S*)\\s+`)) || [];
    return valueAtIndex[1];
  } else if (dataRows[lineIndex][indexOfHeaderValue + 1].match(/\S/)) {
    //Header column is slightly off row values
    const valueAtIndex = dataRows[lineIndex].match(new RegExp(`.{${indexOfHeaderValue + 1}}(\\S*)\\s+`)) || [];
    return valueAtIndex[1];
  }
}

/**
 * Recursive function to find the minimum spread given a table of min/max's
 * @param {Number[]} dataRows - The rows of values corresponding to the columns
 * @param {String[]} columns - Column name values which correspond to [metric, max, min]
 * @param {Number} headerRowIndex - The row index of the header to specify when to stop iterating
 * @param {Number} index - Current index of interation in table
 * @param {Number} lowest - The lowest spread found at each loop iteration 
 * @param {String} lowestMetric - The lowest metric pertaining to the max, mins given
 * @returns {String|Function}
 */
function findLowestSpread(dataRows, columns, headerRowIndex, index, lowest = Number.POSITIVE_INFINITY, lowestMetric) {
  if (index === headerRowIndex) {
    return lowestMetric;
  }
  const metric = getColumnValuesFromDataString(dataRows, columns[0], headerRowIndex, index);
  const max = getColumnValuesFromDataString(dataRows, columns[1], headerRowIndex, index);
  const min = getColumnValuesFromDataString(dataRows, columns[2], headerRowIndex, index);
  if (typeof (metric) !== 'undefined' && typeof (max) !== 'undefined' && typeof (min) !== 'undefined') {
    const spread = Math.abs(max - min);
    if (spread < lowest) {
      lowest = spread;
      lowestMetric = metric;
    }
  }
  return findLowestSpread(dataRows, columns, headerRowIndex, index - 1, lowest, lowestMetric)
}

async function main() {
  /** Get file name from user */
  const weatherFileName = await prompt('Please enter name of weather data file: \n', WEATHER_DATA_DEFAULT_NAME);
  /** Read file string from file system */
  const weatherDataString = fs.readFileSync(weatherFileName, 'utf8');
  /** Get columns to find minimum spread from user */
  const weatherColumnsString = await prompt('Please enter the column names to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_WEATHER_COLUMNS);
  /** Splitting the user input on commas and optionally spaces */
  const weatherColumns = weatherColumnsString.split(/,\s+/);
  /** The data rows which make up the table */
  const weatherDataRows = getRowsFromDataString(weatherDataString);
  /** The header row index */
  const weatherHeaderRowIndex = weatherDataRows.findIndex((val) => val.match(new RegExp(weatherColumns[0] + '\\s+')));
  /** Find the lowest spread of min/max based on provided column names and row values */
  const weatherLowestMetric = findLowestSpread(weatherDataRows, weatherColumns, weatherHeaderRowIndex, weatherDataRows.length - 1);
  console.log("Found lowest metric for weather data as", weatherLowestMetric);

  const soccerFileName = await prompt('Please enter name of soccer data file: \n', SOCCER_DATA_DEFAULT_NAME);
  const soccerDataString = fs.readFileSync(soccerFileName, 'utf8');
  const soccerColumnsString = await prompt('Please enter the column names to find the minimum spread respectively: "metric, max, min" separated by commas: \n', DEFAULT_SOCCER_COLUMNS);
  const soccerColumns = soccerColumnsString.split(/,\s+/);
  const soccerDataRows = getRowsFromDataString(soccerDataString);
  const soccerHeaderRowIndex = soccerDataRows.findIndex((val) => val.match(new RegExp(soccerColumns[0] + '\\s+')));
  const soccerLowestMetric = findLowestSpread(soccerDataRows, soccerColumns, soccerHeaderRowIndex, soccerDataRows.length - 1);
  console.log("Found lowest metric for soccer data as", soccerLowestMetric);
  process.exit(1);
}

main()