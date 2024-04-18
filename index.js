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

  const model = AI.getGenerativeModel({ model: "gemini-pro" });

  prop = converter(prop);

  const prompt = prop;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  let index = searcher(text ,'Specify','specify');
  if(index  == -1){
    let data = distributer(text);
    text = "task Assigned!";
    // let toID = await findacc(data.To);
    // Task_sender(toID,data.To,data.Task,data.Till);
  }

  
  
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
  output = " ' " + input + " ' if this sentence is like assigning any task to a particular committee or person defined in line then give output it in form of 'Task : (Elaborate the task), To : (Committee Name or Individual Name or PersonCode), Till: (Date/Deadline) in (3 letter of month and then date format eg Mar 3)' if no committee or person Specified just say 'Specify clear information whom to assign task' if no deadline then write just 'Add 5'";
  //  To can be SPCA Committee, CCC Committee, CSI Committee, People can be akash , aryan, prajwal, rohan, yash, vrushal , gaurav, nirmit, sanika, sakshi, bhavya, ahswini "; 
  return output;
}

function searcher(line, word1, word2) {
  let index = line.indexOf(word1);
  if(index<0) 
  index = line.indexOf(word2)
// document.getElementById("demo").innerHTML = index; 

  return index;
}

function getCurrentDatePlus5() {
  const currentDate = new Date();
  // Add 5 days to the current date
  const futureDate = new Date(currentDate.getTime() + (5 * 24 * 60 * 60 * 1000));

  // Array of month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Get the 3-letter abbreviation of the month
  const monthAbbreviation = monthNames[futureDate.getMonth()];

  // Get the day of the month with leading zero if necessary
  const dayOfMonth = futureDate.getDate().toString().padStart(2, '0');

  // Return the formatted date string
  return `${monthAbbreviation} ${dayOfMonth}`;
}

function distributer(lines){
  // Split the string into an array of substrings using comma and space as separators
  const parts = lines.split(', ');
  
  // Initialize variables to store task, to, and till
  let task = '';
  let to = '';
  let till = '';
  
  // Iterate through the parts array to extract task, to, and till
  parts.forEach(part => {
      const [key, value] = part.split(': ');
  
      switch (key.trim()) {
          case 'Task':
              task = value.trim();
              break;
          case 'To':
              to = value.trim();
              break;
          case 'Till':
              till = value.trim();
              break;
          default:
              break;
      }
  });

  let iner = searcher(till,"add","Add");
  if(iner != -1){
    till = getCurrentDatePlus5();
  }
  
  let data = {
    "Task": task,
    "To":to,
    "Till":till
  }
  // Output the extracted values
  console.log("Task:", task);
  console.log("To:", to);
  console.log("Till:", till);

  return data;
}


//Mongoose
// const mongoose = require('mongoose');
// const { Console } = require('console');
// const CCH = mongoose.createConnection(process.env.MongoDBURL);

//Task Assign Bot 
// const Tasks = CCH.model('Tasks', { 
//   FromID: String,   //UniqueId
//   FromName: String,   //Username
//   ToID: String,      //UniqueID
//   ToName: String,    //Username
//   Message: String,     
//   Deadline: String,
//   Status: String
// });

// function Task_sender(toID, toName, mess, deadline){
//   let data = new Tasks({
//     FromID: "HP21",   //UniqueId
//     FromName: "ChatBot",   //Username
//     ToID: toID,      //UniqueID
//     ToName: toName,    //Username
//     Message: mess,     
//     Deadline: deadline,
//     Status: "Pending"
//   })
//   data.save().then(() => console.log("Permanents Task created!!!"));
// }


// //Account
// const acc_create = CCH.model('Account', { 
//   Firstname: String ,
//   Lastname: String ,
//   Username: String ,
//   Dateofbirth: Date ,
//   Gender: String ,
//   Email: String,
//   Password: String,
//   Gender: String,
//   UniqueId: String,
//   Role: String
// });

// async function findacc(name){
//   let User = await acc_create.findOne({ Firstname:name }).exec();

//   let ans = 0;
//   // console.log(User.Password);
//   if(User){
//       return User.UniqueId;
//   }
//   else
//   return ans;
// }


server.listen(process.env.Port, () => {
  console.log('listening on *:'+process.env.Port);
});
