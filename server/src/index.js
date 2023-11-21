require('dotenv').config();

const express = require("express");

const OpenAI = require('openai');

const cors = require("cors");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

const app = express();
app.use(cors());

app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({
    message: "pong",
  });
});

// const chatCompletion = await openai.chat.completions.create({
//   model: "gpt-3.5-turbo",
//   messages: [{"role": "user", "content": "Hello!"}],
// });
// console.log(chatCompletion.choices[0].message);


app.post("/chat", (req, res) => {
  const question = req.body.question;

  openai.completions.create({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 4000,
      temperature: 0,
    })
    .then((response) => {
      console.log({ response });
      return response?.data?.choices?.[0]?.text;
    })
    .then((answer) => {
      console.log({ answer });
      const array = answer
        ?.split("\n")
        .filter((value) => value)
        .map((value) => value.trim());

      return array;
    })
    .then((answer) => {
      res.json({
        answer: answer,
        propt: question,
      });
    });
  console.log({ question });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
