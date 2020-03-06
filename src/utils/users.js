const users = []

const addUser = ({id,username,room}) => {

    //clean up
     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

     if(!username || !room) {
         return{
             error:'Username and room are required'
         }
     }

     const existingUser = users.find((user) => {
          //console.log(user)
         return user.room === room && user.username === username
     })
     // console.log(existingUser)
     if(existingUser){
         return{
             error:'user taken'
         }
     }
     const user = {id,username,room}
     users.push(user)
     return {user}
}

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}
const getUser = (id) => {
    const user = users.find((user) => user.id === id)
        return user   
}
const getUsersInRoom = (room) => {
    const userRoom = users.filter((user) => user.room === room)
    return userRoom
}
 addUser({
    id:22,
    username:'test',
    room:'13'
})
addUser({
    id:24,
    username:'test1',
    room:'13'
 })
// const getOne = getUser(22)
// console.log(getOne)
// const getRoom = getUsersInRoom('13')
// console.log(getRoom)
// const removedUser = removeUser(22)
// console.log(users)
// console.log(removedUser)
// console.log(users)
module.exports = {
  getUser,
  getUsersInRoom,
  addUser,
  removeUser
}