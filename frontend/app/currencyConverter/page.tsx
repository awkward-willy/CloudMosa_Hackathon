"use client";

import { useState, useEffect, useRef, useCallback } from "react";


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

  // Focus management: 0=amount input,1=from select,2=converted input,3=to select
  const focusables = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [selectMode, setSelectMode] = useState<boolean>(false); // when true and focus on a select, arrow up/down cycles options locally

  // Attach refs convenience
  const setFocusable = (el: HTMLInputElement | HTMLSelectElement | null, idx: number) => {
    focusables.current[idx] = el;
  };

  useEffect(() => {
    focusables.current[focusIndex]?.focus();
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      const active = focusables.current[focusIndex];
      if (!active) return;

      // If we are inside our page region, intercept arrow keys
      const isSelect = active.tagName === "SELECT";

      // Selection mode for cycling through select options without opening native dropdown
      if (selectMode && isSelect) {
        if (key === "ArrowUp" || key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          const opts = currencies;
          const currentValue = (active as HTMLSelectElement).value;
          const idx = opts.indexOf(currentValue);
          if (idx !== -1) {
            let nextIdx = key === "ArrowUp" ? idx - 1 : idx + 1;
            if (nextIdx < 0) nextIdx = opts.length - 1; // wrap
            if (nextIdx >= opts.length) nextIdx = 0; // wrap
            const nextValue = opts[nextIdx];
            if (focusIndex === 1) {
              setFromCurrency(nextValue);
              setLastChanged("from");
            } else if (focusIndex === 3) {
              setToCurrency(nextValue);
              setLastChanged("to");
            }
          }
          return;
        }
        if (key === "Enter" || key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setSelectMode(false);
          return;
        }
      }

      switch (key) {
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          // move left within row: input<->select pairs (0 <->1) and (2<->3)
          if (focusIndex === 1) setFocusIndex(0);
          else if (focusIndex === 3) setFocusIndex(2);
          break;
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          if (focusIndex === 0) setFocusIndex(1);
          else if (focusIndex === 2) setFocusIndex(3);
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          // move between top row (0,1) and bottom row (2,3)
          if (focusIndex === 2) setFocusIndex(0);
          else if (focusIndex === 3) setFocusIndex(1);
          break;
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          if (focusIndex === 0) setFocusIndex(2);
          else if (focusIndex === 1) setFocusIndex(3);
          break;
        case "Enter":
          if (isSelect) {
            e.preventDefault();
            e.stopPropagation();
            // toggle select cycling mode
            setSelectMode((m) => !m);
          }
          break;
        default:
          break;
      }
    },
    [focusIndex, selectMode, currencies, setFromCurrency, setToCurrency]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("https://api.frankfurter.app/currencies");
        const data = await response.json();
        setCurrencies(Object.keys(data).sort());
      } catch {
        setCurrencies([]);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
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
          `https://api.frankfurter.app/latest?amount=${queryAmount}&from=${lastChanged === "from" ? fromCurrency : toCurrency
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

  const focusCls = (idx: number) =>
    focusIndex === idx
      ? "outline outline-2 outline-blue-500 outline-offset-0 z-10"
      : "outline-none";
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
              Last updated: {lastUpdated} <br /> Source: Frankfurter
            </p>
          )}
        </div>
      )}

      {/* Input Controls */}
      <div className="p-4 space-y-4 w-full max-w-md" aria-label="Currency Converter Inputs">
        {/* From */}
        <div className="flex w-full min-w-0">
          <input
            ref={(el) => setFocusable(el, 0)}
            type="number"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
              setLastChanged('from');
            }}
            className={`mx-1 flex-1 min-w-0 p-3 border border-gray-300 rounded-l-md border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${focusCls(0)}`}
            placeholder="1"
            min="0"
            step="0.01"
          />
          <select
            ref={(el) => setFocusable(el, 1)}
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className={`w-20 p-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm ${focusCls(1)}`}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <br />
        {/* To */}
        <div className="flex w-full min-w-0">
          <input
            ref={(el) => setFocusable(el, 2)}
            type="number"
            value={convertedAmount}
            onChange={(e) => {
              const val = e.target.value;
              setConvertedAmount(val === '' ? 0 : parseFloat(val) || 0);
              setLastChanged('to');
            }}
            className={`flex-1 min-w-0 p-3 border border-gray-300 rounded-l-md border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${focusCls(2)}`}
          />
          <select
            ref={(el) => setFocusable(el, 3)}
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className={`w-20 p-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm ${focusCls(3)}`}
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
        {selectMode && <p className="text-xs text-blue-600">Select mode: use ↑/↓ to cycle, Enter/Esc to exit.</p>}
      </div>
    </main>
  );
}