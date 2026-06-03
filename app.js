// ===============================
// APP.JS PART 1 - CORE SETUP
// ===============================

let stockData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 20;

let currentSortColumn = "Date";
let currentSortDirection = "desc";

let charts = {
    closing: null,
    opening: null,
    highlow: null,
    volume: null,
    sma: null
};

document.addEventListener("DOMContentLoaded", () => {

    initializeIcons();
    initializeTheme();
    initializeUpload();

    loadDefaultCSV();

});


// ===============================
// ICONS
// ===============================

function initializeIcons() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


// ===============================
// THEME TOGGLE
// ===============================

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("dashboard-theme") || "dark";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    const themeBtn =
        document.getElementById("theme-toggle");

    if (themeBtn) {
        themeBtn.addEventListener(
            "click",
            toggleTheme
        );
    }
}

function toggleTheme() {

    const html =
        document.documentElement;

    const current =
        html.getAttribute("data-theme");

    const next =
        current === "dark"
            ? "light"
            : "dark";

    html.setAttribute("data-theme", next);

    localStorage.setItem(
        "dashboard-theme",
        next
    );
}


// ===============================
// TAB NAVIGATION
// ===============================

function switchTab(tabName) {

    document
        .querySelectorAll(".view-section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document
        .querySelectorAll(".nav-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    const section =
        document.getElementById(
            `view-${tabName}`
        );

    const nav =
        document.getElementById(
            `nav-${tabName}`
        );

    if (section) {
        section.classList.add("active");
    }

    if (nav) {
        nav.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// CSV UPLOAD
// ===============================

function initializeUpload() {

    const uploadBtn =
        document.getElementById(
            "upload-trigger"
        );

    const fileInput =
        document.getElementById(
            "csv-file-input"
        );

    if (uploadBtn && fileInput) {

        uploadBtn.addEventListener(
            "click",
            () => fileInput.click()
        );

        fileInput.addEventListener(
            "change",
            handleCSVUpload
        );
    }
}

function handleCSVUpload(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    Papa.parse(file, {

        header: true,

        dynamicTyping: true,

        skipEmptyLines: true,

        complete: function(results) {

            stockData =
                cleanData(results.data);

            filteredData =
                [...stockData];

            initializeAfterLoad();
        },

        error: function(error) {

            alert(
                "Failed to load CSV file."
            );

            console.error(error);
        }
    });
}


// ===============================
// DEFAULT CSV LOADER
// ===============================

async function loadDefaultCSV() {

    try {

        const response =
            await fetch("AAPL.csv");

        if (!response.ok) {
            throw new Error(
                "CSV not found"
            );
        }

        const csvText =
            await response.text();

        Papa.parse(csvText, {

            header: true,

            dynamicTyping: true,

            skipEmptyLines: true,

            complete: function(results) {

                stockData =
                    cleanData(results.data);

                filteredData =
                    [...stockData];

                initializeAfterLoad();
            }
        });

    } catch (error) {

        console.error(
            "Default CSV loading failed:",
            error
        );

        showTableMessage(
            "Please upload a CSV file."
        );
    }
}


// ===============================
// DATA CLEANING
// ===============================

function cleanData(data) {

    return data
        .filter(row =>
            row.Date &&
            row.Open != null &&
            row.Close != null
        )
        .map(row => ({

            Date: row.Date,

            Open: Number(row.Open),

            High: Number(row.High),

            Low: Number(row.Low),

            Close: Number(row.Close),

            "Adj Close":
                Number(
                    row["Adj Close"]
                ),

            Volume:
                Number(row.Volume)

        }))
        .sort((a, b) =>
            new Date(a.Date) -
            new Date(b.Date)
        );
}


// ===============================
// INITIALIZE AFTER LOAD
// ===============================

function initializeAfterLoad() {

    populateYearFilter();

    setDateInputs();

    updateMetrics();

    renderTable();

    renderCharts();

    generateInsights();

    updatePaginationInfo();

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


// ===============================
// DATE INPUTS
// ===============================

function setDateInputs() {

    if (!stockData.length) return;

    const start =
        document.getElementById(
            "date-start"
        );

    const end =
        document.getElementById(
            "date-end"
        );

    if (start) {
        start.value =
            stockData[0].Date;
    }

    if (end) {
        end.value =
            stockData[
                stockData.length - 1
            ].Date;
    }
}


// ===============================
// YEAR FILTER
// ===============================

function populateYearFilter() {

    const yearSelect =
        document.getElementById(
            "filter-year"
        );

    if (!yearSelect) return;

    const years =
        [...new Set(
            stockData.map(item =>
                new Date(
                    item.Date
                ).getFullYear()
            )
        )];

    years.sort((a, b) => a - b);

    years.forEach(year => {

        const option =
            document.createElement(
                "option"
            );

        option.value = year;
        option.textContent = year;

        yearSelect.appendChild(
            option
        );
    });
}


// ===============================
// TABLE MESSAGE
// ===============================

function showTableMessage(message) {

    const body =
        document.getElementById(
            "table-body"
        );

    if (!body) return;

    body.innerHTML = `
        <tr>
            <td colspan="7"
                class="text-center">
                ${message}
            </td>
        </tr>
    `;
}


// ===============================
// FORMATTERS
// ===============================

function formatCurrency(value) {

    return "$" +
        Number(value)
            .toFixed(2);
}

function formatNumber(value) {

    return Number(value)
        .toLocaleString();
}

function formatPercent(value) {

    return value.toFixed(2) + "%";
}
// ===============================
// APP.JS PART 2 - METRICS & CHARTS
// ===============================


// ===============================
// METRICS CALCULATION
// ===============================

function updateMetrics() {

    if (!filteredData.length) return;

    const totalDays = filteredData.length;

    const avgOpen =
        filteredData.reduce(
            (sum, row) => sum + row.Open,
            0
        ) / totalDays;

    const avgClose =
        filteredData.reduce(
            (sum, row) => sum + row.Close,
            0
        ) / totalDays;

    const avgVolume =
        filteredData.reduce(
            (sum, row) => sum + row.Volume,
            0
        ) / totalDays;

    const highest =
        filteredData.reduce(
            (max, row) =>
                row.High > max.High
                    ? row
                    : max
        );

    const lowest =
        filteredData.reduce(
            (min, row) =>
                row.Low < min.Low
                    ? row
                    : min
        );

    document.getElementById(
        "metric-total-days"
    ).textContent =
        formatNumber(totalDays);

    document.getElementById(
        "metric-avg-open"
    ).textContent =
        formatCurrency(avgOpen);

    document.getElementById(
        "metric-avg-close"
    ).textContent =
        formatCurrency(avgClose);

    document.getElementById(
        "metric-high-price"
    ).textContent =
        formatCurrency(highest.High);

    document.getElementById(
        "metric-high-date"
    ).textContent =
        "Date: " + highest.Date;

    document.getElementById(
        "metric-low-price"
    ).textContent =
        formatCurrency(lowest.Low);

    document.getElementById(
        "metric-low-date"
    ).textContent =
        "Date: " + lowest.Date;

    document.getElementById(
        "metric-avg-volume"
    ).textContent =
        formatNumber(
            Math.round(avgVolume)
        );
}


// ===============================
// DATE FILTER PRESETS
// ===============================

function setDateFilterPreset(type) {

    if (!stockData.length) return;

    document
        .querySelectorAll(
            ".btn-filter"
        )
        .forEach(btn =>
            btn.classList.remove(
                "active"
            )
        );

    const activeBtn =
        document.getElementById(
            `filter-btn-${type}`
        );

    if (activeBtn) {
        activeBtn.classList.add(
            "active"
        );
    }

    const latestDate =
        new Date(
            stockData[
                stockData.length - 1
            ].Date
        );

    let startDate =
        new Date(latestDate);

    switch (type) {

        case "1m":
            startDate.setMonth(
                startDate.getMonth() - 1
            );
            break;

        case "6m":
            startDate.setMonth(
                startDate.getMonth() - 6
            );
            break;

        case "1y":
            startDate.setFullYear(
                startDate.getFullYear() - 1
            );
            break;

        case "5y":
            startDate.setFullYear(
                startDate.getFullYear() - 5
            );
            break;

        case "all":

            filteredData =
                [...stockData];

            updateMetrics();
            renderCharts();
            renderTable();
            generateInsights();

            return;
    }

    filteredData =
        stockData.filter(item => {

            const d =
                new Date(item.Date);

            return (
                d >= startDate &&
                d <= latestDate
            );
        });

    updateMetrics();
    renderCharts();
    renderTable();
    generateInsights();
}


// ===============================
// CUSTOM DATE FILTER
// ===============================

function applyCustomDates() {

    const start =
        document.getElementById(
            "date-start"
        ).value;

    const end =
        document.getElementById(
            "date-end"
        ).value;

    if (!start || !end) return;

    filteredData =
        stockData.filter(item => {

            return (
                item.Date >= start &&
                item.Date <= end
            );
        });

    currentPage = 1;

    updateMetrics();
    renderCharts();
    renderTable();
    generateInsights();
}


// ===============================
// SMA CALCULATION
// ===============================

function calculateSMA(
    data,
    period
) {

    const sma = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        if (i < period - 1) {

            sma.push(null);

            continue;
        }

        let sum = 0;

        for (
            let j = i - period + 1;
            j <= i;
            j++
        ) {
            sum += data[j].Close;
        }

        sma.push(
            sum / period
        );
    }

    return sma;
}


// ===============================
// CHART GENERATOR
// ===============================

function destroyChart(chart) {

    if (
        chart &&
        typeof chart.destroy ===
            "function"
    ) {
        chart.destroy();
    }
}


// ===============================
// RENDER ALL CHARTS
// ===============================

function renderCharts() {

    if (!filteredData.length)
        return;

    const labels =
        filteredData.map(
            item => item.Date
        );

    const closeData =
        filteredData.map(
            item => item.Close
        );

    const openData =
        filteredData.map(
            item => item.Open
        );

    const highData =
        filteredData.map(
            item => item.High
        );

    const lowData =
        filteredData.map(
            item => item.Low
        );

    const volumeData =
        filteredData.map(
            item => item.Volume
        );

    const sma20 =
        calculateSMA(
            filteredData,
            20
        );

    const sma50 =
        calculateSMA(
            filteredData,
            50
        );

    destroyChart(
        charts.closing
    );

    destroyChart(
        charts.opening
    );

    destroyChart(
        charts.highlow
    );

    destroyChart(
        charts.volume
    );

    destroyChart(
        charts.sma
    );


// ===============================
// CLOSING PRICE CHART
// ===============================

    charts.closing =
        new Chart(
            document.getElementById(
                "chart-closing"
            ),
            {
                type: "line",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "Closing Price",

                            data:
                                closeData,

                            borderWidth: 2,

                            tension: 0.3
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );


// ===============================
// OPENING PRICE CHART
// ===============================

    charts.opening =
        new Chart(
            document.getElementById(
                "chart-opening"
            ),
            {
                type: "line",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "Opening Price",

                            data:
                                openData,

                            borderWidth: 2,

                            tension: 0.3
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );


// ===============================
// HIGH LOW CHART
// ===============================

    charts.highlow =
        new Chart(
            document.getElementById(
                "chart-highlow"
            ),
            {
                type: "line",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "High",

                            data:
                                highData
                        },

                        {
                            label:
                                "Low",

                            data:
                                lowData
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );


// ===============================
// VOLUME CHART
// ===============================

    charts.volume =
        new Chart(
            document.getElementById(
                "chart-volume"
            ),
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "Volume",

                            data:
                                volumeData
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );


// ===============================
// SMA CHART
// ===============================

    charts.sma =
        new Chart(
            document.getElementById(
                "chart-sma"
            ),
            {
                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Close",

                            data:
                                closeData
                        },

                        {
                            label:
                                "SMA 20",

                            data:
                                sma20
                        },

                        {
                            label:
                                "SMA 50",

                            data:
                                sma50
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );
}
// ===============================
// APP.JS PART 3
// TABLE, SEARCH, FILTERS, SORTING
// PAGINATION
// ===============================


// ===============================
// TABLE VARIABLES
// ===============================

let tableData = [];
let currentPage = 1;
let rowsPerPage = 20;

let currentSortColumn = "Date";
let currentSortDirection = "desc";


// ===============================
// POPULATE YEAR FILTER
// ===============================

function populateYearFilter() {

    const yearSelect =
        document.getElementById(
            "filter-year"
        );

    yearSelect.innerHTML =
        '<option value="all">All Years</option>';

    const years = [
        ...new Set(
            stockData.map(row =>
                new Date(
                    row.Date
                ).getFullYear()
            )
        )
    ];

    years
        .sort((a, b) => b - a)
        .forEach(year => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = year;
            option.textContent = year;

            yearSelect.appendChild(
                option
            );
        });
}


// ===============================
// SEARCH
// ===============================

function handleTableSearch() {

    currentPage = 1;

    applyTableFilters();
}


// ===============================
// YEAR / MONTH FILTERS
// ===============================

function handleTableFilters() {

    currentPage = 1;

    applyTableFilters();
}


function applyTableFilters() {

    const searchValue =
        document
            .getElementById(
                "table-search"
            )
            .value
            .toLowerCase();

    const yearFilter =
        document.getElementById(
            "filter-year"
        ).value;

    const monthFilter =
        document.getElementById(
            "filter-month"
        ).value;

    tableData =
        filteredData.filter(row => {

            const dateObj =
                new Date(row.Date);

            const year =
                dateObj.getFullYear();

            const month =
                dateObj.getMonth() + 1;

            const matchesSearch =
                row.Date
                    .toLowerCase()
                    .includes(
                        searchValue
                    );

            const matchesYear =
                yearFilter === "all"
                    ? true
                    : year ==
                      yearFilter;

            const matchesMonth =
                monthFilter === "all"
                    ? true
                    : month ==
                      monthFilter;

            return (
                matchesSearch &&
                matchesYear &&
                matchesMonth
            );
        });

    sortCurrentData();

    renderTable();
}


// ===============================
// SORTING
// ===============================

function sortTable(column) {

    if (
        currentSortColumn ===
        column
    ) {

        currentSortDirection =
            currentSortDirection ===
            "asc"
                ? "desc"
                : "asc";
    } else {

        currentSortColumn =
            column;

        currentSortDirection =
            "asc";
    }

    updateSortIcons();

    sortCurrentData();

    renderTable();
}


function sortCurrentData() {

    tableData.sort(
        (a, b) => {

            let valueA;
            let valueB;

            if (
                currentSortColumn ===
                "Date"
            ) {

                valueA =
                    new Date(a.Date);

                valueB =
                    new Date(b.Date);
            } else {

                const key =
                    currentSortColumn ===
                    "Adj Close"
                        ? "AdjClose"
                        : currentSortColumn;

                valueA = a[key];
                valueB = b[key];
            }

            if (
                valueA < valueB
            ) {
                return currentSortDirection ===
                    "asc"
                    ? -1
                    : 1;
            }

            if (
                valueA > valueB
            ) {
                return currentSortDirection ===
                    "asc"
                    ? 1
                    : -1;
            }

            return 0;
        }
    );
}


function updateSortIcons() {

    document
        .querySelectorAll(
            ".sort-icon"
        )
        .forEach(icon => {
            icon.innerHTML =
                "↕";
        });

    const id =
        currentSortColumn ===
        "Adj Close"
            ? "AdjClose"
            : currentSortColumn;

    const icon =
        document.getElementById(
            `sort-icon-${id}`
        );

    if (!icon) return;

    icon.innerHTML =
        currentSortDirection ===
        "asc"
            ? "↑"
            : "↓";
}


// ===============================
// PAGE SIZE CHANGE
// ===============================

function handlePageSizeChange() {

    rowsPerPage =
        Number(
            document.getElementById(
                "table-pagesize"
            ).value
        );

    currentPage = 1;

    renderTable();
}


// ===============================
// PAGINATION
// ===============================

function changePage(direction) {

    const totalPages =
        Math.ceil(
            tableData.length /
                rowsPerPage
        );

    currentPage += direction;

    if (currentPage < 1)
        currentPage = 1;

    if (
        currentPage > totalPages
    ) {
        currentPage =
            totalPages;
    }

    renderTable();
}


// ===============================
// TABLE RENDER
// ===============================

function renderTable() {

    const tbody =
        document.getElementById(
            "table-body"
        );

    if (!tableData.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No records found
                </td>
            </tr>
        `;

        updateTableInfo();

        return;
    }

    const startIndex =
        (currentPage - 1) *
        rowsPerPage;

    const endIndex =
        startIndex +
        rowsPerPage;

    const rows =
        tableData.slice(
            startIndex,
            endIndex
        );

    tbody.innerHTML =
        rows
            .map(
                row => `
        <tr>
            <td>${row.Date}</td>
            <td>${row.Open.toFixed(
                2
            )}</td>
            <td>${row.High.toFixed(
                2
            )}</td>
            <td>${row.Low.toFixed(
                2
            )}</td>
            <td>${row.Close.toFixed(
                2
            )}</td>
            <td>${row.AdjClose.toFixed(
                2
            )}</td>
            <td>${formatNumber(
                row.Volume
            )}</td>
        </tr>
    `
            )
            .join("");

    updateTableInfo();
}


// ===============================
// TABLE INFO
// ===============================

function updateTableInfo() {

    const total =
        tableData.length;

    const start =
        total === 0
            ? 0
            : (currentPage - 1) *
                  rowsPerPage +
              1;

    const end =
        Math.min(
            currentPage *
                rowsPerPage,
            total
        );

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                    rowsPerPage
            )
        );

    document.getElementById(
        "table-info"
    ).textContent =
        `Showing ${start} to ${end} of ${total} entries`;

    document.getElementById(
        "current-page-num"
    ).textContent =
        currentPage;

    document.getElementById(
        "total-page-num"
    ).textContent =
        totalPages;

    document.getElementById(
        "btn-page-prev"
    ).disabled =
        currentPage === 1;

    document.getElementById(
        "btn-page-next"
    ).disabled =
        currentPage ===
        totalPages;
}


// ===============================
// INITIALIZE TABLE
// ===============================

function initializeTable() {

    tableData =
        [...filteredData];

    populateYearFilter();

    sortCurrentData();

    renderTable();
}
// ===============================
// APP.JS PART 4
// INSIGHTS + REPORTS + INIT
// ===============================


// ===============================
// GENERATE INSIGHTS
// ===============================

function generateInsights() {

    if (!filteredData.length) return;

    const firstPrice =
        filteredData[0].Close;

    const lastPrice =
        filteredData[
            filteredData.length - 1
        ].Close;

    const totalReturn =
        (
            ((lastPrice -
                firstPrice) /
                firstPrice) *
            100
        ).toFixed(2);

    const years =
        (
            filteredData.length /
            252
        ).toFixed(2);

    const cagr =
        (
            (Math.pow(
                lastPrice /
                    firstPrice,
                1 / years
            ) -
                1) *
            100
        ).toFixed(2);

    document.getElementById(
        "insight-total-change"
    ).textContent =
        totalReturn + "%";

    document.getElementById(
        "insight-cagr"
    ).textContent =
        cagr + "%";

    document.getElementById(
        "insight-market-status"
    ).textContent =
        totalReturn > 0
            ? "Bullish"
            : "Bearish";

    document.getElementById(
        "insight-trend-desc"
    ).textContent =
        `Apple stock returned ${totalReturn}% during the selected period with a CAGR of ${cagr}%.`;

    generateVolumeInsights();

    generateVolatilityInsights();

    generateBestPeriods();

    generateObservations();
}


// ===============================
// VOLUME INSIGHT
// ===============================

function generateVolumeInsights() {

    const peak =
        filteredData.reduce(
            (max, row) =>
                row.Volume >
                max.Volume
                    ? row
                    : max
        );

    document.getElementById(
        "insight-peak-volume-date"
    ).textContent =
        peak.Date;

    document.getElementById(
        "insight-peak-volume-qty"
    ).textContent =
        formatNumber(
            peak.Volume
        );

    document.getElementById(
        "insight-peak-volume-price"
    ).textContent =
        formatCurrency(
            peak.Close
        );

    document.getElementById(
        "insight-volume-desc"
    ).textContent =
        "Highest trading activity detected during the selected dataset period.";
}


// ===============================
// VOLATILITY
// ===============================

function generateVolatilityInsights() {

    const ranges =
        filteredData.map(
            row =>
                row.High -
                row.Low
        );

    const avgRange =
        (
            ranges.reduce(
                (a, b) => a + b,
                0
            ) / ranges.length
        ).toFixed(2);

    const maxSwing =
        Math.max(...ranges);

    const avgClose =
        filteredData.reduce(
            (sum, row) =>
                sum + row.Close,
            0
        ) / filteredData.length;

    const variance =
        filteredData.reduce(
            (sum, row) => {

                return (
                    sum +
                    Math.pow(
                        row.Close -
                            avgClose,
                        2
                    )
                );
            },
            0
        ) /
        filteredData.length;

    const stdDev =
        Math.sqrt(
            variance
        ).toFixed(2);

    document.getElementById(
        "insight-avg-range"
    ).textContent =
        "$" + avgRange;

    document.getElementById(
        "insight-max-swing"
    ).textContent =
        "$" +
        maxSwing.toFixed(2);

    document.getElementById(
        "insight-std-dev"
    ).textContent =
        stdDev;

    document.getElementById(
        "insight-volatility-desc"
    ).textContent =
        "Standard deviation and daily ranges indicate historical stock volatility.";
}


// ===============================
// BEST PERIODS
// ===============================

function generateBestPeriods() {

    let bestDay =
        filteredData[0];

    let bestGain = -9999;

    let greenStreak = 0;
    let maxGreenStreak = 0;

    for (
        let i = 1;
        i < filteredData.length;
        i++
    ) {

        const previous =
            filteredData[
                i - 1
            ].Close;

        const current =
            filteredData[
                i
            ].Close;

        const gain =
            ((current -
                previous) /
                previous) *
            100;

        if (
            gain > bestGain
        ) {

            bestGain = gain;

            bestDay =
                filteredData[i];
        }

        if (
            current >
            previous
        ) {

            greenStreak++;

            maxGreenStreak =
                Math.max(
                    maxGreenStreak,
                    greenStreak
                );
        } else {

            greenStreak = 0;
        }
    }

    document.getElementById(
        "insight-best-year"
    ).textContent =
        bestDay.Date;

    document.getElementById(
        "insight-best-month"
    ).textContent =
        bestGain.toFixed(
            2
        ) + "%";

    document.getElementById(
        "insight-green-streak"
    ).textContent =
        maxGreenStreak +
        " Days";

    document.getElementById(
        "insight-periods-desc"
    ).textContent =
        "Best performing periods derived from historical price momentum.";
}


// ===============================
// SMA CROSSOVER ANALYSIS
// ===============================

function generateObservations() {

    const body =
        document.getElementById(
            "observations-body"
        );

    const sma20 =
        calculateSMA(
            filteredData,
            20
        );

    const sma50 =
        calculateSMA(
            filteredData,
            50
        );

    let goldenCrosses = 0;
    let deathCrosses = 0;

    for (
        let i = 1;
        i < sma20.length;
        i++
    ) {

        if (
            sma20[i - 1] <
                sma50[i - 1] &&
            sma20[i] >
                sma50[i]
        ) {
            goldenCrosses++;
        }

        if (
            sma20[i - 1] >
                sma50[i - 1] &&
            sma20[i] <
                sma50[i]
        ) {
            deathCrosses++;
        }
    }

    body.innerHTML = `
        <div class="observation-item bullish">
            <strong>Golden Cross Signals:</strong>
            <p>${goldenCrosses}</p>
        </div>

        <div class="observation-item bearish">
            <strong>Death Cross Signals:</strong>
            <p>${deathCrosses}</p>
        </div>

        <div class="observation-item neutral">
            <strong>Trend Assessment:</strong>
            <p>
                ${
                    goldenCrosses >
                    deathCrosses
                        ? "Long-term bullish trend observed."
                        : "Market experienced multiple bearish transitions."
                }
            </p>
        </div>
    `;
}


// ===============================
// MARKDOWN REPORT
// ===============================

function downloadMarkdownReport() {

    const report = `
# Apple Stock Analysis Report

Generated: ${new Date().toLocaleString()}

## Summary

Total Trading Days:
${document.getElementById("metric-total-days").textContent}

Average Open:
${document.getElementById("metric-avg-open").textContent}

Average Close:
${document.getElementById("metric-avg-close").textContent}

Highest Price:
${document.getElementById("metric-high-price").textContent}

Lowest Price:
${document.getElementById("metric-low-price").textContent}

Average Volume:
${document.getElementById("metric-avg-volume").textContent}

## Insights

Total Return:
${document.getElementById("insight-total-change").textContent}

CAGR:
${document.getElementById("insight-cagr").textContent}

Market Status:
${document.getElementById("insight-market-status").textContent}
`;

    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/markdown"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href = url;

    a.download =
        "Apple_Stock_Report.md";

    a.click();

    URL.revokeObjectURL(
        url
    );
}


// ===============================
// PRINT PDF
// ===============================

function printDashboardReport() {

    window.print();
}


// ===============================
// TAB SWITCHING
// ===============================

function switchTab(tab) {

    document
        .querySelectorAll(
            ".view-section"
        )
        .forEach(section =>
            section.classList.remove(
                "active"
            )
        );

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(btn =>
            btn.classList.remove(
                "active"
            )
        );

    document
        .getElementById(
            `view-${tab}`
        )
        .classList.add(
            "active"
        );

    document
        .getElementById(
            `nav-${tab}`
        )
        .classList.add(
            "active"
        );
}


// ===============================
// THEME TOGGLE
// ===============================

document
    .getElementById(
        "theme-toggle"
    )
    ?.addEventListener(
        "click",
        () => {

            const html =
                document.documentElement;

            const current =
                html.getAttribute(
                    "data-theme"
                );

            html.setAttribute(
                "data-theme",
                current === "dark"
                    ? "light"
                    : "dark"
            );
        }
    );


// ===============================
// INITIALIZATION
// ===============================

window.addEventListener(
    "load",
    () => {

        lucide.createIcons();

        loadDefaultCSV();

        document
            .getElementById(
                "upload-trigger"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "csv-file-input"
                        )
                        .click();
                }
            );

        document
            .getElementById(
                "csv-file-input"
            )
            ?.addEventListener(
                "change",
                handleCSVUpload
            );
    }
);