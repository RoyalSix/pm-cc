// The attached soccer.dat file contains the results from the English Premier League. 
// The columns labeled ‘F’ and ‘A’ contain the total number of goals scored for and against each team in that season (so Arsenal scored 79 goals against opponents, and had 36 goals scored against them). 
// Write a program to print the name of the team with the smallest difference in ‘for’ and ‘against’ goals.
const fs = require('fs');
const string = fs.readFileSync('soccer_data.txt', 'utf8')
const table = [];

for (let line of string.trim().split('\n')) {
    let s = line.trim().split(/[\s]+/g);
    if (!isNaN(s[0])) {
        table.push({
            team: s[1],
            scoredAgainst: parseInt(s[8]),
            //Accounting for dash between columns
            scored: parseInt(s[7]) || parseInt(s[6]),
        });
    }
}

function findLowestSpread(table) {
  let lowest, lowestTeam;
  table.forEach(({scored, scoredAgainst, team}) => {
      const spread = Math.abs(scored - scoredAgainst);
      if (typeof(lowest) === 'undefined' || spread < lowest) {
          lowest = spread;
          lowestTeam = team;
      }
  })

  return lowestTeam;
}

console.log(findLowestSpread(table));