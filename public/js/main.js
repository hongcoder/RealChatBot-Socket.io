const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages');
const socket = io();
const roomName = document.getElementById('room-name');
const userLists = document.getElementById('users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search, { //qs cdn으로 쓸 수있는듯 내용 찾아보기
  ignoreQueryPrefix: true
});

//Join chatroom
socket.emit('joinRoom', {username, room});


//Get room and users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
})


//Message from server
socket.on('message', message => {
  console.log(message); //server.js에서 socket.emit으로 message에 내용을 입력시킴 (welcome to chatcord내용)
  outputMessage(message);


  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;  //채팅에 입력하면 자동으로 최신 텍스트인 제일 밑으로 포커싱
})


//Message submit

chatForm.addEventListener('submit', (e)=> {
  e.preventDefault(); //자동으로 submit되는거 방지

  //Get message text
  const msg = e.target.elements.msg.value; // chat.html에서 input의 id값이라 텍스트 입력창에 넣는게 뭔지 알 수 있음


  //Emit message to server
  socket.emit('chatMessage', msg);

  // Clear Input
  e.target.elements.msg.value = ''; // 텍스트 인풋창 글쓰면 비게끔
  e.target.elements.msg.focus(); // 텍스트 인풋창 글쓰면 비게끔

});

//Output message to DOM
function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML= `<p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>
  `;
  document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM

function outputRoomName(room) {
  roomName.innerText= room;
}

function outputUsers(users) {
  userLists.innerHTML= `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}