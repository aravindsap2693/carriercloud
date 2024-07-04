import * as crypto from 'crypto-js';

const StorageConfiguration = {

    sessionSetItem(key, value) {
        localStorage.setItem(this.encrypt(key), this.encrypt(value));
    },

    sessionGetItem(key) {
        let decryptedValue = localStorage.getItem(this.encrypt(key));
        return decryptedValue != null ? this.decrypt(decryptedValue) : null;
    },

    sessionRemoveItem(key) {
        localStorage.removeItem(this.encrypt(key));
    },

    sessionRemoveAllItem() {
        localStorage.clear();
    },

    encrypt(data) {
        let key = crypto.enc.Utf8.parse('7061737323313244');
        let iv = crypto.enc.Utf8.parse('7061737323313244');
        let encrypted = crypto.AES.encrypt(crypto.enc.Utf8.parse(data), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            });
        return encrypted.toString();
    },

    decrypt(data) {
        let key = crypto.enc.Utf8.parse('7061737323313244');
        let iv = crypto.enc.Utf8.parse('7061737323313244');

        let decrypted = crypto.AES.decrypt(data, key, {
            keySize: 128 / 8,
            iv: iv,
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7
        });
        return decrypted.toString(crypto.enc.Utf8);
    },

    encryptWithAES(data) {
        let key = crypto.enc.Utf8.parse(process.env.REACT_APP_AES_SECRET_KEY);
        let iv = crypto.enc.Utf8.parse(process.env.REACT_APP_AES_IV_KEY);
        let encryptedData = crypto.AES.encrypt(crypto.enc.Utf8.parse(data), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            });
        let encryptedIV = crypto.AES.encrypt(crypto.enc.Utf8.parse(iv), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            });
        let encryptedDataWithIv = encryptedData + ':' + encryptedIV;
        return encryptedDataWithIv.toString();
    }

}

export default StorageConfiguration;