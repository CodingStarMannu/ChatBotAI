require('dotenv').config();

const express = require("express");

const OpenAI = require('openai');

const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("./config/mongoose");
const Message = require("./models/message");

const cors = require("cors");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY 
  });

const app = express();
app.use(cors());

app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server);


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("message", (data) => {
    // Broadcast the message to all clients
    io.emit("message", data);
  });
});

app.get("/ping", (req, res) => {
  res.json({
    message: "pong",
  });
});

app.post("/chat", async (req, res) => {
  const question = req.body.question;

  try {
    // Save the user's question to MongoDB
    await Message.create({ content: question });

    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 4000,
      temperature: 0,
    });

    const answer = response?.data?.choices?.[0]?.text;
    console.log({ answer });

    // Save the AI's answer to MongoDB
    await Message.create({ content: answer });

    const array = answer
      ?.split("\n")
      .filter((value) => value)
      .map((value) => value.trim());

    res.json({
      answer: array,
      prompt: question,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
