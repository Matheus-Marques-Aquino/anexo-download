const express = require("express");
const router = express.Router();

const axios = require('axios');
const fs = require('fs');
const path = require('path');


router.get("/", async (req, res) => { 

    async function downloadAnexo(anexo){
        return new Promise(async (resolve, reject)=>{
            axios.get(anexo.url, { responseType: 'arraybuffer' })
                .then((response)=>{
                    console.log('Download OK');
                    anexo.file = response.data;
                    resolve(anexo);
                })
                .catch((error)=>{
                    console.log('Download Error');
                    anexo.tentativas = 3;
                    tryAgain(anexo);
                });
            
            let tryAgain = (anexo)=>{
                if (!/^[0-3]{1}$/.test(anexo.tentativas)){ anexo.tentativas = 3; }
                if (anexo.tentativas > 0){
                    axios.get(anexo.url, { responseType: 'arraybuffer' })
                        .then((response)=>{
                            console.log(`Download OK - ${anexo.tentativas}/3`);
                            anexo.file = response.data;
                            resolve(anexo);
                        })
                        .catch((error)=>{
                            anexo.tentativas -= 1;
                            console.log(`Download Error - ${anexo.tentativas}/3`);
                            tryAgain(anexo);
                        });
                }else{
                    console.log('Download Erro Final');
                    anexo.error = true;
                    resolve(anexo);
                }
            }
        });
    }

    async function salvarAnexo(anexo){
        return new Promise(async (resolve, reject)=>{
            let caminho = path.join(__dirname, '../downloads', anexo.name);
            
            fs.writeFile(caminho, anexo.file, (error)=>{
                if (!error){
                    console.log('Arquivo Salvo');
                    resolve(anexo);
                }else{
                    console.log('Erro ao Salvar');
                    anexo.tentativas = 3;
                    tryAgain(anexo);
                }
            });
    
            let tryAgain = (anexo)=>{
                if (!/^[0-3]{1}$/.test(anexo.tentativas)){ anexo.tentativas = 3; }
                if (anexo.tentativas > 0){
                    fs.writeFile(caminho, anexo.file, (error)=>{
                        if (!error){
                            console.log('Arquivo Salvo');
                            resolve(anexo);
                        }else{
                            console.log(`Error ao Salvar - ${anexo.tentativas}/3`);
                            anexo.tentativas -= 1;
                            console.log(error);
                            tryAgain(anexo);
                        }
                    });
                }else{
                    console.log('Salvar Erro Final');
                    anexo.error = true;
                    resolve(anexo);
                }
            }    
        });
    }

    let anexo = {url: 'http://bilhete-hml.heroseguros.com.br/pt/ticket/pdf-6-020823035957-d4a72a04-9a68-43b4-80c2-b866414072bc.pdf', name: 'HR136900396031.pdf'};

    let download = await downloadAnexo(anexo);
    console.log(download);

    let salvar = await salvarAnexo(download);
    console.log(salvar);

    res.sendFile("index.html", { root: "public" }); 
});

module.exports = router;