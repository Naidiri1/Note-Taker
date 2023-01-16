
const express = require('express');
const { readFromFile, writeToFile, readAndAppend } = require('./helpers/fsUtils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = 3001;
//middleware that allows the server to understand the data we send from the front end
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// this refers to the public folder
app.use(express.static('public'));
// HTML ROUTES 
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))
);
// HTML ROUTES

// API ROUTES 
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// GET Route for a specific id
app.get('/:id', (req, res) => {
    const id = req.params.id;
    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            const result = json.filter((note) => note.id === id);
            return result.length > 0
                ? res.json(result)
                : res.json('No note with that ID');
        });
});

// DELETE Route for a specific note
// when defining your route path, ":id" is a variable that we will pass 
app.delete('/api/notes/:id', (req, res) => {
    //this is the id we want to delete
    const id = req.params.id;
    //we read the db file
    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            // we filter out any note with the id we are trying to delete
            // Make a new array of all tips except the one with the ID provided in the URL
            const result = json.filter((note) => note.id !== id);

            // Save that array to the filesystem
            //we overwrite the file with the new notes without the id we deleted
            writeToFile('./db/db.json', result);

            // Respond to the DELETE request
            res.json(`Item ${id} has been deleted 🗑️`);
        });
});

// POST Route for a new UX/UI  note
app.post('/api/notes', (req, res) => {
    console.log(req.body);

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        readAndAppend(newNote, './db/db.json');
        res.json(`Note added successfully 🚀`);
    } else {
        res.error('Error in adding note');
    }
});
// API ROUTES 
app.listen(PORT, () =>
    console.log(`Express server listening on port http://localhost:${PORT}🚀`)
);
