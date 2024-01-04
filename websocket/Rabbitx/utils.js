const { ethers } = require("ethers");
const { ExpirationTimestamp } = require("./time");
const { default: axios } = require("axios");
const { RBT_API_KEY, RABBITX_API_URL } = require("../../config/index");
const apiURI = RABBITX_API_URL;

const accountPrivateKey = process.env.METAMASK_PRIVATE_KEY;

const authMessage = "Welcome to Rabbit DEX";

const getMessage = (message, timestamp) => `${message}\n${timestamp}`;
function hex2bytes(hex) {
  return ethers.utils.arrayify(hex);
}
let wallet;
async function sign(request, privateKey) {
  wallet = new ethers.Wallet(privateKey);
  const messageToSign = getMessage(request.message, request.timestamp);

  const signedMessage = await wallet.signMessage(messageToSign);

  return signedMessage;
}
const prepareSignature = async (message, timestamp, privateKey) => {
  const signRequest = {
    message,
    timestamp,
  };
  const signature = await sign(signRequest, privateKey);

  const signatureBytes = new Uint8Array(hex2bytes(signature));
  signatureBytes[signatureBytes.length - 1] =
    signatureBytes[signatureBytes.length - 1] % 27;

  const _sig = ethers.utils.hexlify(signatureBytes);

  return {
    originalSignature: signature,
    preparedSignature: _sig.startsWith("0x") ? _sig : `0x${_sig}`,
  };
};

const getToken = async () => {
  const expirationTimestamp = new ExpirationTimestamp();
  const timestamp = expirationTimestamp.expirationTimestamp;
  let token = null;
  try {
    const { preparedSignature } = await prepareSignature(
      authMessage,
      timestamp,
      accountPrivateKey
    );

    await axios
      .post(
        `${apiURI}/onboarding`,
        {
          signature: preparedSignature,
          wallet: wallet.address,
          isClient: false,
        },
        {
          headers: {
            "RBT-TS": timestamp,
            "RBT-API-KEY": RBT_API_KEY,
          },
        }
      )
      .then((res) => {
        token = res?.data?.result?.[0]?.jwt;
      })
      .catch((err) => {
        console.log("error in fetching Rabbit token", err);
      });

    return token;
  } catch (err) {
    console.log("error in Rabbitx api method  : ", err);
  }
};

module.exports = { getToken };
