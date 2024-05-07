const input = document.querySelector('.repo-input');
const suggestionsList = document.querySelector('.autocomplete-list');
const reposList = document.querySelector('.repos-list');
const warningLabel = document.querySelector('.warning-label');

//get repositories from GitHub
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

//log input data in search field
async function logInput(e) {
    if(e.target.value.length === 0) {
        suggestionsList.style.display = 'none';
        warningLabel.innerText = '';
        return;
    }

    const inputData = e.target.value;

    // getRepos(inputData)
    //     .then((repoNames) => {
    //         if(repoNames.length > 0) {
    //             suggestionsList.style.display = 'flex';
    //             warningLabel.innerText = '';
    //             fillSuggestions(repoNames);
    //         } else {
    //             throw new Error('There is no repository with this name!');
    //         }
    //     })
    //     .catch(error => {
    //         warningLabel.innerText = error.message;
    //     });
    try {
        const repoNames = await getRepos(inputData);
        if(repoNames.length > 0) {
            suggestionsList.style.display = 'flex';
            warningLabel.innerText = '';
            fillSuggestions(repoNames);
        } else {
            throw new Error('There is no repository with this name!');
        }
    }
    catch (error) {
        warningLabel.innerText = error.message;
    }

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
    console.log(array)
    for (let i = 0; i < array.length; i++) {
        const data = {
            name: array[i].name,
            owner: array[i].owner.login,
            stars: array[i].stargazers_count,
        }

        suggestionsList.insertAdjacentHTML('beforeend',
            `<li class="autocomplete__item" data-full-info=${JSON.stringify(data)} tabindex="0">
                ${data.name}
            </li>`
        );
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

        reposList.insertAdjacentHTML('beforeend',
            `<li class="repo">
                <div class="repo__text-wrapper">
                    <p>Name: ${fullData.name}</p>
                    <p>Owner: ${fullData.owner}</p>
                    <p>Stars: ${fullData.stars}</p>
                </div> 
                <button type="button" class="btn__remove-repo"></button>
            </li>`
        );
    }
});

//remove repository from list
reposList.addEventListener('click', (e) => {
    if(e.target.className === 'btn__remove-repo') {
        e.target.parentElement.remove();
    }
});