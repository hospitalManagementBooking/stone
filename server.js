
const express = require('express')

const mysql = require('mysql2');
const cors = require('cors');
const uuid = require('uuid');
const app = express()
const port = 10000;



app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "stone-stone.i.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_pyXCs34t5hBtAWpy98_",
  database: "defaultdb",
  port: 22899
})

//holevih965@rinseart.com
//masspratheen

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');


  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS game_history (
        id bigint AUTO_INCREMENT PRIMARY KEY,
        player_one_name varchar(20) NOT NULL,
        player_two_name varchar(20) NOT NULL,
        player_one_choice int NOT NULL,
        player_two_choice int NOT NULL,
        player_one_score int NOT NULL,
        player_two_score int NOT NULL,
        player_one_total_score int NOT NULL DEFAULT 0,
        player_two_total_score int NOT NULL DEFAULT 0,
        game_id varchar(255) NOT NULL,
        round INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
  db.query(createTableQuery, (error, results) => {
    if (error) {
      console.error('Error creating table:', error);
    } else {
      console.log('Table created successfully!');
    }
  });
});



app.get(`/getGameHistory`, (req, res) => {

  db.query(`select * from game_history`, (err, result, field) => {

    if (err) {
      res.send({ message: "Error Getting data" })
    } else {
      res.send(result);
    }

  })

})


app.post(`/addGameHistory`, (req, res) => {
  const { playerOneName, playerTwoName, playerOneChoice, playerTwoChoice, gameId } = req.body;

  db.query(`SELECT MAX(round) AS maxRound FROM game_history WHERE game_id = ?`, [gameId], (err, result) => {
    if (err) {
      return res.send({ message: "Error retrieving game history" });
    }

    const maxRound = result[0] ? result[0].maxRound : 0;
    if (maxRound < 6) {
      const newRound = maxRound + 1;

      let playerOneScore = 0;
      let playerTwoScore = 0;

      if (playerOneChoice == 1 && playerTwoChoice == 2) {
        playerTwoScore = 1;
      } else if (playerOneChoice == 2 && playerTwoChoice == 1) {
        playerOneScore = 1;
      } else if (playerOneChoice == playerTwoChoice) {

        playerOneScore = 0;
        playerTwoScore = 0;
      } else if (playerOneChoice == 1 && playerTwoChoice == 3) {
        playerOneScore = 1;
      } else if (playerOneChoice == 3 && playerTwoChoice == 1) {
        playerTwoScore = 1;
      } else if (playerOneChoice == 2 && playerTwoChoice == 3) {
        playerTwoScore = 1;
      } else if (playerOneChoice == 3 && playerTwoChoice == 2) {
        playerOneScore = 1;
      }

      db.query(`SELECT COALESCE(SUM(player_one_score), 0) AS player_one_total_score, COALESCE(SUM(player_two_score), 0) AS player_two_total_score FROM game_history WHERE game_id = ?`, [gameId], (err, result) => {
        if (err) {
          return res.send({ message: "Error retrieving total scores" });
        }

        let playerOneTotalScore = 0;
        let playerTwoTotalScore = 0;
        if (result[0]) {
          playerOneTotalScore = parseInt(result[0].player_one_total_score) + playerOneScore;
          playerTwoTotalScore = parseInt(result[0].player_two_total_score) + playerTwoScore;
        } else {
          playerOneTotalScore = playerOneScore;
          playerTwoTotalScore = playerTwoScore;
        }
        db.query(`INSERT INTO game_history (player_one_name, player_two_name, player_one_choice, player_two_choice, player_one_score, player_two_score, player_one_total_score, player_two_total_score, game_id, round) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [playerOneName, playerTwoName, playerOneChoice, playerTwoChoice, playerOneScore, playerTwoScore, playerOneTotalScore, playerTwoTotalScore, gameId, newRound], (err, result) => {
            if (err) {
              return res.send({ message: "Error posting data" });
            } else {
              return res.send({
                data: {
                  playerOneName,
                  playerTwoName,
                  playerOneChoice,
                  playerTwoChoice,
                  playerOneScore,
                  playerTwoScore,
                  playerOneTotalScore,
                  playerTwoTotalScore,
                  gameId,
                  newRound
                }
              });
            }
          });
      });
    } else {
      return res.send({ message: "Maximum rounds reached for this game id" });
    }
  });
});


app.get(`/getGameId`, async (req, res) => {
  let gameId;
  let exists = true;
  while (exists) {
    gameId = getGameId();
    const [rows] = await db.promise().query(`SELECT * FROM game_history WHERE game_id = ?`, [gameId]);
    exists = rows.length > 0;
  }
  res.send({ message: { gameId: gameId, stone: 1, scissors: 3, paper: 2 } });
});

function getGameId() {
  return uuid.v4();
}




app.listen(port, () => console.log(`Example app listening on port ${port}!`))