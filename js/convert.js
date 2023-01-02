import state from "./state.js";
import variables from "./variables.js";
import {renderResult} from "./markups.js";
import {convertTime, formatToCurrency, getFullTitle} from "./utils.js";

const {success, formResults, rateConversion, rateLast, toSelect, fromSelect} = variables;

export const handleChange = ({target: {value, name}}) => {
    state.pair = {
        ...state.pair,
        [name]: value
    }
};

export const handleInput = ({target: {value, name}}) => {
    state[name] = Number(value);
};

const insertResult = ({
                          base_code: baseCode,
                          target_code: targetCode,
                          conversion_rate: rate,
                          conversion_result: result,
                          time_last_update_utc: utcTime
                      }) => {
    const from = {
        code: baseCode,
        amount: state.amount,
        full: getFullTitle(state.codes, baseCode),
    };

    const to = {
        code: targetCode,
        amount: result,
        full: getFullTitle(state.codes, targetCode),
    };

    resultFrom.innerHTML = renderResult(from);
    resultTo.innerHTML = renderResult(to);

    const baseValue = formatToCurrency(baseCode, 1);
    const targetValue = formatToCurrency(targetCode, rate);

    rateConversion.innerText = `${baseValue} = ${targetValue}`;
    rateLast.innerText = `Last updated ${convertTime(utcTime)}`;

    formResults.classList.add("show");
};

export async function handleSubmit(e) {
    e.preventDefault();

    const {url, amount, pair: {from, to}} = state;
    if (!amount || !from || !to) return;

    state.loading = true;

    try {
        const response = await fetch(`${url}/pair/${from}/${to}/${amount}`);
        const data = await response.json();

        if (data.result === success) insertResult(data);

        state.loading = false;
    } catch (e) {
        console.error(e);
    }
}

export const switchCurrencies = () => {
    const {pair: {to, from}} = state;

    if (!to || !from) return;

    state.pair = {
        to: from,
        from: to,
    };

    toSelect.value = from;
    fromSelect.value = to;
}
