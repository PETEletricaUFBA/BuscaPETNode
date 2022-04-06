const express = require('express');
const path = require('path');
const app = express();
const mariadb = require('mariadb');

const DOTENV = process.env;

const port = DOTENV.PORT;

app.use(express.static(path.join(__dirname, 'public'))); // Usa a pasta public para servir os arquivos estáticos

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
    // console.log(`App listening on port ${port}`);
});

function searchTermQuery(searchTerm, filters) { // Retorna a query para buscar os dados no banco de dados
    // TODO: Proteger contra SQL Injection
    // TODO: Acrescentar Indice na busca
    
    let query = "SELECT * FROM trabalhospet WHERE ";

    query += (filters.textCheck == 'true') ? "Texto LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.nameGDT == 'true') ? "NomeGDT LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.who == 'true') ? "Quem LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.where == 'true') ? "Onde LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.when == 'true') ? "Quando LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.type == 'true') ? "TipoDeliberacao LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.status == 'true') ? "DeliberacaoFinal LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.email == 'true') ? "EmailResponsaveis LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.nameAuthor == 'true') ? "NomeAutores LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.nameEvent == 'true') ? "NomeEvento LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.titleEvent == 'true') ? "TituloEvento LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.year == 'true') ? "Ano LIKE '%" + searchTerm + "%' OR " : "";
    query += (filters.month == 'true') ? "Mes LIKE '%" + searchTerm + "%' OR " : "";

    query = query.substring(0, query.length - 3); // Remove o ultimo OR

    return query;
}

async function asyncSearch(searchQuery) {

    let auxRes = "";

    try {

        // Trata a string para ajeitar a busca
        searchString = searchQuery.text.trim().normalize('NFD').replace(/(<([^>]+)>)/gi, "");

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
            let query = await searchTermQuery(searchTerms[i], searchQuery);

            results = await queryToTable(results, query);
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

async function queryToTable(data, sql) {
    try {

        // Cria conexão com o banco de dados
        conn = await mariadb.createConnection(config);

        let rows = await conn.query(sql);

        conn.end();

        // Converte os dados para TableHTML
        for (let i = 0; i < rows.length; i++) {
            let aux = "<tr> \n";
            aux += "<td>" + rows[i].Texto + "</td> \n";
            aux += "<td>" + rows[i].NomeGDT + "</td> \n";
            aux += "<td>" + rows[i].Quem + "</td> \n";
            aux += "<td>" + rows[i].Onde + "</td> \n";
            aux += "<td>" + rows[i].Quando + "</td> \n";
            aux += "<td>" + rows[i].TipoDeliberacao + "</td> \n";
            aux += "<td>" + rows[i].DeliberacaoFinal + "</td> \n";
            aux += "<td>" + rows[i].EmailResponsaveis + "</td> \n";
            aux += "<td>" + rows[i].NomeAutores + "</td> \n";
            aux += "<td>" + rows[i].NomeEvento + "</td> \n";
            aux += "<td>" + rows[i].TituloEvento + "</td> \n";
            aux += "<td>" + rows[i].Ano + "</td> \n";
            aux += "<td>" + rows[i].Mes + "</td> \n";
            aux += "</tr> \n";
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