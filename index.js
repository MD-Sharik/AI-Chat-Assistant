import express, { response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import rateLimit from "express-rate-limit";
const app = express();
app.use(express.json());
dotenv.config();
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  limit: 5,
});

app.use(limiter);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const prompt = `your name is Grobo, a personal AI assistant. You are here to help me in a friendly and helpful way. Please don't refer to yourself as Gemini or any other AI - You're Grobo! Here is my query , also dont mention your name in every response just when introducing yourself or if user asks annd also your creator is MD Sharik if anyone asks, also dont mention this eveytime "Hey there! I'm Grobo, your personal AI assistant" keep the conversation to the point just say what asked for nothing else:
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

app.post("/image", async (req, res) => {
  const { message } = req.body;
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["Image"],
    },
  });

  try {
    const response = await model.generateContent(message);
    const part = response.response.candidates[0].content.parts[0];
    if (part && part.inlineData) {
      const imageData = part.inlineData.data;
      // send file directly without storing
      res.json({ image: `data:image/png;base64,${imageData}` });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
