import './App.css';
import {useState} from "react"
import axios from 'axios';
import {io} from "socket.io-client"

const URL = process.env.REACT_APP_API_URL
const authObj = {
  userName: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD
}

console.log(authObj, URL)
const sock = io(URL, {
  query: authObj
})

sock.on('connect', () => {
  console.log("You Connected")
})

function App() {

  const [volume, setVolume] = useState(.2)
  const [str, setStr] = useState(URL)
  const [requests, setRequest] = useState([])
  const [auth, setAuth] = useState({
    userName: "",
    password: ""
  })
  const [password, setPassword] = useState("")
  // let requests = useRef([])
  // const [playlist, setPlaylist] = useState([])

  sock.off("server-message").on("server-message", (message) => {
    console.log(message)
    if(message.id === 'send'){
      console.log(message.id)
      handleAddSong(message)
      // requests.current = message.requests
      // return socket.off("server-message")
    }
    if(message.id === "next"){
      console.log(message.id)
      handleNextSong()
      // return socket.off("server-message")
      // return socket.emit("end")
    }
    if(message.id === "prev"){
      console.log(message.id)
      handlePrevSong()
    }

    if(message.volume){
      document.querySelector("video").volume = volume + message.volume
      setVolume(volume + message.volume)
    }
    
 

    // console.log(/[0-9]/.test(message.id) )
    if(/[0-9]/.test(message.id)){
      console.log(message.id)
      handlePlayNow(message)
    }
  })
  // socket.off("server-message").on("server-message", (message) => {
  //   console.log(message)
  //   if(message.id === 'send'){
  //     console.log(message.id)
  //     handleAddSong(message)
  //     // requests.current = message.requests
  //     // return socket.off("server-message")
  //   }
  //   if(message.id === "next"){
  //     handleNextSong()
  //     console.log(message.id)
  //     // return socket.off("server-message")
  //     // return socket.emit("end")
  //   }
  // })
  

  const handleReload = () => {
    if(str[str.length-1] === "/"){
      setStr(str.slice(0, str.length-1))
    } else {
      setStr(str+"/")
    }
  }


  // useEffect(() => {
    // axios.get("http://192.168.1.159:3004/playlist")
    // .then((response) => {
    //   setPlaylist(response.data)
    // })
  // }, [])

  // const handleInput = (event) => {
  //   setRequest([...requests, event.target.value])
  // }

  const handleAddSong = (message) => {
    console.log("handleAddSong Ran")
    // axios.post(URL, {
    //   add: true,
    //   next: false,
    //   prev: false,
    //   requests: message.requests, //"http://www.youtube.com/watch?v={id}"
    // })
    // .then(()=> {
    //   setRequest(message.requests.reverse())
    //   // requests.current = message.requests
      
    // })
    // .catch(console.log)
    setRequest(message.requests.reverse())

    // axios.get("http://192.168.1.159:3004/playlist")
    // .then((response) => {
    //   // setPlaylist(response.data)
    // })
  }

  const handleNextSong = () => {
    console.log(requests)
    axios.post(URL, {
      add: false,
      next: true,
      prev: false,
      requests: requests //requests.current
    })
    .then((response) => {
      console.time("Response")
      const data = response.data
      handleReload()
      console.log("Returned ",data)  
      console.timeEnd("Response")
    })
    // then(() =>{
    //   console.time("timeOut")
    //   setTimeout(()=> {
    //     console.log("video reloaded")
    //     handleReload()
    //     console.timeEnd("timeOut")
    //   }, 4000)
    // })
    .catch(console.log)
  }

  const handlePrevSong = () => {
    axios.post(URL, {
      add: false,
      next: false,
      prev: true,
      requests: requests
    })
    .then(() => {
      setTimeout(()=> {
        console.log("ran")
        handleReload()
      }, 3000)
      
    })
    .catch(console.log)
  }

  const handlePlayNow = (message) => {
    axios.post(URL, {
      add: false,
      next: false,
      prev: false,
      play: true,
      id: message.id,
      requests: message.requests

    })
    .then(() => {
      setRequest(message.requests)
      setTimeout(()=> {
        console.log("ran")
        handleReload()
      }, 2000)
      
    })
    .catch(console.log)
  }

  function clientPassword() {
    sock.emit("password", password).emit("reconnect")
  }

  console.log(password)
  return (
    <div>
         {auth.userName === authObj.userName & auth.password === authObj.password ? <><video onLoad={(event)=> event.target.volume = 0.2} onEnded={handleNextSong} src={str} autoPlay muted controls></video> 
         {!!requests.length && requests.map((el, i)=><div key={i} id={el} onClick={handlePlayNow}>{el}</div>)}<input onChange={(event)=> setPassword(event.target.value)} type="text" required/><input onClick={clientPassword} type="submit"/></> : 
         <form action="" onSubmit={(event) => {
           event.preventDefault()
            setAuth({
              userName: event.target.userName.value,
              password: event.target.password.value
            })
          }}>
           <input id="userName" type="text" required/>
           <input id="password" type="text" required/>
           <input type="submit" />
          </form>}
    </div>
  
  )
}

export default App;
