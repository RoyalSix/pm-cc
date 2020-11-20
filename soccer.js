// The attached soccer.dat file contains the results from the English Premier League. 
// The columns labeled ‘F’ and ‘A’ contain the total number of goals scored for and against each team in that season (so Arsenal scored 79 goals against opponents, and had 36 goals scored against them). 
// Write a program to print the name of the team with the smallest difference in ‘for’ and ‘against’ goals.

const string = `
Team               P     W    L   D    F      A     Pts
1. Arsenal         38    26   9   3    79  -  36    87
2. Liverpool       38    24   8   6    67  -  30    80
3. Manchester_U    38    24   5   9    87  -  45    77
4. Newcastle       38    21   8   9    74  -  52    71
5. Leeds           38    18  12   8    53  -  37    66
6. Chelsea         38    17  13   8    66  -  38    64
7. West_Ham        38    15   8  15    48  -  57    53
8. Aston_Villa     38    12  14  12    46  -  47    50
9. Tottenham       38    14   8  16    49  -  53    50
10. Blackburn       38    12  10  16    55  -  51    46
11. Southampton     38    12   9  17    46  -  54    45
12. Middlesbrough   38    12   9  17    35  -  47    45
13. Fulham          38    10  14  14    36  -  44    44
14. Charlton        38    10  14  14    38  -  49    44
15. Everton         38    11  10  17    45  -  57    43
16. Bolton          38     9  13  16    44  -  62    40
17. Sunderland      38    10  10  18    29  -  51    40
-------------------------------------------------------
18. Ipswich         38     9   9  20    41  -  64    36
19. Derby           38     8   6  24    33  -  63    30
20. Leicester       38     5  13  20    30  -  64    28`;

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
  let lowest;
  let lowestTeam;
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