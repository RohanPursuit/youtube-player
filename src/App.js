import './App.css';
import {useState} from "react"
// import ReactPlayer from 'react-player/lazy'
import axios from 'axios';
import { Route, Routes, Link } from 'react-router-dom';
import {io} from "socket.io-client"

const URL = process.env.REACT_APP_API_URL

// const socket = io("http://localhost:3004")
const sock = io(URL)

sock.on('connect', () => {
  console.log("You Connected")
})

function App() {

  
  const [str, setStr] = useState(URL)
  const [requests, setRequest] = useState([])
  // let requests = useRef([])
  // const [playlist, setPlaylist] = useState([])
  const [message, setMessage] = useState('')

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
  

  function sendMessage(event) {
    sock.emit("client-message", {
      id: event.target.id,
      requests: requests
    })

  }

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
    axios.post(URL, {
      add: true,
      next: false,
      prev: false,
      requests: message.requests, //"http://www.youtube.com/watch?v={id}"
    })
    .then(()=> {
      setRequest(message.requests)
      // requests.current = message.requests
      
    })
    .catch(console.log)

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
    .then(() => {
      setTimeout(()=> {
        console.log("ran")
        handleReload()
      }, 3000)
      
    })
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

  const playVideo = (event) => {
    console.log(event.target.play())
  }

  // runPlease(handleAddSong)
  
  return (
    <div>
      <Routes>
        <Route path="/" element={
          <nav>
            <Link to="/host">
              Host
            </Link>
            <Link to="/remote">
              Remote
            </Link>
          </nav>}
        />
        <Route exact path='/host'
          element={<><h1>{message}</h1>
          <video onEnded={handleNextSong} src={str} autoPlay muted controls></video>
          {/* <input onChange={handleInput} type="text" /> */}
          {/* <button id="send" onClick={handleAddSong}>Send</button> */}
          {/* <button id="send" onClick={sendMessage}>Send</button> */}
          {/* <button id="next" onClick={sendMessage}>Next</button> */}
          {/* <button onClick={handlePrevSong}>Prev</button> */}
          {/* <button onClick={sendMessage}>test</button> */}
          {!!requests.length && requests.map((el, i)=><div key={i} id={el} onClick={handlePlayNow}>{el}</div>)}</>}
          />
        {/* <Route path='/remote' element={<Remote/>}/> */}
      </Routes>
      
    </div>
  
  )
}

// function runPlease(handleAddSong){

//   socket.on("server-message", async (message) => {
//     console.log(message)
//     if(message.id === 'send'){
//       console.log(message.id)
//       await handleAddSong(message) 
//       return null
//     }
//       if(message.id === "next"){
//       console.log(message.id)
//       // handleNextSong()
//     }
//   })
// }

export default App;
