const express = require('express')
const app = express()
const http  = require('http')
const server = http.createServer(app)
const path = require('path')
const socketio = require('socket.io')
const io = socketio(server)
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
var count = 0 
io.on('connection',(socket) => {
 
  //  socket.emit('countUpdated',count)
    console.log('socket connected')
    socket.on('increment',() =>{
        count++
        io.emit('countUpdated',count)
    })
    socket.on('join',({username,room},callback) => {
      const {error,user} = addUser({id:socket.id,username,room})
      if(error){
        return callback(error)
      }
      socket.join(user.room)
      socket.emit('message',generateMessage('Admin','welcome'))
      socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} user has joined !`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users: getUsersInRoom(user.room)
      })
      callback()
    })

    //socket.emit ,io.emit,socket.broadcast.emit
    //io.to.emit,socket.broadcast.to.emit

    socket.on('sendMessage', (message,callback) => {

        const user = getUser(socket.id)
        if(!user){
          return callback('not found')
        }
        const filter = new Filter()
        if(filter.isProfane(message)){
        return callback('Not allowed')
      }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        //console.log(message)
        callback('delivered!')
  })

     socket.on('sendLocation',({latitude,longitude},callback) =>{
        const user = getUser(socket.id)
        if(!user){
          return callback('not found')
        }
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))

        callback('gotten')
     })

     socket.on('disconnect',() => {
       const user  = removeUser(socket.id)
       if(user){
           io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left! `))
           io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
          })
       }
     
     })

})
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

server.listen(port,() =>{
    console.log(`started on ${port}`)
})