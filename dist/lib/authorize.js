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
exports.Authorize = void 0;
const BN = require("bn.js");
const cryptoJS = require("crypto-js");
const elliptic = require("elliptic");
const P256 = elliptic.ec('p256');
const crypto_utils_1 = require("@safeheron/crypto-utils");
const assert = require("assert");
var Authorize;
(function (Authorize) {
    /**
     * Sign a message
     * @param localAuthPriv
     * @param data
     * @return Promise<string>  Hex(r) + Hex(s)
     */
    function sign(localAuthPriv, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof data === 'string') {
                data = cryptoJS.enc.Utf8.parse(data);
            }
            else if (data instanceof Uint8Array) {
                data = crypto_utils_1.Hex.toCryptoJSBytes(crypto_utils_1.Hex.fromBytes(data));
            }
            else {
                // CryptoJSBytes, do nothing
            }
            // Get hash of cypher text
            const sha256 = cryptoJS.algo.SHA256.create();
            sha256.update(data);
            const dig = sha256.finalize();
            let hash = new BN(cryptoJS.enc.Hex.stringify(dig), 16);
            // Get signature
            //let ecdsa = new elliptic.ec(P256)
            let priv = P256.keyFromPrivate(localAuthPriv);
            let signature = P256.sign(hash, priv);
            return crypto_utils_1.Hex.pad64(signature.r.toString(16))
                + crypto_utils_1.Hex.pad64(signature.s.toString(16));
        });
    }
    Authorize.sign = sign;
    /**
     * Verify the signatures.
     * @returns boolean
     * @param authPub
     * @param data
     * @param sig
     */
    function verify(authPub, data, sig) {
        // Get r,s
        assert(sig.length === 128);
        const r = new BN(sig.substring(0, 64), 16);
        const s = new BN(sig.substring(64), 16);
        let signature = { r: r, s: s };
        if (typeof data === 'string') {
            data = cryptoJS.enc.Utf8.parse(data);
        }
        else if (data instanceof Uint8Array) {
            data = crypto_utils_1.Hex.toCryptoJSBytes(crypto_utils_1.Hex.fromBytes(data));
        }
        else {
            // CryptoJSBytes, do nothing
        }
        // Get hash of cypher text
        const sha256 = cryptoJS.algo.SHA256.create();
        sha256.update(data);
        const dig = sha256.finalize();
        let hash = new BN(dig.toString(cryptoJS.enc.Hex), 16);
        // Verify signature
        return P256.verify(hash, signature, authPub);
    }
    Authorize.verify = verify;
})(Authorize = exports.Authorize || (exports.Authorize = {}));
//# sourceMappingURL=authorize.js.map