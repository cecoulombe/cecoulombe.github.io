import './App.css';
import React, { useState, useEffect } from 'react';
import {getExchangeRates} from './currencyApi';
import strings from './strings.js';

function App() {
  // currency state
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const storedCurrency = localStorage.getItem('chosenCurrency') || ('CAD');
    console.log('Loaded currency choice from localStorage: ', storedCurrency);
    return storedCurrency;
  });

  // exchange rates
  const [exchangeRates, setExchangeRates] = useState({});

  // states specifically for assets and liabilities
  const [assets, setAssets] = useState(() => {
    const storedAssets = JSON.parse(localStorage.getItem('assets')) || [{label: '', amount: 0}];
    console.log('Loaded assets from localStorage: ', storedAssets);
    return storedAssets;
  })
  const [liabilities, setLiabilities] = useState(() => {
    const storedLiabilities = JSON.parse(localStorage.getItem('liabilities')) || [{label: '', amount: 0}];
    console.log('Loaded liabilities from localStorage: ', storedLiabilities);
    return storedLiabilities;
  })

  // save data to localStorage whenever anything changes
  useEffect(() => {
    console.log('Saving assets to localStorage: ', assets);
    localStorage.setItem('assets', JSON.stringify(assets));

    console.log('Saving liabilities to localStorage: ', liabilities);
    localStorage.setItem('liabilities', JSON.stringify(liabilities));

    console.log('Saving currency choice to localStorage: ', selectedCurrency);
    localStorage.setItem('chosenCurrency', selectedCurrency);
  }, [assets, liabilities, selectedCurrency]); // dependency array - this useEffect will run whenever any of the values in the array are changed

  // load exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      console.log("!!!!! The currency being sent to the API is: ", selectedCurrency);
      const rates = await getExchangeRates(selectedCurrency);
      if(rates)
      {
        setExchangeRates(rates);
      }
    };

    fetchExchangeRates();
  }, [selectedCurrency]); // dependency array - this useEffect will run whenever any of the values in the array are changed

  const updateAmounts = (amounts, rate) => {
    return amounts.map((amount) => {
        const parsedAmount = parseFloat(amount); // Parse as float
        return (parsedAmount * rate).toFixed(2); // Calculate and format to 2 decimal places
    });
  };

  const handleCurrencyChange = (e) => {
    const targetCurrency = e.target.value;
    setSelectedCurrency(targetCurrency);

    if (exchangeRates[targetCurrency]) {
        const rate = exchangeRates[targetCurrency];
        
        // Update assets
        const updatedAssets = updateAmounts(assets.map(asset => asset.amount), rate);
        setAssets(prevAssets => prevAssets.map((asset, index) => ({
            ...asset,
            amount: parseFloat(updatedAssets[index]), // Ensure it's a number
        })));

        // Update liabilities
        const updatedLiabilities = updateAmounts(liabilities.map(liability => liability.amount), rate);
        setLiabilities(prevLiabilities => prevLiabilities.map((liability, index) => ({
            ...liability,
            amount: parseFloat(updatedLiabilities[index]), // Ensure it's a number
        })));
    } else {
        console.log("Exchange rates not available for target currency");
    }
  };

  // assets management
  const addAsset = () => {
    setAssets([...assets, {label: '', amount: 0}]);
  };

  const handleAssetChange = (index, field, value) => {
    const updatedAssets = [...assets];

    if (field === 'amount') {
        // Check for valid number input
        if (value === "" || /^[0-9]*(\.[0-9]{0,2})?$/.test(value)) {
            const parsedValue = parseFloat(value);
            updatedAssets[index][field] = isNaN(parsedValue) ? 0 : parseFloat(parsedValue.toFixed(2));
        }
    } else {
        updatedAssets[index][field] = value;
    }

    setAssets(updatedAssets);
  };

  // liability management
  const addLiability = () => {
    setLiabilities([...liabilities, {label: '', amount: 0}]);
  };

  const handleLiabilityChange = (index, field, value) => {
    const updatedLiabilities = [...liabilities];

    if (field === 'amount') {
        // Check for valid number input
        if (value === "" || /^[0-9]*(\.[0-9]{0,2})?$/.test(value)) {
            const parsedValue = parseFloat(value);
            updatedLiabilities[index][field] = isNaN(parsedValue) ? 0 : parseFloat(parsedValue.toFixed(2));
        }
    } else {
        updatedLiabilities[index][field] = value;
    }

    setLiabilities(updatedLiabilities); 
  };  

  // currency symbols
  const currencySymbolOptions = {
    CAD: 'C$',
    USD: '$',
    EUR: '€',
    TRY: '₺',
  };
  const currencySymbol = currencySymbolOptions[selectedCurrency];

  // calculate the sum
  const sumAssets = assets.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const sumLiabilities = liabilities.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const netWorth = (isNaN(sumAssets) ? 0 : sumAssets) - (isNaN(sumLiabilities) ? 0 : sumLiabilities);

  console.log("Assets are: ", sumAssets);
  console.log("Liabilities are: ", sumLiabilities);
  console.log("Net worth is: ", netWorth);

  return (
    <div>
      <h1>{strings.pageTitle}</h1>

      {/* Currency drop down */}
      <div className="topRight">
        <label htmlFor="currency">{strings.currencyLabel}</label>
        <select
          name="currency"
          id="currency"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
        >
          <option value="CAD">{strings.cad}</option>
          <option value="USD">{strings.usd}</option>
          <option value="EUR">{strings.eur}</option>
          <option value="TRY">{strings.try}</option>
        </select>
      </div>

      {/* Tables for Assets and Liabilities */}
      <table>
        <tbody>
          <tr>
            <td>
              <form id = "assetForm">
                <table id = "assetTable">
                  <thead>
                    <tr>
                      <th>{strings.assetTitle}</th>
                      <th>{strings.amountTitle}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset, index) =>(
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            placeholder="Asset"
                            value={asset.label}
                            onChange={(e) => handleAssetChange(index, 'label', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={(asset.amount || '')}
                            onChange={(e) => handleAssetChange(index, 'amount', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h4>{strings.assetsSum}{currencySymbol}{sumAssets.toFixed(2)}</h4>
                <button type = "button" onClick={addAsset}>{strings.addAssetButton}</button>
              </form>
            </td>
            <td>
              <p>{strings.assetsDescription}</p>
            </td>
            <td>
              <form id = "liabilityForm">
                <table id = "liabilityTable">
                  <thead>
                    <tr>
                      <th>{strings.liabilityTitle}</th>
                      <th>{strings.amountTitle}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liabilities.map((liability, index) =>(
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            placeholder="Liability"
                            value={liability.label}
                            onChange={(e) => handleLiabilityChange(index, 'label', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={(liability.amount || '')}
                            onChange={(e) => handleLiabilityChange(index, 'amount', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h4>{strings.liabilitiesSum}-{currencySymbol}{sumLiabilities.toFixed(2)}</h4>
                <button type = "button" onClick={addLiability}>{strings.addLiabilityButton}</button>
              </form>
            </td>
            <td>
              <p>{strings.liabilitiesDescription}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Display the sum */}
      <div>
        <h2>{strings.netWorth}
          <span className={netWorth >= 0 ? 'positive' : 'negative'}>{currencySymbol}{netWorth.toFixed(2)}</span></h2>
      </div>
    </div>
  );
}

export default App;

