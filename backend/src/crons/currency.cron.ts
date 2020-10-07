import axios from "axios";
import config from "../config/config";

export class CurrencyCron {
  config = config;

  getCurrenciesExchangeRates = async () => {
    try {
      return await axios.get(
        "https://api.exchangeratesapi.io/latest?base=PLN&symbols=USD,EUR"
      );
    } catch (error) {
      return Promise.reject(error);
    }
  };

  setCurrenciesExchangeRates = async () => {
    const currenciesExchangeRates = await this.getCurrenciesExchangeRates();
    const transformExchangeRateSyncDate = Object.entries(
      currenciesExchangeRates.data.rates
    ).map(([name, exchangeRate]) => ({
      name,
      exchangeRate,
      exchangeRateSyncDate: currenciesExchangeRates.data.date
    }));

    try {
      return await axios.patch(
        `http://${this.config.host}:${this.config.port}/api/currency`,
        transformExchangeRateSyncDate,
        {
          auth: {
            username: `${this.config.admin.login}`,
            password: `${this.config.admin.password}`
          }
        }
      );
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
