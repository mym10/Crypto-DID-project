import { uploadJSON } from "./utils/pinata.js";
import { createDIDDocument } from "./utils/didGenerator.js";

async function main() {
  const sampleAddress = "0x000000000000000000000000000000000000abcd";

  // Create DID Document
  const didDoc = createDIDDocument(sampleAddress, {
    profile: "https://example.com/profile"
  });

  console.log("Generated DID Document:", didDoc);

  // Upload to IPFS
  const cid = await uploadJSON(didDoc);

  console.log("Uploaded to IPFS!");
  console.log("CID =", cid);
}

main();
