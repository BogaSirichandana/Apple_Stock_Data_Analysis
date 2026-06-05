# Apple Stock Data Analysis Dashboard

An interactive, high-fidelity Apple Inc. (AAPL) stock data analysis dashboard featuring key metrics, visualizations, and automated investment insights.

![Dashboard Preview](https://github.com/user-attachments/assets/018b378c-e3e7-40a7-8d98-f90fc7fa8497)

## Features

- **Interactive Visualizations** - Closing/opening price trends, trading volume, volatility ranges, and moving averages (20-day & 50-day SMA)
- **CSV Upload Support** - Upload any Yahoo Finance CSV file to analyze different datasets
- **Key Metrics Dashboard** - Average prices, trading volumes, historical highs/lows with exact dates
- **Automated Insights** - Volatility coefficients, optimal trading periods, Golden/Death Cross indicators
- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Data Table Explorer** - Searchable, filterable, paginated data table with sorting

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charting**: Chart.js
- **CSV Parsing**: PapaParse
- **Icons**: Lucide Icons
- **Fonts**: Inter, Outfit (Google Fonts)

## Quick Start

### Option 1: Open Directly
Simply open `index.html` in your browser - no build step required!

### Option 2: Local Development Server
```bash
# Clone the repository
git clone https://github.com/BogaSirichandana/Apple_Stock_Data_Analysis.git
cd Apple_Stock_Data_Analysis

# Install dependencies (optional, for local server)
npm install

# Start local server
npm start
# or
npx serve -s . -l 3000
```

Then open http://localhost:3000 in your browser.

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BogaSirichandana/Apple_Stock_Data_Analysis)

Or manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Render

1. Connect your GitHub repository to Render
2. Select "Static Site" as the service type
3. Set build command to: (leave empty)
4. Set publish directory to: `.`
5. Click "Create Static Site"

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/BogaSirichandana/Apple_Stock_Data_Analysis)

### Deploy to GitHub Pages

1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/ (root)` folder
4. Click Save

## Project Structure

```
Apple_Stock_Data_Analysis/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet with dark/light themes
├── app.js              # JavaScript application logic
├── AAPL.csv            # Apple stock historical data (1980-2022)
├── package.json        # Node.js configuration
├── vercel.json         # Vercel deployment configuration
├── .gitignore          # Git ignore rules
├── .env.example        # Environment variables template
├── robots.txt          # Search engine directives
├── sitemap.xml         # XML sitemap for SEO
├── README.md           # This file
└── Apple Stock Data Analysis.ipynb  # Jupyter notebook analysis
```

## CSV Data Format

The dashboard expects CSV files with the following columns (Yahoo Finance format):

| Column | Description |
|--------|-------------|
| Date | Trading date (YYYY-MM-DD) |
| Open | Opening price |
| High | Highest price of the day |
| Low | Lowest price of the day |
| Close | Closing price |
| Adj Close | Adjusted closing price |
| Volume | Trading volume |

## Dashboard Sections

### 1. Home
Landing page with hero section and feature overview.

### 2. Dashboard
- **Key Metrics Cards**: Total trading days, average open/close prices, highest/lowest prices, average volume
- **Date Filters**: Preset filters (1M, 6M, 1Y, 5Y, All) and custom date range
- **Charts**:
  - Closing Price Trend (Line)
  - Opening Price Trend (Line)
  - High vs Low Comparison (Line)
  - Trading Volume (Bar)
  - Moving Averages - SMA 20 & 50 (Line)

### 3. Dataset
- Searchable data table
- Filter by year/month
- Sortable columns
- Pagination controls
- Export functionality

### 4. Insights
- Volatility analysis
- Trading patterns
- Golden/Death Cross detection
- Investment recommendations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lighthouse Score: 90+ (Performance, Accessibility, Best Practices, SEO)
- No build step required
- CDN-hosted dependencies
- Optimized CSS with CSS variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Siri Chandana Boga**
- GitHub: [@BogaSirichandana](https://github.com/BogaSirichandana)

- live demo link:
- https://apple-stock-data-analysis-8.onrender.com

## Acknowledgments

- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Yahoo Finance](https://finance.yahoo.com/) - Stock data source
