import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
dotenv.config();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

// Upload JSON to IPFS
export async function uploadJSON(jsonData) {
  try {
    const res = await pinata.pinJSONToIPFS(jsonData);
    return res.IpfsHash; // CID
  } catch (err) {
    console.error("IPFS Upload Error:", err);
    throw err;
  }
}
