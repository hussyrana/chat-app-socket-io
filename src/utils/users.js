const users = [];

const addUser = ({id, username, room})=>{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if(!username || !room){
        return {
            error: 'User name or room is not exist'
        }

    }
    const existUser = users.find(user=>{
        return username === user.username && user.room === room
    })
    if(existUser){
        return{
            error: "username is in use"
        }
    }
    const user = {id, username, room};
    users.push(user);
    return {user};
}
const removeUser = (id)=>{
    const r = users.findIndex(user=>{
        return user.id===id
    })
    if(r){
        return users.splice(r, 1)[0]
    }
}
const getUser = (id)=>{
   return users.find(user=>{
        return user.id===id
    })
}
const getUsersInRoom = (room)=>{
    return users.filter(user=>{
        return user.room===room;
    })
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}