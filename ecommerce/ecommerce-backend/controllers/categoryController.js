const Category = require('../models/Category')

exports.getCategoryById = async (req, res) => {
    try{
        const id = req.params.id

        const category = await Category.findById(id)
        if(!category){
            res.status(404).json({ success: false, message: "Category not found!" })
        }

        res.status(200).json({ success: true, message: "Category fetched successfully!",  category })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllCategories = async (req, res) => {
    try{
        const categories = await Category.find({ isActive: true })
        if(categories.length < 1){
            res.status(404).json({ success: false, message: "Categories not found!" })
        }

        res.status(200).json({ success: true, message: "Categories fetched successfully!",  categories })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllCategoriesForAdmin = async (req, res) => {
    try{
        const categories = await Category.find()
        if(categories.length < 1){
            res.status(404).json({ success: false, message: "Categories not found!" })
        }

        res.status(200).json({ success: true, message: "Categories fetched successfully!",  categories })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.createCategory = async (req, res) => {
    try{
        const { title, description } = req.body

        const newCategory = new Category({
            title,
            description
        })

        await newCategory.save()

        res.status(201).json({ success: true, message: "Category created successfully!",  category: newCategory })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.updateCategory = async (req, res) => {
    try{
        const { title, description, isActive } = req.body

        const id = req.params.id

        const category = await Category.findById(id)
        if(!category){
            res.status(404).json({ success: false, message: "Category not found!" })
        }

        await Category.findByIdAndUpdate(id, { title, description, isActive })

        res.status(200).json({ success: true, message: "Category updated successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.deleteCategory = async (req, res) => {
    try{
        const id = req.params.id

        const category = await Category.findById(id)
        if(!category){
            res.status(404).json({ success: false, message: "Category not found!" })
        }

        await Category.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: "Category deleted successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}