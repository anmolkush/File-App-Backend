
const File = require("../models/File");
const cloudinary = require("cloudinary").v2;

//localfileupload -> handler function
exports.localFileUpload = async (req, res) => {
    try {
        const file = req.files.file;
        console.log("File received -> ", file);

        let path =
            __dirname + "/files/" + Date.now() + `.${file.name.split(".")[1]}`;
        console.log("PATH-> ", path);

        file.mv(path, (err) => {
            console.log(err);
        });

        res.json({
            success: true,
            message: "Local File Uploaded Successfully",
        });
    } catch (error) {
        console.log("Not able to upload the file on server");
        console.log(error);
    }
};

function isFileTypeSupported(type, supportedTypes) {
    return supportedTypes.includes(type);
}

function isLargeFile(fileSize) {
    const mbSize = fileSize / (1024 * 1024);
    console.log("filesize is --> ", mbSize);
    return mbSize > 5;
}

async function uploadFileToCloudinary(file, folder, quality) {
    const options = { 
        folder: folder,
        resource_type: "auto",

        public_id: file.name,
        use_filename: true,
        unique_filename: false
    };

    console.log("temp file path", file.tempFilePath);

    if (quality) {
        options.quality = quality;
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.imageUpload = async (req, res) => {
    try {
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.imageFile;
        console.log(file);

        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split(".")[1].toLowerCase();
        console.log("File Type:", fileType);

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: "File format not supported",
            });
        }

        console.log("Uploading to Cloudinary");
        const response = await uploadFileToCloudinary(file, "FileApp");
        console.log(response);

        const fileData = await File.create({
            name,
            tags,
            email,
            url: response.secure_url,
        });

        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Image Successfully Uploaded",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

exports.videoUpload = async (req, res) => {
    try {
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.videoFile;

        const supportedTypes = ["mp4", "mov"];
        const fileType = file.name.split(".")[1].toLowerCase();
        console.log("File Type:", fileType);

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: "File format not supported",
            });
        }

        const fileSize = file.size;
        if(isLargeFile(fileSize)){
            return res.status(400).json({
                success: false,
                message: 'Files greater than 5mb are not supported'
            })
        }

        console.log("Uploading to Cloudinary");

        const response = await uploadFileToCloudinary(file, "FileApp");
        console.log(response);

        const fileData = await File.create({
            name,
            tags,
            email,
            url: response.secure_url,
        });

        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Video Successfully Uploaded",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

//imageSizeReducer handler
exports.imageSizeReducer = async (req, res) => {
    try {
        //data fetch
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.imageFile;
        console.log(file);

        //Validation
        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split(".")[1].toLowerCase();
        console.log("File Type:", fileType);

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: "File format not supported",
            });
        }

        //add a upper limit of 5MB for image
        const fileSize = file.size;
        if (isLargeFile(fileSize)) {
            return res.status(400).json({
                success: false,
                message: "Files greater than 5mb are not supported",
            });
        }

        //file format and size are supported
        console.log("Uploading to Cloudinary");

        //COMPRESS using width and height - options = {width: 800, height: 600}
        //compressing using quality property of options objects
        const response = await uploadFileToCloudinary(file, "FileApp", 80);
        console.log(response);

        // Saving Entry in DB
        const fileData = await File.create({
            name,
            tags,
            email,
            url: response.secure_url,
        });

        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Image Successfully Uploaded",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};