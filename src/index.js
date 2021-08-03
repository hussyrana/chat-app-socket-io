const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const Filter = require('bad-words');
const {generateLocationMessge, generateMessge} = require('./utils/messages');
const{addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket)=>{
    console.log('web socket new connection');
    socket.on('Join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room});
        if(error){
           return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessge('Welcome!', 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessge(user.username +' has joined!!!', 'Admin'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })
    socket.on('sendMessage', (mes, callback)=>{
        const filter = new Filter();
        if(filter.isProfane(mes)){
            return callback('Profanity is not allowed!!')
        }
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessge(mes, user.username));
        }
        callback();
    })
    socket.on("sendLocation", (location, callback)=>{
        if(!location){
            return callback('Unable to send the location')
        }
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('locationMessage', generateLocationMessge(`https://google.com/maps/?q=${location.lat},${location.long}`, user.username));
        }
        callback();
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessge(user.username+" has disconnected", 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, ()=>{
    console.log('Server is up on port '+port);
})