const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AdminUser = require('../models/AdminUser');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminExists = await AdminUser.findOne({ username: 'admin' });
        if (!adminExists) {
            await AdminUser.create({
                username: 'admin',
                password: 'admin@123'
            });
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
