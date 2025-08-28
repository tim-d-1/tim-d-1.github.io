async function loadSalesData() {
    const res = await fetch("sales_february_2025.json");
    const sales = (await res.json()).sales;

    renderCharts(sales);
    renderTables(sales);
}

function renderCharts(sales) {
    const groupBy = (arr, keyFn) =>
        arr.reduce((acc, item) => {
            const key = keyFn(item);
            acc[key] = acc[key] || [];
            acc[key].push(item);
            return acc;
        }, {});

    // 1. Sales by day
    const salesByDate = groupBy(sales, s => s.date);
    const dailyRevenue = Object.entries(salesByDate).map(([date, rows]) => ({
        date,
        amount: rows.reduce((sum, r) => sum + r.amount, 0)
    }));

    new Chart(document.getElementById("salesByDayChart"), {
        type: "line",
        data: {
            labels: dailyRevenue.map(r => r.date),
            datasets: [{
                label: "Revenue",
                data: dailyRevenue.map(r => r.amount),
                borderColor: "blue"
            }]
        }
    });

    // 2. Leads by day
    const leadsByDate = Object.entries(salesByDate).map(([date, rows]) => ({
        date,
        leads: rows.filter(r => r.isLead).length
    }));

    new Chart(document.getElementById("leadsByDayChart"), {
        type: "bar",
        data: {
            labels: leadsByDate.map(r => r.date),
            datasets: [{
                label: "Leads",
                data: leadsByDate.map(r => r.leads),
                backgroundColor: "orange"
            }]
        }
    });

    // 3. Repeat purchases (per customer)
    const salesByCustomer = groupBy(sales, s => s.customerId);
    const repeatCounts = Object.values(salesByCustomer).map(rows => rows.length);
    const groupedRepeats = repeatCounts.reduce((acc, n) => {
        acc[n] = (acc[n] || 0) + 1;
        return acc;
    }, {});

    new Chart(document.getElementById("repeatPurchasesChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(groupedRepeats).map(n => `${n} purchases`),
            datasets: [{
                data: Object.values(groupedRepeats),
                backgroundColor: ["#74b9ff", "#55efc4", "#ffeaa7", "#fab1a0"]
            }]
        }
    });

    // 4. Revenue by month
    const salesByMonth = groupBy(sales, s => s.date.slice(0, 7)); // YYYY-MM
    const monthlyRevenue = Object.entries(salesByMonth).map(([month, rows]) => ({
        month,
        amount: rows.reduce((sum, r) => sum + r.amount, 0)
    }));

    new Chart(document.getElementById("revenueByMonthChart"), {
        type: "line",
        data: {
            labels: monthlyRevenue.map(r => r.month),
            datasets: [{
                label: "Revenue",
                data: monthlyRevenue.map(r => r.amount),
                borderColor: "green"
            }]
        }
    });

    // 5. Sales by manager (Radar)
    const salesByManager = groupBy(sales, s => s.manager);
    const managerTotals = Object.entries(salesByManager).map(([manager, rows]) => ({
        manager,
        amount: rows.reduce((sum, r) => sum + r.amount, 0)
    }));

    new Chart(document.getElementById("salesByManagerChart"), {
        type: "radar",
        data: {
            labels: managerTotals.map(r => r.manager),
            datasets: [{
                label: "Revenue",
                data: managerTotals.map(r => r.amount),
                backgroundColor: "rgba(52, 152, 219, 0.2)",
                borderColor: "#3498db"
            }]
        }
    });
}

function renderTables(sales) {
    // Revenue by manager
    const managers = {};
    sales.forEach(s => {
        if (!managers[s.manager]) {
            managers[s.manager] = { manager: s.manager, orders: 0, revenue: 0 };
        }
        managers[s.manager].orders++;
        managers[s.manager].revenue += s.amount;
    });

    const managerData = Object.values(managers).map(m => ({
        Manager: m.manager,
        Orders: m.orders,
        Revenue: m.revenue,
        "Avg Check": (m.revenue / m.orders).toFixed(2)
    }));

    $("#managersTable").DataTable({
        data: managerData,
        columns: [
            { data: "Manager" },
            { data: "Orders" },
            { data: "Revenue" },
            { data: "Avg Check" }
        ],
        destroy: true
    });

    // Low-turnover products
    const products = {};
    sales.forEach(s => {
        if (!products[s.product]) {
            products[s.product] = { product: s.product, units: 0, revenue: 0 };
        }
        products[s.product].units++;
        products[s.product].revenue += s.amount;
    });

    const productData = Object.values(products)
        .map(p => ({
            Product: p.product,
            Units: p.units,
            Revenue: p.revenue,
            Turnover: (p.revenue / p.units).toFixed(2)
        }))
        .sort((a, b) => a.Revenue - b.Revenue);

    $("#productsTable").DataTable({
        data: productData,
        columns: [
            { data: "Product" },
            { data: "Units" },
            { data: "Revenue" },
            { data: "Turnover" }
        ],
        destroy: true
    });
}

// Run on tab click
document.querySelector('[data-section="analytics"]').addEventListener("click", loadSalesData);
