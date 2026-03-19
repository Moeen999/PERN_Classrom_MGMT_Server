import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subjects";
import securityMiddleware from "./middlewares/security";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) throw new Error("FRONTEND_URL not defined");

app.use(cors({
    origin:process.env.FRONTEND_URL || false,
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(express.json());
app.use(securityMiddleware())
app.use("/api/subjects",subjectsRouter)

app.get("/", (_req, res) => {
    res.send("Server is running.");
});


app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});