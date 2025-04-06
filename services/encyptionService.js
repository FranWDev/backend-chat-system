const crypt = require("crypto")
const dotenv = require("dotenv")
dotenv.config()

const ENCRYPTION_KEY =  Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const IV_LENGTH = 16;


function encrypt(message) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let encrypted = cipher.update(message, 'utf8', 'hex')
    encrypted += cipher.final("hex")
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
      };
}

function decrypt(encryptedMessage, ivHex) {
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}
