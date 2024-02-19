const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3010;

// Configure middlewares
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something went wrong! PLease try again.')
})
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Or specify the allowed origin
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.set('view engine', 'ejs');

// Input -> user question as a string
// Output -> response from the LLM model
app.post("/bot", async (req, res) => {
    console.log('req: ', req);
    const userInput = req.body.message;

    try {
        const response = await fetch("http://127.0.0.1:5000/process-text", {
            method: 'POST',
            body: JSON.stringify({ inputText: userInput }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        console.log("RCVD DATA: ", data)

        res.send(data)
    } catch (error) {
        console.error("[ERROR] POST /bot -> ", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
})

// Optional - Displaying the detailed result
app.get("/data", (req, res) => {
    const encodedArray = req.query.array;
    const decodedArray = JSON.parse(decodeURIComponent(encodedArray));
    console.log("decodedArray: ", decodedArray);
    res.render('data_table', {decodedArray});
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
