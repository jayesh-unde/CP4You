const crypto = require('crypto');
const bcrypt = require('bcrypt');

class HashService {
    hashOtp(data) {
        return crypto.createHmac('sha256', process.env.HASH_SECRET).update(data).digest('hex');
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    generateRandomPassword(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    
}

module.exports = new HashService();