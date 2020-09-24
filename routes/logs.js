const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const router = express.Router();

// JUST MAKE SURE TO SECURE THIS ENDPOINT
router.get('/:type/:limit', async (req, res, next) => {
    try{
        const limit = req.params.limit;
        const type = req.params.type;
        const logs = [];

        fs.readdir(path.join(__dirname, '..', 'logs'), async (err, files) => {
            if(err) throw err;

            const desiredFiles = files.filter(f => f.includes(type));
            for (let file of desiredFiles) {
                const fileStream = fs.createReadStream(path.join(__dirname, '..', 'logs', file));
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity
                });

                for await (const line of rl) {
                    logs.push(JSON.parse(line));
                }
            };

            const desiredLogs = logs.length <= limit ? logs.reverse() : logs.slice(logs.length-limit, logs.length).reverse();
            res.json(desiredLogs);
        })

    } catch(e) {
        throw e;
    }
});

module.exports = router;
