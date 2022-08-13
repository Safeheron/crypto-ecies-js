"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEnc = void 0;
const BN = require("bn.js");
const cryptoJS = require("crypto-js");
const elliptic = require("elliptic");
const P256 = elliptic.ec('p256');
const crypto_utils_1 = require("@safeheron/crypto-utils");
const ecies_1 = require("./ecies");
const assert = require("assert");
var AuthEnc;
(function (AuthEnc) {
    /**
     * Authenticate and encrypt the data.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @returns Promise<string> A string encoded in base64
     */
    function _encrypt(localAuthPriv, remoteAuthPub, plain) {
        return __awaiter(this, void 0, void 0, function* () {
            let plainBytes;
            if (typeof plain === 'string') {
                plainBytes = cryptoJS.enc.Utf8.parse(plain);
            }
            else if (plain instanceof Uint8Array) {
                plainBytes = crypto_utils_1.Hex.toCryptoJSBytes(crypto_utils_1.Hex.fromBytes(plain));
            }
            else {
                // CryptoJSBytes
                plainBytes = plain;
            }
            const sha256 = cryptoJS.algo.SHA256.create();
            sha256.update(plainBytes);
            let digest = sha256.finalize();
            let hash = new BN(digest.toString(cryptoJS.enc.Hex), 16);
            //let ecdsa = new elliptic.ec(P256)
            let priv = P256.keyFromPrivate(localAuthPriv);
            let signature = P256.sign(hash, priv);
            let signatureBytes = cryptoJS.enc.Hex.parse(crypto_utils_1.Hex.pad64(signature.r.toString(16)));
            signatureBytes.concat(cryptoJS.enc.Hex.parse(crypto_utils_1.Hex.pad64(signature.s.toString(16))));
            let sigPlain = plainBytes.concat(signatureBytes);
            let cypherBytes = yield ecies_1.ECIES.encryptCryptoJSBytes(remoteAuthPub, sigPlain);
            return crypto_utils_1.UrlBase64.fromCryptoJSBytes(cypherBytes);
        });
    }
    AuthEnc._encrypt = _encrypt;
    /**
     * Verify the signatures and decrypt the data.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher = Base64(cypherBytes + signature(64 byte))
     * @returns [boolean, CryptoJSBytes]
     */
    function _decrypt(localAuthPriv, remoteAuthPub, cypher) {
        let cypherBytes = crypto_utils_1.UrlBase64.toCryptoJSBytes(cypher);
        //Decrypt
        let sigPlain = ecies_1.ECIES.decryptCryptoJSBytes(localAuthPriv, cypherBytes);
        let sigPlainHex = cryptoJS.enc.Hex.stringify(sigPlain);
        //signature(64 byte)
        assert(sigPlainHex.length > 128);
        let r = new BN(sigPlainHex.substring(sigPlainHex.length - 128, sigPlainHex.length - 64), 16);
        let s = new BN(sigPlainHex.substring(sigPlainHex.length - 64), 16);
        let signature = { r: r, s: s };
        let plainBytes = cryptoJS.enc.Hex.parse(sigPlainHex.substring(0, sigPlainHex.length - 128));
        const sha256 = cryptoJS.algo.SHA256.create();
        sha256.update(plainBytes);
        const dig = sha256.finalize();
        let hash = new BN(cryptoJS.enc.Hex.stringify(dig), 16);
        // Verify signature
        // let ecdsa = new elliptic.ec(P256)
        if (!P256.verify(hash, signature, remoteAuthPub)) {
            return [false, undefined];
        }
        return [true, plainBytes];
    }
    AuthEnc._decrypt = _decrypt;
    /**
     * Encrypt a string to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher data is a string encoded in base64.
     */
    function encryptString(localAuthPriv, remoteAuthPub, plain) {
        return __awaiter(this, void 0, void 0, function* () {
            return _encrypt(localAuthPriv, remoteAuthPub, plain);
        });
    }
    AuthEnc.encryptString = encryptString;
    /**
     * Decrypt cypher data to a string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, string]} [ok, plain]
     */
    function decryptString(localAuthPriv, remoteAuthPub, cypher) {
        let [ok, cjsBytes] = _decrypt(localAuthPriv, remoteAuthPub, cypher);
        if (ok) {
            return [true, cryptoJS.enc.Utf8.stringify(cjsBytes)];
        }
        else {
            return [false, null];
        }
    }
    AuthEnc.decryptString = decryptString;
    /**
     * Encrypt the CryptoJSBytes to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher
     */
    function encryptCryptoJSBytes(localAuthPriv, remoteAuthPub, plain) {
        return __awaiter(this, void 0, void 0, function* () {
            return _encrypt(localAuthPriv, remoteAuthPub, plain);
        });
    }
    AuthEnc.encryptCryptoJSBytes = encryptCryptoJSBytes;
    /**
     * Decrypt a cypher string to plain CryptoJSBytes.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, CryptoJSBytes]} [ok, plain]
     */
    function decryptCryptoJSBytes(localAuthPriv, remoteAuthPub, cypher) {
        return _decrypt(localAuthPriv, remoteAuthPub, cypher);
    }
    AuthEnc.decryptCryptoJSBytes = decryptCryptoJSBytes;
    /**
     * Encrypt the Bytes to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher
     */
    function encryptBytes(localAuthPriv, remoteAuthPub, plain) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _encrypt(localAuthPriv, remoteAuthPub, plain);
        });
    }
    AuthEnc.encryptBytes = encryptBytes;
    /**
     * Decrypt a cypher string to plain bytes.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, Uint8Array]} [ok, plain]
     */
    function decryptBytes(localAuthPriv, remoteAuthPub, cypher) {
        let [ok, cjsBytes] = _decrypt(localAuthPriv, remoteAuthPub, cypher);
        if (ok) {
            return [true, crypto_utils_1.Hex.toBytes(crypto_utils_1.Hex.fromCryptoJSBytes(cjsBytes))];
        }
        else {
            return [false, null];
        }
    }
    AuthEnc.decryptBytes = decryptBytes;
})(AuthEnc = exports.AuthEnc || (exports.AuthEnc = {}));
//# sourceMappingURL=authEnc.js.map