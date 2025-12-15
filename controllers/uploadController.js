const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc    Upload file to Cloudinary
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'fycred_documents',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: error.message });
                }

                res.status(200).json({
                    success: true,
                    message: 'File uploaded successfully',
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Server Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server upload error', error: error.message });
    }
};

// @desc    Get a signed URL for a file
const getSignedUrl = (req, res) => {
    try {
        const { url, download, format } = req.query;

        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        // Extract parts from the Cloudinary URL
        const regex = /\/(image|video|raw)\/upload\/(?:v(\d+)\/)?(.+?)(?:\.(\w+))?$/;
        const match = url.match(regex);

        if (!match) {
            return res.redirect(url);
        }

        const resourceType = match[1];
        const version = match[2];
        let publicId = match[3];
        const extension = match[4];

        const options = {
            resource_type: resourceType,
            type: 'upload',
            sign_url: true,
            secure: true
        };

        if (version) {
            options.version = version;
        }

        if (download === 'true') {
            options.flags = 'attachment';
        }

        if (format) {
            options.format = format;
        } else if (extension) {
            // Standard behavior: delivery format matches extension
            options.format = extension;
        }

        // Generate URL
        const signedUrl = cloudinary.url(publicId, options);

        res.redirect(signedUrl);

    } catch (error) {
        console.error('Signed URL Error:', error);
        res.status(500).send('Error generating link');
    }
};

module.exports = {
    uploadFile,
    getSignedUrl
};
