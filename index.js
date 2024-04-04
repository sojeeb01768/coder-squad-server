const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();

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
                res.send(result);
            } catch (error) {
                console.error(error.message);
                res.status(500).send('Failed to get task data');
            }
        });
       
        app.put('/updateTask/:id', async (req, res) => {
            try {
                const updatedTask = req.body.task; 
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updateData = { $set: { task: updatedTask } };

                console.log('Received updated task:', updatedTask); 

                const result = await taskCollection.updateOne(filter, updateData);

                if (result.modifiedCount === 1) {
                    res.status(200).json({ message: 'Task updated successfully', updatedTask });
                } else {
                    res.status(404).json({ message: 'Task not found or not modified' });
                }
            } catch (error) {
                console.error('Failed to update task:', error);
                res.status(500).send('Failed to update task');
            }
        });

        app.delete('/tasks/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const deleteQuery = { _id: new ObjectId(id) };
                const result = await taskCollection.deleteOne(deleteQuery)
                res.send(result)
            } catch (error) {
                res.status(200).send('Failed to delete student')
            }
        })


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