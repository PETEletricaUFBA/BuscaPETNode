'use strict';

let search = document.getElementById('search');
let submit = document.getElementById('searchButton');
let output = document.getElementById('output');

let checkboxText = document.getElementById('checkText');
let checkboxNameGDT = document.getElementById('checkNameGDT');
let checkboxWho = document.getElementById('checkWho');
let checkboxWhere = document.getElementById('checkWhere');
let checkboxWhen = document.getElementById('checkWhen');
let checkboxType = document.getElementById('checkType');
let checkboxStatus = document.getElementById('checkStatus');
let checkboxEmail = document.getElementById('checkEmail');
let checkboxNameAuthor = document.getElementById('checkNameAuthor');
let checkboxNameEvent = document.getElementById('checkNameEvent');
let checkboxTitleEvent = document.getElementById('checkTitleEvent');
let checkboxYear = document.getElementById('checkYear');
let checkboxMonth = document.getElementById('checkMonth');

function searchButton() {
    if (checkboxText.checked ||
        checkboxNameGDT.checked ||
        checkboxWho.checked ||
        checkboxWhere.checked ||
        checkboxWhen.checked ||
        checkboxType.checked ||
        checkboxStatus.checked ||
        checkboxEmail.checked ||
        checkboxNameAuthor.checked ||
        checkboxNameEvent.checked ||
        checkboxTitleEvent.checked ||
        checkboxYear.checked ||
        checkboxMonth.checked) {
    try {
        while (output.hasChildNodes()) {
            output.removeChild(output.firstChild);
        };
        output.innerHTML = ` <tr>
            <th>Texto</th>
            <th>Nome do GDT</th>
            <th>Quem</th>
            <th>Onde</th>
            <th>Quando</th>
            <th>Tipo Deliberação</th>
            <th>Deliberação Final</th>
            <th>Responsáveis</th>
            <th>Autores</th>
            <th>Evento</th>
            <th>Título do Evento</th>
            <th>Ano</th>
            <th>Mês</th>
        </tr> `;
        var xhr = new XMLHttpRequest;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                output.insertAdjacentHTML("beforeend", this.responseText);
            }
        };

        let urlGet = `/search?text=${search.value}&textCheck=${checkboxText.checked}&nameGDT=${checkboxNameGDT.checked}&who=${checkboxWho.checked}&where=${checkboxWhere.checked}&when=${checkboxWhen.checked}&type=${checkboxType.checked}&status=${checkboxStatus.checked}&email=${checkboxEmail.checked}&nameAuthor=${checkboxNameAuthor.checked}&nameEvent=${checkboxNameEvent.checked}&titleEvent=${checkboxTitleEvent.checked}&year=${checkboxYear.checked}&month=${checkboxMonth.checked}`;
        xhr.open('GET', urlGet, true);
        xhr.send();
    }
    catch (err) {
        console.log(err);
    }} else {
        alert('Selecione pelo menos um campo para pesquisa');
    }
};