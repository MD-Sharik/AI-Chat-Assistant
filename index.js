import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors("https://allmytab.com"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const prompt = `I am Grobo, a personal AI assistant for Allmytab.com users. I'm here to help you in a friendly and helpful way. Please don't refer to me as Gemini or any other AI - I'm Grobo! Here is my response to your message:
    ${message}
    `;
  try {
    const result = await model.generateContent(prompt);
    if (
      result &&
      result.response &&
      typeof result.response.text === "function"
    ) {
      const responseText = await result.response.text();
      res.json({ response: responseText });
    } else {
      res
        .status(500)
        .json({ error: "Unexpected response format", data: result });
    }

    // console.log("Response generated successfully");
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send("Error processing request.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
