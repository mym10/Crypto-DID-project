export function createDIDDocument(address) {
  const did = `did:example:${address}`;

  return {
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    authentication: [
      {
        id: `${did}#key-1`,
        type: "EcdsaSecp256k1RecoveryMethod2020",
        controller: did,
        blockchainAddress: address,
      },
    ],
    service: [
      {
        id: `${did}#profile`,
        type: "IdentityProfile",
        serviceEndpoint: "none",
      },
    ],
    createdAt: Date.now(),
  };
}
