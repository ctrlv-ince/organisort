const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

const isCloudinaryConfigured = () => {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME
        && process.env.CLOUDINARY_API_KEY
        && process.env.CLOUDINARY_API_SECRET
    );
};

const buildCloudinarySignature = (timestamp, folder) => {
    const payload = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    return crypto.createHash('sha1').update(payload).digest('hex');
};

const uploadImageToCloudinary = async ({ imageData, folderName = 'organisort/general' }) => {
    if (!imageData) {
        return null;
    }

    if (!isCloudinaryConfigured()) {
        return {
            secureUrl: null,
            publicId: null,
            storedInCloudinary: false,
            reason: 'Cloudinary env vars not configured',
        };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildCloudinarySignature(timestamp, folderName);

    const uploadForm = new FormData();
    uploadForm.append('file', imageData);
    uploadForm.append('api_key', process.env.CLOUDINARY_API_KEY);
    uploadForm.append('timestamp', timestamp);
    uploadForm.append('folder', folderName);
    uploadForm.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await axios.post(endpoint, uploadForm, {
        headers: uploadForm.getHeaders(),
        timeout: 30000,
    });

    return {
        secureUrl: response.data.secure_url,
        publicId: response.data.public_id,
        storedInCloudinary: true,
        reason: null,
        metadata: {
            bytes: response.data.bytes,
            format: response.data.format,
            width: response.data.width,
            height: response.data.height,
        },
    };
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId || !isCloudinaryConfigured()) {
        return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

    const destroyForm = new FormData();
    destroyForm.append('public_id', publicId);
    destroyForm.append('api_key', process.env.CLOUDINARY_API_KEY);
    destroyForm.append('timestamp', timestamp);
    destroyForm.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`;

    await axios.post(endpoint, destroyForm, {
        headers: destroyForm.getHeaders(),
        timeout: 15000,
    });
};

module.exports = {
    isCloudinaryConfigured,
    uploadImageToCloudinary,
    deleteCloudinaryImage,
};
