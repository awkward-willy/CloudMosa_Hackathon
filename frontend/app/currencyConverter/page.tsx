"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number>(1);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [lastChanged, setLastChanged] = useState<"from" | "to">("from");

  const popularCurrencies = [
    "USD","EUR","GBP","CNY","JPY","INR","PKR","BDT","LKR","NPR","IDR","MYR","THB","VND","PHP","KHR","LAK","MMK",
    "BRL","ARS","CLP","COP","PEN","UYU","BOB","PYG","VES","MXN","GTQ","HNL","NIO","CRC","DOP","JMD","TTD",
    "ZAR","NGN","EGP","MAD","TND","KES","UGX","TZS","RWF","ETB","GHS","XOF","XAF",
    "TRY","IRR","ILS","JOD","LBP","SYP","IQD","KZT","UZS","KGS","TJS","TMT","AFN",
    "RUB","UAH","BYN","MDL","GEL","AMD","AZN","KRW","TWD","HKD","SGD","MNT",
    "AUD","CAD","CHF","SEK","NOK","DKK","NZD"
  ];

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("https://api.frankfurter.app/currencies");
        const data = await response.json();
        setCurrencies(Object.keys(data).sort());
      } catch {
        setCurrencies(popularCurrencies);
      }
    };
    fetchCurrencies();
  }, []);

  const convertCurrency = async () => {
    if (fromCurrency === toCurrency) {
      if (lastChanged === "from") setConvertedAmount(amount);
      else setAmount(convertedAmount);
      setExchangeRate(1);
      return;
    }

    const queryAmount = lastChanged === "from" ? amount : convertedAmount;

    if (queryAmount === undefined || queryAmount < 0) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=${queryAmount}&from=${
          lastChanged === "from" ? fromCurrency : toCurrency
        }&to=${lastChanged === "from" ? toCurrency : fromCurrency}`
      );
      const data = await response.json();
      if (lastChanged === "from") {
        setConvertedAmount(data.rates[toCurrency]);
        setExchangeRate(data.rates[toCurrency] / amount);
      } else {
        setAmount(data.rates[fromCurrency]);
        setExchangeRate(data.rates[fromCurrency] / (convertedAmount ?? 1));
      }
      setLastUpdated(data.date);
    } catch (error) {
      console.error("Error converting currency:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => convertCurrency(), 300);
    return () => clearTimeout(timer);
  }, [amount, convertedAmount, fromCurrency, toCurrency, lastChanged]);

  return (
    <main className="flex flex-1 flex-col justify-start w-full space-y-6">
      {/* Header */}
      <p className="text-sm mb-2 text-left">
        {lastChanged === "from" ? amount : convertedAmount?.toFixed(4)}{" "}
        {lastChanged === "from" ? fromCurrency : toCurrency} equals
      </p>
      <h2 className="text-3xl font-bold mb-2 text-left">
        {loading ? (
          <span className="text-gray-300">Loading...</span>
        ) : lastChanged === "from" ? (
          `${convertedAmount?.toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 5,
          })} ${toCurrency}`
        ) : (
          `${amount.toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 5,
          })} ${fromCurrency}`
        )}
      </h2>

      {/* Exchange Rate Display */}
      {exchangeRate && !loading && (
        <div className="text-left text-sm text-gray-600 pt-2 border-t border-gray-100">
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated} <br/> Source: Frankfurter
            </p>
          )}
        </div>
      )}

      {/* Input Controls */}
      <div className="p-4 space-y-4 w-full max-w-md">
        {/* From */}
        <div className="flex w-full min-w-0">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(Math.max(0, parseFloat(e.target.value) || 0));
              setLastChanged("from");
            }}
            className="mx-1 flex-1 min-w-0 p-3 border border-gray-300 rounded-l-md border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="1"
            min="0"
            step="0.01"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-20 p-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <br/>
        {/* To */}
        <div className="flex w-full min-w-0">
          <input
            type="number"
            value={convertedAmount}
            onChange={(e) => {
              setConvertedAmount(parseFloat(e.target.value) || 0);
              setLastChanged("to");
            }}
            className="flex-1 min-w-0 p-3 border border-gray-300 rounded-l-md border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-20 p-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </main>
  );
}