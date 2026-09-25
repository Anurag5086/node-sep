const File = require('../models/File')

exports.uploadFile = async (req, res) => {
    try{
        if(!req.file){
            res.status(400).json({ success: false, message: "No File Uploaded!" })
        }

        const { title, description } = req.body

        const newFile = new File({
            title,
            description,
            filePath: req.file.path
        })

        await newFile.save()

        res.status(201).json({ success: true, message: "File Uploaded Successfully!" , file: newFile})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}