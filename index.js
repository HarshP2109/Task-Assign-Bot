const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { resolve } = require('node:path/win32');
require('dotenv').config()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

const AI = new GoogleGenerativeAI(process.env.api); //FameerPatil

async function run(prop) {

  const model = AI.getGenerativeModel({ model: process.env.model });

  prop = converter(prop);

  const prompt = prop;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;

}

io.on('connection', (socket) => {
    // console.log('a user connected');
    // socket.on('disconnect', () => {
    // console.log('user disconnected');
    // });


    // socket.on('chat message', (msg) => {
    //     // console.log('message: ' + msg);
    //     io.emit('chat message', msg);
    // });


    socket.on('chat message', (msg) => {
        // console.log('message: ' + msg);
        let output=run(msg).then((res)=>{
        // io.emit('chat message', msg);
        io.emit('chat message',res);
        });
 
    });

    socket.on('secretkey', (userID) => {
        var secret = userID;
        console.log(secret);
        var done = "Done";
        io.emit('secretkey',done,secret)
    });


});

function converter(input){
  output = " ' " + input + " ' if this sentence is like assigning any task to a particular committee or person defined in line then give output it in form of 'Task : (Elaborate the task), To : (Committee Name or Individual Name or PersonCode), Till: (Date/Deadline)' if no committee or person Specified just say 'Specify clear information whom to assign task' ";
  //  To can be SPCA Committee, CCC Committee, CSI Committee, People can be akash , aryan, prajwal, rohan, yash, vrushal , gaurav, nirmit, sanika, sakshi, bhavya, ahswini "; 
  return output;
}



server.listen(3000, () => {
  console.log('listening on *:3000');
});
