const blogData = [
  {
    "id": 1,
    "title": "Introduction to Node.js",
    "content": "Node.js is a JavaScript runtime that allows developers to execute JavaScript outside the browser. It is commonly used for building APIs, web servers, and real-time applications.",
    "author": "Anurag Gupta",
    "topic": "Node.js"
  },
  {
    "id": 2,
    "title": "Getting Started with Express.js",
    "content": "Express.js is a lightweight web framework for Node.js. It simplifies the process of creating servers, defining routes, handling requests, and sending responses.",
    "author": "Rahul Sharma",
    "topic": "Express.js"
  },
  {
    "id": 3,
    "title": "Understanding REST APIs",
    "content": "REST APIs allow applications to communicate using HTTP methods such as GET, POST, PUT, PATCH, and DELETE. They help developers build scalable and maintainable backend systems.",
    "author": "Priya Verma",
    "topic": "API Development"
  },
  {
    "id": 4,
    "title": "What is MVC Architecture?",
    "content": "MVC stands for Model View Controller. It separates an application into three components: data management, user interface, and request-handling logic.",
    "author": "Amit Kumar",
    "topic": "Software Architecture"
  },
  {
    "id": 5,
    "title": "Understanding Route Parameters",
    "content": "Route parameters are dynamic values included in a URL path. In Express.js, they can be accessed using req.params and are useful for fetching individual resources.",
    "author": "Sneha Singh",
    "topic": "Express.js"
  },
  {
    "id": 6,
    "title": "Working with Query Parameters",
    "content": "Query parameters are key-value pairs added to a URL after a question mark. They are commonly used for filtering, sorting, searching, and pagination.",
    "author": "Vikas Mehta",
    "topic": "API Development"
  },
  {
    "id": 7,
    "title": "JavaScript Array Methods",
    "content": "JavaScript provides useful array methods such as map, filter, reduce, find, and forEach. These methods make it easier to transform, search, and process collections of data.",
    "author": "Neha Kapoor",
    "topic": "JavaScript"
  },
  {
    "id": 8,
    "title": "Understanding Asynchronous JavaScript",
    "content": "Asynchronous JavaScript allows programs to perform operations without blocking the main execution flow. Promises and async/await make asynchronous code easier to manage.",
    "author": "Rohit Malhotra",
    "topic": "JavaScript"
  },
  {
    "id": 9,
    "title": "Introduction to MongoDB",
    "content": "MongoDB is a NoSQL database that stores data in flexible, document-oriented structures. It is commonly used in applications that require scalable data storage.",
    "author": "Anurag Gupta",
    "topic": "Databases"
  },
  {
    "id": 10,
    "title": "SQL vs NoSQL Databases",
    "content": "SQL databases organize data into tables with predefined schemas, while NoSQL databases support different data models. The choice depends on application requirements and data relationships.",
    "author": "Karan Malhotra",
    "topic": "Databases"
  },
  {
    "id": 11,
    "title": "Authentication with JWT",
    "content": "JSON Web Tokens are commonly used to represent claims between parties. In web applications, they can help implement authentication and authorization mechanisms.",
    "author": "Simran Kaur",
    "topic": "Web Security"
  },
  {
    "id": 12,
    "title": "Understanding HTTP Status Codes",
    "content": "HTTP status codes indicate the outcome of a request. Common examples include 200 for success, 201 for resource creation, 400 for bad requests, 404 for not found, and 500 for server errors.",
    "author": "Arjun Patel",
    "topic": "API Development"
  },
  {
    "id": 13,
    "title": "Introduction to React.js",
    "content": "React.js is a JavaScript library for building user interfaces. It uses reusable components and a declarative programming model to create interactive web applications.",
    "author": "Meera Joshi",
    "topic": "React.js"
  },
  {
    "id": 14,
    "title": "Understanding React Hooks",
    "content": "React Hooks allow functional components to use state and other React features. Popular hooks include useState, useEffect, useContext, and useRef.",
    "author": "Aditya Rao",
    "topic": "React.js"
  },
  {
    "id": 15,
    "title": "Introduction to TypeScript",
    "content": "TypeScript extends JavaScript with static type checking. It helps developers identify certain errors during development and improves code maintainability.",
    "author": "Ishita Jain",
    "topic": "TypeScript"
  },
  {
    "id": 16,
    "title": "Getting Started with Git",
    "content": "Git is a distributed version control system used to track changes in source code. It enables developers to create branches, collaborate, and manage project history.",
    "author": "Manish Yadav",
    "topic": "Developer Tools"
  },
  {
    "id": 17,
    "title": "Introduction to Docker",
    "content": "Docker allows developers to package applications and their dependencies into containers. Containers help maintain consistent environments across development and deployment.",
    "author": "Kavya Nair",
    "topic": "DevOps"
  },
  {
    "id": 18,
    "title": "Understanding Middleware in Express.js",
    "content": "Middleware functions have access to the request object, response object, and next function. They are commonly used for logging, authentication, validation, and error handling.",
    "author": "Siddharth Verma",
    "topic": "Express.js"
  },
  {
    "id": 19,
    "title": "API Security Best Practices",
    "content": "Secure APIs by validating input, implementing authentication, enforcing authorization, using HTTPS, applying rate limits, and handling errors without exposing sensitive information.",
    "author": "Divya Sharma",
    "topic": "Web Security"
  },
  {
    "id": 20,
    "title": "Introduction to Pagination",
    "content": "Pagination divides a large collection of records into smaller sets. APIs often use query parameters such as page and limit to return manageable amounts of data.",
    "author": "Nikhil Gupta",
    "topic": "API Development"
  }
]

// Route Params
exports.getBlogById = (req, res) => {
    const blogId = parseInt(req.params.id) // 15

    const blogPost = blogData.find(blog => blog.id === blogId)

    if(!blogPost){
        res.status(404).json({ success: false, message: "Blog post not found!" })
    }

    res.status(200).json({ success: true, message: "Successfully fetched blog!", blog: blogPost })
}

// Query Params
exports.getAllBlogs = (req, res) => {
    let filteredBlogs = blogData

    if(req.query.author){
        const author = req.query.author
        filteredBlogs = filteredBlogs.filter(blog => blog.author.toLowerCase() === author.toLowerCase())
    }

    if(req.query.topic){
        const topic = req.query.topic
        filteredBlogs = filteredBlogs.filter(blog => blog.topic.toLowerCase() === topic.toLowerCase())
    }

    res.status(200).json({ success: true, message: "Successfuly fetched blogs!", blogs: filteredBlogs })
}

