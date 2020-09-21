const path = require('path');
const http = require('http'); // !!!socket.io쓰려고 쓴다는데 이유 찾아보기
const express = require('express'); //express server 가져오기
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const {
  format
} = require('path');


const app = express();
const server = http.createServer(app);
const io = socketio(server)


//Set static folder
app.use(express.static(path.join(__dirname, "public")))
/*서버 실행시 퍼블릭 폴더를 기본값으로 하기 위함. express.static(정적)를  우선 path를 require해주고  .join으로 붙여준다. __dirname = current directory , 두번째로 폴더를 지정
그래서 url 서버를 들어가면 바로 퍼블릭에 있는 html이 기본으로 나타남 index.html이 기본이고 index.html에서 form에 action으로 chat.html로 넘어가게 함 */

const botName = 'ChatBot'

//Run when client connects
io.on('connection', socket => {
  // console.log('New Ws Connection...') //Ws = Web Socket 이건 서버에 보이는거
  socket.on('joinRoom', ({
    username,
    room
  }) => {

    const user = userJoin(socket.id, username, room); //users.js에서 userJoin function 가져다 씀 socket이 param이라 socket.id

    socket.join(user.room);

    //Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!')) //클라이언트에 보여질것을 방출

    //Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`)) //everybody emit expect the user that's connecting?

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
});

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id)

      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    //Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id)

      if (user) {
        io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`)) // io.emit은 전체인원한테
        //Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
});


const PORT = process.env.PORT || 3000;

// app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`)); //listen to run server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); //server 매개변수를 지정해줘서 app대신에 server씀