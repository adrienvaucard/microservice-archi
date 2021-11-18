
const express = require('express')
const axios = require('axios')
const bodyparser = require('body-parser')
const crypto = require('crypto')

const app = express()
app.use(bodyparser.json())
const port = 3000;

// Adresse IP = 10.8.0.21
// Adresse Annuaire = 10.8.0.2

HOST_SERVER="10.8.0.2";
PORT="1338"

let access_keys = {
    secrey_key: "",
    public_key: "",
    token: ""
}

// Fonction lancée eu démarrage du service
const start = async () => {

    // Register MicroService
    let response;
    try {
        response = await axios.post(
            `http://${HOST_SERVER}:${PORT}/register`, 
            {
                host: 'http://10.8.0.21:3000',
                code:"adrien.vaucard"
            },
            {
                auth: {
                    username: "ynovset",
                    password: "tHuds4752_525@"
                }
            });
    }catch(e){
        console.error(e.response ? e.response.data : e)
        return
    }
    console.log(response.data);
    this.access_keys = response.data;

}

app.get('/ping', async (req, res) => {
    res.json("pong")
})

app.get('/getKey', async (req, res) => {
    if (req.headers['x-auth-token']) {
        tokenValidationResponse = await axios.post(
            `http://${HOST_SERVER}:${PORT}/token/validate`, 
            {
                token: req.headers['x-auth-token'],
            },
            {
                headers: {
                    "x-auth-token": this.access_keys.token,
                }
            }
        ).catch(e => {
            res.status(502)
            res.json(e)
        });

        if (tokenValidationResponse) {
            if (tokenValidationResponse.data.valid) {
                let encrypted_public_key = encrypt(this.access_keys.secret_key, this.access_keys.public_key)
                res.status(200)
                res.json({
                    encrypted_public_key: encrypted_public_key
                });
            } else {
                res.status(500)
                res.json("Invalid Token")
            }
            
        } else {
            res.status(500)
            res.json("Invalid Token")
        }
    } else {
        res.status(403)
        res.json("You need to Log In")
    }
})

app.get('/register', async (req, res) => {
    // Récuperer les headers
    let headers = req.headers;
    res.json()
})

// Création d'un endpoint en POST
app.post('/url_du_endpoint_en_post', async (req, res) => {
    // Récuération du body
    let body = req.body;
    let headers = req.headers;
    console.log(body)
    console.log(headers)
    res.json()
})


// Lancement du service
app.listen(port, () => {
    console.log(`Service listening at http://localhost:${port}`)
    start();
})



/**
 * Fonction de chiffrement
 * @param secretKey
 * @param publicKey
 * @returns {string}
 */
function encrypt(secretKey , publicKey){
    return crypto.createHmac('sha256', secretKey)
        .update(publicKey)
        .digest('hex');
}
