const express = require('express');
const path = require('path');
const app = express();
const mariadb = require('mariadb');

const DOTENV = process.env;

const port = DOTENV.PORT;

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] })); // Usa a pasta public para servir os arquivos estáticos
app.use(express.static(__dirname + '/../node_modules/bootstrap/dist'));

let config = {  // Configurações do banco de dados
    host: DOTENV.DB_HOST,
    user: DOTENV.DB_USER,
    password: DOTENV.DB_PASSWORD,
    database: DOTENV.DB_DATABASE
};

app.get('/client.js', function (req, res) { // Garante que o client.js seja carregado
    res.sendFile(path.join(__dirname, 'client.js'));
});

app.get('/:search?', async function (req, res) {// Busca os dados no banco de dados
    let searchQuery = req.query;

    let output = await asyncSearch(searchQuery);


    res.send(output);   // Envia os dados para o client.js
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

async function asyncSearch(searchQuery) {

    let auxRes = "";

    try {

        // Trata a string para ajeitar a busca
        // searchString = searchQuery.text.trim().normalize('NFD').replace(/(<([^>]+)>)/gi, "");
        searchString = searchQuery.text.trim();

        // searchString = searchQuery.text.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, ' ');

        let searchTerms = [];
        searchTerms.push(searchString);

        searchString.split(" ").forEach(term => {
            term = term.replace(/[^a-z0-9]/gi, '');

            if (term.length > 2) { // Filtra palavras com menos de 3 caracteres
                searchTerms.push(term);
            }
        });


        let results = [];
        for (let i = 0; i < searchTerms.length; i++) {

            results = await queryToTable(results, searchTerms[i], searchQuery);
        };

        for (let j = 0; j < results.length; j++) {
            auxRes += results[j];
        };
        return auxRes;

    } catch (err) {
        console.log(err);
        return err;
    }
};

async function queryToTable(data, searchTerm, filters) {
    try {

        // Cria conexão com o banco de dados
        conn = await mariadb.createConnection(config);

        let term = conn.escape("%" + searchTerm + "%"); // Escapa o termo para proteger de SQL Injection

        let queryTerm = await searchTermQuery(term, filters);

        let rows = await conn.query(queryTerm);

        conn.end();

        // Converte os dados para TableHTML
        for (let i = 0; i < rows.length; i++) {
            let aux = '<div class="container-fluid border border-primary rounded"> \n';
            aux += '<div class="row "> \n';
            aux += '<div class="col-md-auto border py-2 text-center">' + rows[i].Key + '</div> \n';
            aux += '<div class="col-7 border py-2 text-center">' + rows[i].NomeEvento + '-' + rows[i].TituloEvento + '</div> \n';
            aux += '<div class="col border py-2 text-center">' + rows[i].NomeGDT + '</div> \n';
            aux += '<div class="col-md-auto border py-2 text-center">' + rows[i].Ano + '</div> \n';
            aux += '<div class="col-md-auto border py-2 text-center">' + rows[i].Mes + '</div> \n';
            aux += '</div> \n';
            aux += '<div class="row"> \n';
            aux += '<div class="col-md-auto border py-2 text-center">' + rows[i].TipoDeliberacao + '</div> \n';
            aux += '<div class="col-md-auto border py-2 text-center">' + rows[i].DeliberacaoFinal + '</div> \n';
            aux += '<div class="col border py-2 text-center">' + rows[i].Quem + '</div> \n';
            aux += '<div class="col border py-2 text-center">' + rows[i].Onde + '</div> \n';
            aux += '<div class="col border py-2 text-center">' + rows[i].Quando + '</div> \n';
            aux += "</div> \n";
            aux += '<div class="row"> \n';
            aux += '<div class="col py-2">' + rows[i].Texto + '</div> \n';
            aux += "</div> \n";
            aux += '<div class="row"> \n';
            aux += '<div class="col-8 border py-2 text-center">' + rows[i].EmailResponsaveis + '</div> \n';
            aux += '<div class="col border py-2">' + rows[i].NomeAutores.replace(/,/g, "<br>") + '</div> \n';
            aux += "</div> \n";
            aux += '</div> \n';

            if (data.includes(aux) == false) {
                data.push(aux);
            }
        };

        return data;
    } catch (error) {
        console.log(error);
        reject(error);
    }
};

function searchTermQuery(searchTerm, filters) { // Monta a query para buscar o termo

    let query = "SELECT * FROM trabalhospet WHERE ";

    query += (filters.key == 'true') ? "`Key` LIKE " + searchTerm + " OR " : "";
    query += (filters.textCheck == 'true') ? "Texto LIKE " + searchTerm + " OR " : "";
    query += (filters.nameGDT == 'true') ? "NomeGDT LIKE " + searchTerm + " OR " : "";
    query += (filters.who == 'true') ? "Quem LIKE " + searchTerm + " OR " : "";
    query += (filters.where == 'true') ? "Onde LIKE " + searchTerm + " OR " : "";
    query += (filters.when == 'true') ? "Quando LIKE " + searchTerm + " OR " : "";
    query += (filters.type == 'true') ? "TipoDeliberacao LIKE " + searchTerm + " OR " : "";
    query += (filters.status == 'true') ? "DeliberacaoFinal LIKE " + searchTerm + " OR " : "";
    query += (filters.email == 'true') ? "EmailResponsaveis LIKE " + searchTerm + " OR " : "";
    query += (filters.nameAuthor == 'true') ? "NomeAutores LIKE " + searchTerm + " OR " : "";
    query += (filters.nameEvent == 'true') ? "NomeEvento LIKE " + searchTerm + " OR " : "";
    query += (filters.titleEvent == 'true') ? "TituloEvento LIKE " + searchTerm + " OR " : "";
    query += (filters.year == 'true') ? "Ano LIKE " + searchTerm + " OR " : "";
    query += (filters.month == 'true') ? "Mes LIKE " + searchTerm + " OR " : ""; 

    query = query.substring(0, query.length - 3); // Remove o ultimo OR

    return query;
};