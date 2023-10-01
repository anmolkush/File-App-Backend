const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
    },
    tags: {
        type: String,
    },
    email: {
        type: String,
    }
});

fileSchema.post("save", async function (doc) {
    let f_type;
    try {
        console.log("DOC", doc);

        const d_url=doc.url;
        if (d_url.includes('image')){
             f_type="Image";
        }
        else{
            f_type="Video";
        }
        console.log("ftype",f_type)
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: 'mega49913@gmail.com',
            to: doc.email,
            subject: `New  ${f_type} File Uploaded on Cloudinary`,
            html: `<h2>FILE NAME -->  ${doc.name} </h2> 
            <p> ${f_type} has been successfully Uploaded </p>
            <p>View here: <a href="${doc.url}">${doc.url}</a></p>
            `,
        });

        console.log("INFO of mail", info);

    } catch (error) {
        console.error(error);
    }
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
