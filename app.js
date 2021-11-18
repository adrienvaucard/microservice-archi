
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
    secret_key: "",
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
            }
        );
    }catch(e){
        console.error(e.response ? e.response.data : e)
        return
    }
    this.access_keys = response.data;
    console.log(this.access_keys)

    const registry = registryResponse = await axios.get(
        `http://${HOST_SERVER}:${PORT}/registry`, 
        {
            headers: {
                "x-auth-token": this.access_keys.token,
            }
        }
    ).catch(e => {
        res.status(500)
        res.json(e)
    });

    registry.data.forEach(async (microservice) => {
        microResponse = await axios.get(
            `${microservice.host}/getKey`, 
            {
                headers: {
                    "x-auth-token": this.access_keys.token,
                }
            }
        ).catch(e => {
            console.log("----")
            console.log(microservice.code + "'s microservice not implemented")
            console.log("GetKey Error on : " + microservice.host)
        });

        if (microResponse) {
            unlockResponse = await axios.post(
                `http://${HOST_SERVER}:${PORT}/key/unlock`, 
                {
                    code: microservice.code,
                    key: microResponse.data.encrypted_public_key
                },
                {
                    headers: {
                        "x-auth-token": this.access_keys.token,
                    }
                }
            ).catch(e => {
                console.log("Unlock Error")
            });

            if (unlockResponse) {
                console.log("----")
                console.log(unlockResponse.data)
            }
        }
    })
}

app.get('/ping', async (req, res) => {
    res.json("pong")
})

app.get('/getKey', async (req, res) => {
    if (req.headers['x-auth-token']) {
        let tokenValidationResponse = await axios.post(
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
            console.log("Error while validating token")
            res.status(502)
            res.send("L’annuaire est indisponible, impossible de vérifier le jeton")
        });

        if (tokenValidationResponse) {
            if (tokenValidationResponse.data) {
                if (tokenValidationResponse.data.valid) {
                    let encrypted_public_key = encrypt(this.access_keys.secret_key, this.access_keys.public_key)
                    res.status(200)
                    res.json({
                        "encrypted_public_key": encrypted_public_key
                    });
                } else {
                    res.status(403)
                    res.send("Authentification invalide")
                }
            } else {
                res.status(500)
                res.send("Erreur inattendue")
            }
        } else {
            res.status(403)
            res.send("Authentification invalide")
        }
    } else {
        res.status(403)
        res.send("Authentification invalide")
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
