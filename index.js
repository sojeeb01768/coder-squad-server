const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvqywrf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db('coderSquad').collection('users')
        const taskCollection = client.db('coderSquad').collection('tasks')

        app.post('/user', async (req, res) => {
            try {
                const { name, email } = req.body;
                // Create a new user document
                const newUser = {
                    name,
                    email,
                };

                // Insert the user document into the collection
                await userCollection.insertOne(newUser);
                res.status(201).json({ message: 'User created successfully' });
            }
            catch (error) {
                console.error(error.message);
                res.status(500).send('Server Error');
            }
        })

        app.post('/addTask', async (req, res) => {
            const request = req.body;
            // const task = { ...request }
            try {
                const result = await taskCollection.insertOne(request);
                res.send(result);
            } catch (error) {
                console.error(error.message);
                res.status(500).send('Failed to add task');
            }
        });

        app.get('/myTasks/:email', async (req, res) => {
            try {
                const result = await taskCollection.find({ email: req.params.email }).toArray();
                if (!result) {
                    return res.status(404).send('No tasks found for this email');
                }
                console.log(result);
                res.send(result);
            } catch (error) {
                console.error(error.message);
                res.status(500).send('Failed to get task data');
            }
        });





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running')
})


app.listen(port, () => {
    console.log(`server is running on ${port}`)
})