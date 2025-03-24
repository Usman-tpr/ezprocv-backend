const Blog = require('../models/Blog');
const EzUser = require('../models/EzUser');
const path = require('path');
const fs = require('fs');

// Create a new blog
const createBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // Handle image upload
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
        
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image is required' });
        }
          console.log(req.user)
        const blog = new Blog({
            title,
            description,
            image: imageUrl,
            author: req.user.adminId
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name')
            .populate('comments.user', 'name');
        
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if user is the author
        // if (blog.author.toString() !== req.user.userId) {
        //     return res.status(403).json({ message: 'Not authorized to update this blog' });
        // }

        blog.title = title || blog.title;
        blog.description = description || blog.description;
        
        // Update image if new one is uploaded
        if (req.file) {
            blog.image = `/uploads/${req.file.filename}`;
        }

        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Delete image if exists
        if (blog.image) {
            const imagePath = path.join(__dirname, '..', blog.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Blog.deleteOne({ _id: req.params.id });
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add comment to blog
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.comments.push({
            user: req.user.userId,
            content
        });

        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like/Unlike blog
const toggleLike = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const likeIndex = blog.likes.indexOf(req.user.userId);
        if (likeIndex === -1) {
            blog.likes.push(req.user.userId);
        } else {
            blog.likes.splice(likeIndex, 1);
        }

        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    addComment,
    toggleLike
}; 