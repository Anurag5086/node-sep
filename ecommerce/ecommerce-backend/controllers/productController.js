const Product = require('../models/Product')
const Category = require('../models/Category')

exports.getProductById = async (req, res) => {
    try{
        const id = req.params.id

        const product = await Product.findById(id)
        if(!product){
            res.status(404).json({ success: false, message: "Product not found!" })
        }

        res.status(200).json({ success: true, message: "Product fetched successfully!" , product })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({ isActive: true })
        if(products.length < 1){
            res.status(404).json({ success: false, message: "Products not found!" })
        }

        res.status(200).json({ success: true, message: "Products fetched successfully!" , products })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.getAllProductsForAdmin = async (req, res) => {
    try{
        const products = await Product.find()
        if(products.length < 1){
            res.status(404).json({ success: false, message: "Products not found!" })
        }

        res.status(200).json({ success: true, message: "Products fetched successfully!" , products })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.getAllProductsForCategory = async (req, res) => {
    try{
        const categoryId = req.params.categoryId

        const category = await Category.findById(categoryId)
        if(!category){
            res.status(404).json({ success: false, message: "Category not found!" })
        }

        const productsInCategory = await Product.find({ categoryId, isActive: true }).populate('categoryId', 'title')
        if(productsInCategory.length < 1){
            res.status(404).json({ success: false, message: "No Products found for this category!" })
        }

        res.status(200).json({ success: true, message: "Products fetched successfully!" , products: productsInCategory })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.createProduct = async (req, res) => {
    try{
        const { title, description, mrpPrice, sellingPrice, images, categoryId, stockQuantity, rating, noOfRatings, brand } = req.body

        const newProduct = new Product({ title, description, mrpPrice, sellingPrice, images, categoryId, stockQuantity, rating, noOfRatings, brand })

        await newProduct.save()

        res.status(201).json({ success: true, message: "Product created successfully!" , product: newProduct })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.updateProduct = async (req, res) => {
    try{
        const id = req.params.id

        const product = await Product.findById(id)
        if(!product){
            res.status(404).json({ success: false, message: "Product not found!" })
        }

        await Product.findByIdAndUpdate(id, req.body)

        res.status(200).json({ success: true, message: "Product updated successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}

exports.deleteProduct = async (req, res) => {
    try{
        const id = req.params.id

        const product = await Product.findById(id)
        if(!product){
            res.status(404).json({ success: false, message: "Product not found!" })
        }

        await Product.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: "Product deleted successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!"})
    }
}