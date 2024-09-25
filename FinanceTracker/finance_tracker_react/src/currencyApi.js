const getExchangeRates = async (currency) => {
    const apiKey = "26716265cb570afd57f0af33";
    // const apiURL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`;
    const apiURL = `https://v6.exchangerate-api.com/v6/26716265cb570afd57f0af33/latest/${currency}`;

    try {
        const response = await fetch(apiURL);
        console.log("API response: ", response);

        if(!response.ok)
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.conversion_rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        return {};
    }
};

export {getExchangeRates};

