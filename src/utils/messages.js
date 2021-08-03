const generateMessge = (text, username)=>{
    return{
        text,
        createdAt: new Date().getTime(),
        username
    }
}
const generateLocationMessge = (url, username)=>{
    return{
        url,
        createdAt: new Date().getTime(),
        username
    }
}
module.exports = {
    generateMessge,
    generateLocationMessge
}