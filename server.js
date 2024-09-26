
const express = require('express')

const mysql=require('mysql2');
const cors=require('cors');
const uuid=require('uuid');
const app = express()
const port = 10000;



app.use(cors());
app.use(express.json());


const db=mysql.createConnection({
    host:"stone-stone.i.aivencloud.com",
    user:"avnadmin",
    password:"AVNS_pyXCs34t5hBtAWpy98_",
    database:"defaultdb",
    port:22899
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
              player_one_choice varchar(20) NOT NULL,
              player_two_choice varchar(20) NOT NULL,
              player_one_score int NOT NULL,
              player_two_score int NOT NULL,
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
         


   app.get(`/getGameHistory`,(req,res)=>{

    db.query(`select * from game_history`,(err,result,field)=>{

        if(err){
            res.send({message:"Error Getting data"})
        }else{
            res.send(result);
        }

    })

   }) 


   app.post(`/addGameHistory`,(req,res)=>{

    console.log(req.body);
    

    const {playerOneName,playerTwoName,playerOneChoice,playerTwoChoice,playerOneScore,playerTwoScore,gameId,round}=req.body;

    db.query(`INSERT INTO game_history(player_one_name,player_two_name,player_one_choice,player_two_choice,player_one_score,player_two_score,game_id,round ) values (?,?,?,?,?,?,?,?)`,[playerOneName,playerTwoName,playerOneChoice,playerTwoChoice,playerOneScore,playerTwoScore,gameId,round],(err,result,field)=>{

        if(err){
            res.send({message:"Error posting data"})
        }else{
            res.send({message:"Post Success"});
        }

    })

   }) 




   app.get(`/getGameId`, async (req, res) => {
    let gameId;
    let exists = true;
    while (exists) {
      gameId = getGameId();
      const [rows] = await db.promise().query(`SELECT * FROM game_history WHERE game_id = ?`, [gameId]);
      exists = rows.length > 0;
    }
    res.send({ message: gameId });
  });
   
  function getGameId(){
    return uuid.v4();
  }

        
        

app.listen(port, () => console.log(`Example app listening on port ${port}!`))