let eventListing = null;
let city = null;
let month = null;

let Month = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12",
};

/**
 * Gets month from date with string type.
 * @param {string} date - date with format: "day.month.year".
 */
const getMonthFromDate = (date) => {
    return date.split('.')[1];
};

/**
 * Gets day from date with string type.
 * @param {string} date - date with format: "day.month.year".
 */
const getDayFromDate = (date) => {
    return date.split('.')[0];
};

/**
 * Returns Promise and gets data with GET request.
 * @param {string} url - url to send GET request.
 */
const httpGet = (url) => {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                const error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function () {
            reject({error: 'Network Error'});
        };
        xhr.send();
    });
};

/**
 * Returns html markup for a select option with custom text.
 * @param {string} text- option text.
 */
const getSelectOption = (text) => {
    return `<option class="select__option">${text}</option>`;
};

/**
 * Returns DOM select element which is city filter.
 */
const getCitiesSelector = () => {
    return document.querySelector(".section__filter .filter__item-city .select");
};

/**
 * Sets inner html markup for city selector, adds options according received data/
 * @param {object[]} eventListing - data from GET request with a list of events.
 */
const setCitiesSelector = (eventListing) => {
    const citySelector = getCitiesSelector();
    const cityList = eventListing.map(event => event.city ? event.city : null)
        .filter(city => city)
        .sort();
    [...new Set(cityList)].forEach(city => {
        citySelector.innerHTML = citySelector.innerHTML + getSelectOption(city);
    })
};

/**
 * Returns custom markup for an event card according to card object.
 * @param {object} cardData - object which contains data for an event card.
 */
const getCard = (cardData) => {
    return `<div class="cards__item card">
                <div class="card__background" style="--background-image-url: url('${cardData.image}');">
                    <div class="card__background-filter"></div>
                </div>
                <div class="card__content-container">
                    <div class="card__content">
                        <div class="card__content-header">
                            <div class="card__content-date">${getDayFromDate(cardData.date)}</div>
                            <div class="card__content-svg">
                                <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 19L8 14L1 19V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H13C13.5304 1 14.0391 1.21071 14.4142 1.58579C14.7893 1.96086 15 2.46957 15 3V19Z" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <div class="card__content-footer">
                            <div class="card__content-title">${cardData.name}</div>
                        </div>
                    </div>
                </div>
            </div>`
};

/**
 * Fills card section with cards suits filters.
 * @param {object[]} _cards - data from GET request with a list of events.
 * @param {string} city - city selected as a filter.
 * @param {string} month - month selected as a filter.
 */
const setCards = (_cards, city, month) => {
    const monthNumber = Month[month];
    let cards = _cards;
    if (month && month !== "All") {
        cards = cards.filter(card => getMonthFromDate(card.date) === monthNumber);
    }
    if (city && city !== "All") {
        cards = cards.filter(card => card.city === city);
    }
    const cardsElement = document.querySelector(".section .section__cards");
    cardsElement.innerHTML = "";
    cards.forEach(card => {
        cardsElement.innerHTML = cardsElement.innerHTML + getCard(card);
    });
    setBookmarkToggleEvent();
};

/**
 * Sets city selector and card section markup.
 * @param {object[]} eventListing - data from GET request with a list of events.
 * @param {string} [city] - city selected as a filter.
 * @param {string} [month] - month selected as a filter.
 */
const setEventListingSection = (eventListing, city, month) => {
    setCitiesSelector(eventListing);
    setCards(eventListing, city, month);
};

/**
 * Parses received data and sets all filters, events and markup
 * Sets city selector and card section markup.
 */
const getEventListingData = () => {
    httpGet("data/events.json").then(
        response => {
            return JSON.parse(response.toString());
        },
        error => {
            return error;
        }
    ).then(
        response => {
            if (!response.code) {
                eventListing = response;
                setEventListingSection(eventListing);
                setCitySelectorEvents(eventListing);
                setCitySelectorEvents(eventListing);
                setMonthSelectorEvents(eventListing);
            } else {
                const errorText = response.code ? response.code : 'no server answer';
                alert(`Rejected: ${errorText}`);
                eventListing = null;
            }
        }
    )
};

/**
 * Adds or removes class for a DOM element.
 * @param {element} element - DOM node.
 * @param {string} className - some class name.
 */
const toggleClass = (element, className) => {
    const classList = element.classList;
    if (classList.contains(className)) {
        classList.remove(className);
    } else {
        classList.add(className);
    }
};

/**
 * Sets bookmark button click event.
 */
const setBookmarkToggleEvent = () => {
    const bookmarks = document.getElementsByClassName("card__content-svg");
    for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        bookmark.onclick = function () {
            toggleClass(bookmark, "card__content-svg_toggled");
        }
    }
};

/**
 * Sets city filter change event.
 * @param {object[]} eventListing - data from GET request with a list of events.
 */
const setCitySelectorEvents = (eventListing) => {
    const selectors = document.querySelectorAll(".filter__item-city .filter__item-label .filter__item-select");
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        const select = selector.children[0];
        select.onchange = function (e) {
            city = e.target.value;
            setCards(eventListing, city, month);
        };
    }
};

/**
 * Sets month filter change event.
 * @param {object[]} eventListing - data from GET request with a list of events.
 */
const setMonthSelectorEvents = (eventListing) => {
    const selectors = document.querySelectorAll(".filter__item-month .filter__item-label .filter__item-select");
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        const select = selector.children[0];
        select.onchange = function (e) {
            month = e.target.value;
            setCards(eventListing, city, month);
        };
    }
};

getEventListingData();