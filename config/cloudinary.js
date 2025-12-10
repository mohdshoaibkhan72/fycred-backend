const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dieg87q3r',
    api_key: process.env.CLOUDINARY_API_KEY || '867177477892788',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'eWIpCdoQXV6a8KtXt-uftVQ7Baw'
});

console.log(`Cloudinary Connected: ${cloudinary.config().cloud_name}`);

module.exports = cloudinary;
