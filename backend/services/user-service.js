const UserModel = require('../models/user-model');
const hashService = require('./hash-service');

class UserService {
    async findUser(filter) {
        const user = await UserModel.findOne(filter);
        return user;
    }

    async createUser(data) {
        // Hash the password before saving it to the database
        const hashedPassword = await hashService.hashPassword(data.password);
        const user = await UserModel.create({ email: data.email, password: hashedPassword});
        return user;
    }

    async findPassword(email, password) {
        // Find the user by email
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return false;
        }
        // Verify the provided password with the stored hashed password
        return await hashService.verifyPassword(password, user.password);
    }
}

module.exports = new UserService();