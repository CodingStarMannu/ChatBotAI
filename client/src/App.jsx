import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import io from "socket.io-client";

const YOU = "you";
const AI = "ai";

function App() {
  const inputRef = useRef();
  const [qna, setQna] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useRef();

  useEffect(() => {
    // Connect to Socket.io
    socket.current = io("http://localhost:3000", {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd",
      },
    });
  
    // Listen for incoming messages
    socket.current.on("message", (data) => {
      updateQNA(AI, data);
    });
  
    // Log a message when the connection is established
    socket.current.on("connect", () => {
      console.log("Connected to Socket.io");
    });
  
    // Log a message when the connection is lost
    socket.current.on("disconnect", () => {
      console.log("Disconnected from Socket.io");
    });
  
    return () => {
      // Disconnect on component unmount
      socket.current.disconnect();
    };
  }, []);
  

  const updateQNA = (from, value) => {
    setQna((qna) => [...qna, { from, value }]);
  };

  const handleSend = () => {
    const question = inputRef.current.value;
    updateQNA(YOU, question);

    setLoading(true);
    axios
      .post("http://localhost:3000/chat", {
        question,
      })
      .then((response) => {
        updateQNA(AI, response.data.answer);

        // Send the message to the server
        socket.current.emit("message", response.data.answer);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const renderContent = (qna) => {
    const value = qna.value;

    if (Array.isArray(value)) {
      return value.map((v) => <p className="message-text">{v}</p>);
    }

    return <p className="message-text">{value}</p>;
  };
  return (
    <main className="container">
      <div className="chats">
        {qna.map((qna) => {
          if (qna.from === YOU) {
            return (
              <div className="send chat">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2202/2202112.png"
                  alt=""
                  className="avtar"
                />
                <p>{renderContent(qna)}</p>
              </div>
            );
          }
          return (
            <div className="recieve chat">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                alt=""
                className="avtar"
              />
              <p>{renderContent(qna)}</p>
            </div>
          );
        })}

        {loading && (
          <div className="recieve chat">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              alt=""
              className="avtar"
            />
            <p>Typing...</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          ref={inputRef}
          className="form-control col"
          placeholder="Type Something"
        />
        <button disabled={loading} className="btn btn-success" onClick={handleSend}>
          Send
        </button>
      </div>
    </main>
  );
}

export default App;
