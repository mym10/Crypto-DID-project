import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pinataSDK from "@pinata/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

app.post("/upload", async (req, res) => {
  try {
    const jsonData = req.body;
    const result = await pinata.pinJSONToIPFS(jsonData);
    res.json({ cid: result.IpfsHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
