// In the attached file (w_data.dat), you’ll find daily weather data. 
// Download this text file, then write a program to output the day number (column one) with
// the smallest temperature spread (the maximum temperature is the second column, the minimum the third column).
const readline = require('readline');
let input = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt('Please input weather data to compute the smallest temperature spread:\n');

rl.on('line', function (cmd) {
    input.push(cmd);
});

rl.on('close', function () {
    console.log("input", input);
    // const table = [];

    // for (let line of string.trim().split('\n')) {
    //     console.log("line", line)
    //     let s = line.trim().split(/[\s]+/g);
    //     if (!isNaN(s[0])) {
    //         table.push({
    //             day: parseInt(s[0]),
    //             max: parseInt(s[1]),
    //             min: parseInt(s[2]),
    //         });
    //     }
    // }
    
    // function findLowestSpread(table) {
    //     let lowest, lowestDay;
    //     table.forEach(({max, min, day}) => {
    //         const spread = Math.abs(max - min);
    //         if (typeof(lowest) === 'undefined' || spread < lowest) {
    //             lowest = spread;
    //             lowestDay = day;
    //         }
    //     })
    
    //     return lowestDay;
    // }
    
    // console.log(findLowestSpread(table));
});