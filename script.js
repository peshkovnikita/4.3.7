const input = document.querySelector('.repo-input');
const suggestionsList = document.querySelector('.autocomplete-list');
const reposList = document.querySelector('.repos-list');
const warningLabel = document.querySelector('.warning-label');

async function getRepos(keyword) {
    const token = 'TOKEN';
    const apiUrl = `https://api.github.com/search/repositories?q=${keyword}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const repoData = await response.json();
            return repoData.items.slice(0, 5); //return first 5 repositories
        } else {
            console.error('Ошибка при выполнении запроса:', response.status);
        }
    }
    catch (err) {
        console.error('Uncaught Error');
    }
}

function logInput(e) {
    if(e.target.value.length === 0) {
        suggestionsList.style.display = 'none';
        warningLabel.innerText = '';
        return;
    }

    let inputData = e.target.value;

    getRepos(inputData)
        .then((repoNames) => {
            if(repoNames.length > 0) {
                suggestionsList.style.display = 'flex';
                warningLabel.innerText = '';
                fillSuggestions(repoNames);
            } else {
                throw new Error('There is no repository with this name!');
            }
        })
        .catch(error => {
            warningLabel.innerText = error.message;
        });

    //clear suggestions after every query
    clearSuggestions();
}

function debounce(func, ms) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, ms);
    };
}

input.onkeyup = debounce(logInput, 800);

function fillSuggestions(array) {
    for (let i = 0; i < array.length; i++) {
        const listItem = document.createElement('li');
        const data = {
            name: array[i].name,
            owner: array[i].owner.login,
            stars: array[i].stargazers_count,
        }

        listItem.classList.add('autocomplete__item');
        listItem.innerText = array[i].name;
        suggestionsList.appendChild(listItem);
        listItem.setAttribute('data-full-info', `${JSON.stringify(data)}`);
        listItem.setAttribute('tabindex', '0');
    }
}

function clearSuggestions() {
    while (suggestionsList.firstChild) {
        suggestionsList.removeChild(suggestionsList.firstChild);
    }
}

//create repo element and adding to repository list
suggestionsList.addEventListener('click', (e) => {
    if (e.target.className === 'autocomplete__item') {
        const fullData = JSON.parse(e.target.getAttribute('data-full-info'))

        const listItem = document.createElement('li');
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');

        listItem.classList.add('repo');
        wrapper.classList.add('repo__text-wrapper');
        btn.classList.add('btn__remove-repo');

        reposList.appendChild(listItem);
        listItem.appendChild(wrapper);
        listItem.appendChild(btn);

        for (const prop in fullData) {
            const text = document.createElement('p');
            wrapper.appendChild(text);
            text.innerText = `${prop}: ${fullData[prop]}`;
        }
    }
});

//remove repository
reposList.addEventListener('click', (e) => {
    if(e.target.className === 'btn__remove-repo') {
        e.target.parentElement.remove();
    }
});