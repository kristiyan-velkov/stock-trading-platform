# Stock Trading Platform

A real-time stock trading platform built with Next.js, featuring TradingView charts, WebSocket-based real-time price updates, and a responsive UI.

**Author**: Kristiyan Velkov

![Stock Trading Platform Screenshot](public/screenshot.png)

---

## Features

- **Real-time Stock Data**: Live price updates via WebSocket connection
- **TradingView Charts**: Professional-grade stock charts with technical indicators
- **Watchlist**: Track your favorite stocks with mini charts
- **Portfolio Overview**: View your holdings and performance
- **Multiple Timeframes**: Switch between different chart intervals
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

---

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: TradingView Charting Library, Lightweight Charts
- **Data**: Twelve Data API for stock prices and historical data
- **Real-time Updates**: WebSocket for live price updates

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn
- Twelve Data API key (get one at [twelvedata.com](https://twelvedata.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stock-trading-platform.git
   cd stock-trading-platform
   ```

2. Install dependencies:
   ```bash
   npm install

   # or

   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API key:

   ```
   NEXT_PUBLIC_TWELVE_DATA_API_KEY=your_api_key_here
   NEXT_PUBLIC_STOCK_LOGO_URL=link_to_stocks_logo_website
   ```

4. Start the development server:
   ```bash
   npm run dev

   # or

   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **View Stock Charts**: Click on a stock in the watchlist to view its chart
- **Change Timeframe**: Use the timeframe selector above the chart
- **Add Stocks to Tabs**: Click on stocks in the watchlist to add them to tabs
- **Remove Stocks from Tabs**: Click the X button on a tab to remove it
- **Toggle Dark Mode**: Use the theme toggle in your browser

## Testing

This project includes comprehensive tests for core functionalities. The tests are written using Jest and React Testing Library.

### Running Tests

To run all tests:

```bash
npm test

# or

yarn test
```

To run tests in watch mode (useful during development):

```bash
npm run test:watch

# or

yarn test:watch
```

### Test Coverage

To generate a test coverage report:

```bash
npm run test:coverage

# or

yarn test:coverage
```

This will create a coverage report in the `coverage` directory. Open `coverage/lcov-report/index.html` in your browser to view the detailed report.

### Test Reports

For CI/CD environments, you can generate test reports in various formats:

```bash
npm run test:ci

# or

yarn test:ci
```

This will generate:

- JUnit XML report in `test-results/junit.xml` (useful for CI systems like Jenkins)
- HTML report in `test-reports/report.html` (for human-readable reports)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Twelve Data](https://twelvedata.com/) for the stock market API
- [TradingView](https://www.tradingview.com/) for the charting library
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
