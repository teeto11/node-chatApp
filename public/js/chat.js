const socket = io()


const $messageForm = document.querySelector('#form-input')
const $messageFormInput = $messageForm.querySelector('input')
const $messsageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $locationTemplate = document.querySelector('#location-template').innerHTML
//templates
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const  autoscroll = () => {
    //New message element
        const $newMessage =$messages.lastElementChild
        
        //height of the new message
        const newMessageStyles = getComputedStyle($newMessage)
        const newMessageMargin = parseInt(newMessageStyles.marginBottom)
        const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

        //visible height
        const visibleHeight = $messages.offsetHeight

        //height of messages container
        const containerHeight = $messages.scrollHeight
        //height far have i scrolled
        const scrollOffset = $messages.scrollTop + visibleHeight

        if(containerHeight - newMessageHeight <= scrollOffset){
            $messages.scrollTop = $messages.scrollHeight
        }
}


socket.emit('join',{username,room},(error) => {
    if(error){
        alert('invalid')
        location.href = '/'
    }
})

socket.on('countUpdated',(count) => {
   console.log('count is now'+count)
})

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location) => {

    const html = Mustache.render($locationTemplate,{
        username:location.username,
        message:location,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend',html)
    console.log(location)
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    autoscroll()
})

// document.querySelector('#click').addEventListener('click',() => {
    
//     console.log('clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    $messsageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
   // console.log(message)
   socket.emit('sendMessage',message,(error) => {
       $messsageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()

       if(error){
           return console.log(error)
       }
       console.log('delivered'+delivered)

   })
})

$locationButton.addEventListener('click',() => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
     $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {

        const data = {
            latitude: position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation',data,(response) => {
            $locationButton.removeAttribute('disabled')
            console.log('delivered'+response)
        })
        //console.log(position)
    })
})