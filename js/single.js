import state from "./state.js";
import variables from "./variables.js";
import {renderCurrencyItem} from "./markups.js";

const {success, currentCurrency, currentCurrencyList} = variables;

const insertCurrency = (data) => {
    return currentCurrencyList.insertAdjacentHTML(
        "afterbegin",
        renderCurrencyItem(data)
    );
};

const insertCurrencies = () => {
    const {currency, currencies} = state;
    const {conversion_rates: rates, base_code: baseCode} = currency;

    currentCurrency.innerHTML = renderCurrencyItem(currency);
    currentCurrencyList.innerHTML = "";

    Object.entries(rates).forEach(([code, rate]) => {
        if (code === baseCode || !currencies.includes(code)) return;
        insertCurrency({...currency, code, rate});
    });
};

export const fetchLatest = async () => {
    const {url, currency: {code}} = state;

    if (!code) return;

    try {
        const response = await fetch(`${url}/latest/${code}`);
        const data = await response.json();

        if (data.result === success) {
            state.currency = {
                ...state.currency,
                ...data,
            };

            insertCurrencies();
        }
    } catch (e) {
        console.error(e);
    }
};

const removeCurrency = (target) => {
    const parent = target.parentElement.parentElement;
    const {item} = parent.dataset;

    if (!item) return;

    const element = document.querySelector(`[data-item="${item}"]`);
    element.remove();
};

const changeCurrency = () => {
    currentCurrency.parentElement.classList.add("active");
};

export const handleActionClick = ({target}) => {
    const {action} = target.dataset;

    if (!action) return;

    const {actions: {remove}} = state;

    (action === remove) ? removeCurrency(target) : changeCurrency();
};

export const handleSingleSelectChange = async ({target}) => {
    target.parentElement.classList.remove("active");
    state.currency = {...state.currency, code: target.value};
    await fetchLatest();
    target.value = "";
};

export const addCurrency = ({currentTarget}) => {
    currentTarget.parentElement.classList.add("active");
};

export const handleAddSelectChange = ({target}) => {
    const {currency: {conversion_rates: rates, base_code: baseCode}} = state;

    const currency = Object.entries(rates).find(([key]) =>
        (key === target.value) && (key !== baseCode) && (!state.currencies.includes(key)));

    if (currency) {
        state.currencies.push(currency[0]);
        const [code, amount] = currency;
        insertCurrency({...state.currency, code, rate: amount});
    }

    target.parentElement.classList.remove("active");
    target.value = "";
}
