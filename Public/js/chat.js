const socket = io();


const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const{username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true});


const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHieght = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight-newMessageHieght<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (mes)=>{
    const html = Mustache.render($messageTemplate, {
        message: mes.text,
        createdAt: moment(mes.createdAt).format('h:mm a'),
        username: mes.username
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll();
})
socket.on('locationMessage', (url)=>{
    const html = Mustache.render($locationMessageTemplate, {
        location:url,
        createdAt2: moment(url.createdAt).format('h:mm a'),
        username: url.username
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML=html;
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
     
    const message = e.target.elements.message
    socket.emit("sendMessage", message.value, (error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log("message Delivered!");
    });
})
$sendLocationButton.addEventListener('click', (e)=>{
    $sendLocationButton.setAttribute('disabled', 'disabled');
    if(!navigator.geolocation){
        return alert('Geolocation is supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {lat: position.coords.latitude, long: position.coords.longitude}, (error)=>{
            $sendLocationButton.removeAttribute('disabled');
            if(error){
                return console.log(error);
            }
            console.log('Location Shared!!');
        })
    })
})

socket.emit('Join', {username, room}, (error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});