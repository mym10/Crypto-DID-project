// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DIDRegistry {

    struct DIDDocument {
        string cid;        // IPFS CID of DID Document
        uint256 updatedAt; // timestamp
        bool exists;
    }

    mapping(address => DIDDocument) public dids;

    event DIDRegistered(address indexed user, string cid);
    event DIDUpdated(address indexed user, string newCid);

    // Register new DID
    function registerDID(string memory cid) external {
        require(!dids[msg.sender].exists, "DID already exists");
        dids[msg.sender] = DIDDocument(cid, block.timestamp, true);
        emit DIDRegistered(msg.sender, cid);
    }

    // Update existing DID document
    function updateDID(string memory newCid) external {
        require(dids[msg.sender].exists, "DID not registered");
        dids[msg.sender].cid = newCid;
        dids[msg.sender].updatedAt = block.timestamp;

        emit DIDUpdated(msg.sender, newCid);
    }

    // Resolve DID of a user
    function resolveDID(address user) external view returns (string memory cid, uint256 updatedAt) {
        require(dids[user].exists, "DID not found");
        return (dids[user].cid, dids[user].updatedAt);
    }
}
