import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { writeContract, readContract, getWalletClient } from "@wagmi/core";
import { wagmiConfig } from "./wagmi";
import DIDRegistry from "./abis/DIDRegistry.json";
import { createDIDDocument } from "../../utils/didGenerator.js";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function uploadJSON(json) {
  const res = await fetch("http://localhost:4000/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  return (await res.json()).cid;
}

function App() {
  const { address, isConnected } = useAccount();

  const [resolvedCID, setResolvedCID] = useState("");
  const [resolvedDoc, setResolvedDoc] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [status, setStatus] = useState(""); // ACTIVE / NOT REGISTERED
  const [loading, setLoading] = useState(false);

  // CLEAR UI ON DISCONNECT
  useEffect(() => {
    if (!isConnected) {
      setResolvedCID("");
      setResolvedDoc(null);
      setTimestamp(null);
      setStatus("");
    }
  }, [isConnected]);

  // CHECK IF DID EXISTS BEFORE REGISTER
  async function checkDidExists() {
    const result = await readContract(wagmiConfig, {
      address: CONTRACT_ADDRESS,
      abi: DIDRegistry.abi,
      functionName: "resolveDID",
      args: [address],
    });
    return result[0] !== ""; // CID exists -> DID exists
  }

  // REGISTER DID
  async function handleRegisterDID() {
    try {
      if (!isConnected) return alert("Connect wallet first!");

      // prevent overwriting DID
      if (await checkDidExists()) {
        return alert("A DID already exists for this wallet. Use UPDATE instead.");
      }

      setLoading(true);

      const didJSON = createDIDDocument(address);
      const cid = await uploadJSON(didJSON);

      const walletClient = await getWalletClient(wagmiConfig);

      await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: DIDRegistry.abi,
        functionName: "registerDID",
        args: [cid],
        account: walletClient.account,
        gas: BigInt(600000),
      });

      alert("DID Successfully Registered!");
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Error registering DID!");
      setLoading(false);
    }
  }

  // UPDATE DID (only if DID exists)
  async function handleUpdateDID() {
    try {
      if (!isConnected) return alert("Connect wallet first!");

      // prevent updating nothing
      if (!(await checkDidExists())) {
        return alert("No DID found! Create one first.");
      }

      setLoading(true);

      const newDoc = createDIDDocument(address);
      const newCid = await uploadJSON(newDoc);

      const walletClient = await getWalletClient(wagmiConfig);

      await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: DIDRegistry.abi,
        functionName: "updateDID",
        args: [newCid],
        account: walletClient.account,
        gas: BigInt(600000),
      });

      alert("DID Updated Successfully!");
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Error updating DID!");
      setLoading(false);
    }
  }

  // RESOLVE DID
  async function handleResolveDID() {
    try {
      if (!isConnected) return alert("Connect wallet first!");

      setLoading(true);

      const result = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: DIDRegistry.abi,
        functionName: "resolveDID",
        args: [address],
      });

      const cid = result[0];
      const time = Number(result[1]);

      if (!cid) {
        setStatus("NOT REGISTERED");
        setResolvedCID("");
        setResolvedDoc(null);
        setTimestamp(null);
        setLoading(false);
        return;
      }

      setResolvedCID(cid);
      setTimestamp(time);
      setStatus("ACTIVE");

      const doc = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        .then((res) => res.json());

      setResolvedDoc(doc);
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Error resolving DID!");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0C2B4E",
        color: "#EFECE3",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontSize: "1.1rem",
      }}
    >
      <h1 style={{ fontSize: "3.5rem", margin: "30px" }}>
        Decentralized Identity System
      </h1>

      <ConnectButton />

      {/* BUTTONS */}
      {isConnected && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleRegisterDID}
            style={btnStyle}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Create DID
          </button>

          <button
            onClick={handleUpdateDID}
            style={btnStyle}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Update DID
          </button>

          <button
            onClick={handleResolveDID}
            style={btnStyle}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Resolve DID
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && <p style={{ marginTop: "20px" }}>Loading...</p>}

      {/* === PRETTY PROFILE CARD === */}
      {resolvedDoc && (
        <div
          style={{
            marginTop: "30px",
            background: "#123456",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "left",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>DID Profile</h2>

          <p><b>Status:</b> {status}</p>

          <p><b>DID ID:</b> {resolvedDoc.id}</p>

          <p>
            <b>CID:</b>{" "}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${resolvedCID}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#BBDCE5" }}
            >
              {resolvedCID} (open)
            </a>
          </p>

          {timestamp && (
            <p>
              <b>Last Updated:</b>{" "}
              {new Date(timestamp * 1000).toLocaleString()}
            </p>
          )}

          <h3 style={{ marginTop: "20px" }}>Full Document:</h3>
          <pre
            style={{
              background: "#0b203d",
              padding: "15px",
              borderRadius: "10px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(resolvedDoc, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "10px 20px",
  margin: "10px",
  background: "#BBDCE5",
  color: "#0C2B4E",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "transform 0.15s ease-in-out",
};

export default App;
