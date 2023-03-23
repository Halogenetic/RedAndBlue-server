import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// gestion des joueurs disponibles et pris
const players = {
  A: { isTaken: false },
  B: { isTaken: false },
  C: { isTaken: false },
  D: { isTaken: false }
};

let cardDeck = [2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let cardDeckShuffled = shuffle([...cardDeck]);

let roles = ["Blue", "Blue", "Blue", "Red", "Red"];
let rolesShuffled = shuffle([...roles]);

let playerAcards = [];
let playerBcards = [];
let playerCcards = [];
let playerDcards = [];

let playerArole = [];
let playerBrole = [];
let playerCrole = [];
let playerDrole = [];

let turnCards = []; 
let startingPlayer = []

let turn = 1; 
let round = 1; 
let cables = 0;
let winner = "";

let selectedPlayers = 0;

let ndl = 20;

io.on('connection', (socket) => {
  let newround = () => {
    let newDeck = [...playerAcards, ...playerBcards, ...playerCcards, ...playerDcards]; // créer un array newDeck qui rassemble les cartes de tous les joueurs
    newDeck = shuffle([...newDeck]); // mélanger le nouveau paquet
    ndl = ((newDeck.length) / 4); // définir la longueur du nouveau paquet
    playerAcards = [];
    playerBcards = [];
    playerCcards = [];
    playerDcards = [];
    for (let i = 0; i < ndl; i++) {
      playerAcards.push(newDeck.shift());
      playerBcards.push(newDeck.shift());
      playerCcards.push(newDeck.shift());
      playerDcards.push(newDeck.shift());
    }
    turn = 1; // réinitialiser le tour
    round++; // passer au round suivant
    if (round === 5) { // si le compteur de round est à 5
      winner = "Red"; // le camp Red gagne la partie
    }
    turnCards = []; // vider la table
  }

  socket.on('handleClickNR', function(){
    newround();
    io.emit('cardpicked', {
      playerAcards,
      playerBcards,
      playerCcards,
      playerDcards,
      turnCards,
      startingPlayer,
      turn,
      round,
      cables,
      winner
    });
  });


  let newturn = () => {
    turn++; // passer au tour suivant
    if (turnCards[turnCards.length - 1] === 2) { // si la carte prise est un 2
      winner = "Red"; // le camp Red gagne la partie
    } else if (turnCards[turnCards.length - 1] === 1) { // si la carte prise est un 1
      cables++; // ajouter 1 au compteur de câbles
    }
    if (cables === 4) { // si le compteur de câbles est à 5
      winner = "Blue"; // le camp Blue gagne la partie
    }
    io.emit('cardpicked', {
      playerAcards,
      playerBcards,
      playerCcards,
      playerDcards,
      turnCards,
      startingPlayer,
      turn,
      round,
      cables,
      winner
    });
  }

  socket.on('handleClickA', function(){
    playerAcards = shuffle([...playerAcards]); // mélanger les cartes du joueur A
    turnCards.push(playerAcards.shift()); // prendre la carte du dessus du paquet de joueur A et la mettre sur la table
    startingPlayer = "A"; // définir le joueur A comme celui qui prend la main
    newturn();
  });
  
  socket.on('handleClickB', function(){
    playerBcards = shuffle([...playerBcards]); // mélanger les cartes du joueur A
    turnCards.push(playerBcards.shift()); // prendre la carte du dessus du paquet de joueur A et la mettre sur la table
    startingPlayer = "B"; // définir le joueur A comme celui qui prend la main
    newturn();
  });

  socket.on('handleClickC', function(){
    playerCcards = shuffle([...playerCcards]); // mélanger les cartes du joueur A
    turnCards.push(playerCcards.shift()); // prendre la carte du dessus du paquet de joueur A et la mettre sur la table
    startingPlayer = "C"; // définir le joueur A comme celui qui prend la main
    newturn();
  });

  socket.on('handleClickD', function(){
    playerDcards = shuffle([...playerDcards]); // mélanger les cartes du joueur A
    turnCards.push(playerDcards.shift()); // prendre la carte du dessus du paquet de joueur A et la mettre sur la table
    startingPlayer = "D"; // définir le joueur A comme celui qui prend la main
    newturn();
  });
});

io.on('connection', (socket) => {

  function distributeCards() {

      cardDeck = [2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      cardDeckShuffled = shuffle([...cardDeck]);

      roles = ["Blue", "Blue", "Blue", "Red", "Red"];
      rolesShuffled = shuffle([...roles]);

      playerAcards = [];
      playerBcards = [];
      playerCcards = [];
      playerDcards = [];

      playerArole = [];
      playerBrole = [];
      playerCrole = [];
      playerDrole = [];

      turnCards = []; 
      startingPlayer = []

      turn = 1; 
      round = 1; 
      cables = 0;
      winner = ""

    for (let i = 0; i < 5; i++) {
      playerAcards.push(cardDeckShuffled.shift());
      playerBcards.push(cardDeckShuffled.shift());
      playerCcards.push(cardDeckShuffled.shift());
      playerDcards.push(cardDeckShuffled.shift());
    }
      rolesShuffled.shift()
      playerArole.push(rolesShuffled.shift());
      playerBrole.push(rolesShuffled.shift());
      playerCrole.push(rolesShuffled.shift());
      playerDrole.push(rolesShuffled.shift());
  }

  function startingPlayerShuffle() {
    const letters = ["A", "B", "C", "D"];
    const index = Math.floor(Math.random() * 4);
    startingPlayer = letters[index];
  }
  
  
  function sendCardsAndRoles() {
    io.emit('cardsAndRoles', {
      playerAcards,
      playerBcards,
      playerCcards,
      playerDcards,
      playerArole,
      playerBrole,
      playerCrole,
      playerDrole,
      turn,
      round,
      turnCards,
      startingPlayer,
      cables,
      winner
    });
    console.log(playerAcards,
      playerBcards,
      playerCcards,
      playerDcards,
      playerArole,
      playerBrole,
      playerCrole,
      playerDrole,
      turn,
      round,
      turnCards,
      startingPlayer,
      cables,
      winner)
  }

    // event listener for the 'resetPlayersTaken' event
  socket.on('resetPlayersTaken', () => {
    // broadcast the event to all connected clients
    io.emit('playersTakenReset');
  });
  
  // envoi des joueurs disponibles aux nouveaux clients
  socket.emit('availablePlayers', getAvailablePlayers());

  // écoute de la sélection d'un joueur
  socket.on('playerTaken', (player) => {
    if (player && !players[player].isTaken) {
      players[player].isTaken = true;
      io.emit('playerTaken', player);
      io.emit('availablePlayers', getAvailablePlayers());

      selectedPlayers++;
      if (selectedPlayers === 4) {
        distributeCards();
        startingPlayerShuffle();
        sendCardsAndRoles();
      }
    }
  });

  // écoute de la libération d'un joueur
  socket.on('playerAvailable', (player) => {
    if (player && players[player].isTaken) {
      players[player].isTaken = false;
      io.emit('playerAvailable', player);
      io.emit('availablePlayers', getAvailablePlayers());

      selectedPlayers--;
    }
  });

  // écoute du nombre d'utilisateurs connectés
  io.emit('connectedUsersCount', io.engine.clientsCount);

  // nettoyage des joueurs pris lors de la déconnexion d'un client
  socket.on('disconnect', () => {
    Object.keys(players).forEach((player) => {
      if (player && players[player].isTaken && io.sockets.adapter.rooms.get(player) === undefined) {
        players[player].isTaken = false;
        io.emit('playerAvailable', player);
        io.emit('availablePlayers', getAvailablePlayers());

        selectedPlayers--;
      }
    });
  });
});

// fonction de récupération des joueurs disponibles
function getAvailablePlayers() {
  console.log(players);
  return Object.keys(players).filter((player) => !players[player].isTaken);
}
