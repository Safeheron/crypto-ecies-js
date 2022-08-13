import * as BN from 'bn.js';
import { CryptoJSBytes } from "@safeheron/crypto-utils";
export declare namespace AuthEnc {
    /**
     * Authenticate and encrypt the data.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @returns Promise<string> A string encoded in base64
     */
    function _encrypt(localAuthPriv: BN, remoteAuthPub: any, plain: string | Uint8Array | CryptoJSBytes): Promise<string>;
    /**
     * Verify the signatures and decrypt the data.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher = Base64(cypherBytes + signature(64 byte))
     * @returns [boolean, CryptoJSBytes]
     */
    function _decrypt(localAuthPriv: BN, remoteAuthPub: any, cypher: string): [boolean, CryptoJSBytes];
    /**
     * Encrypt a string to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher data is a string encoded in base64.
     */
    function encryptString(localAuthPriv: BN, remoteAuthPub: any, plain: string): Promise<string>;
    /**
     * Decrypt cypher data to a string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, string]} [ok, plain]
     */
    function decryptString(localAuthPriv: BN, remoteAuthPub: any, cypher: string): [boolean, string];
    /**
     * Encrypt the CryptoJSBytes to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher
     */
    function encryptCryptoJSBytes(localAuthPriv: BN, remoteAuthPub: any, plain: CryptoJSBytes): Promise<string>;
    /**
     * Decrypt a cypher string to plain CryptoJSBytes.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, CryptoJSBytes]} [ok, plain]
     */
    function decryptCryptoJSBytes(localAuthPriv: BN, remoteAuthPub: any, cypher: string): [boolean, CryptoJSBytes];
    /**
     * Encrypt the Bytes to a cypher string.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param plain
     * @return {Promise<string>} cypher
     */
    function encryptBytes(localAuthPriv: BN, remoteAuthPub: any, plain: Uint8Array): Promise<string>;
    /**
     * Decrypt a cypher string to plain bytes.
     * @param localAuthPriv
     * @param remoteAuthPub
     * @param cypher
     * @return {[boolean, Uint8Array]} [ok, plain]
     */
    function decryptBytes(localAuthPriv: BN, remoteAuthPub: any, cypher: string): [boolean, Uint8Array];
}