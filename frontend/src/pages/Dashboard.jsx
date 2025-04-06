import React, { useState, useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement, } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

const Dashboard = () => {
  // State variables to store fetched data and loading status
  const [summary, setSummary] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API endpoints and update state
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`http://localhost:5277/api/analytics/${endpoint}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    // Fetch all required data and set loading to false once done
    Promise.all([
      fetchData("summary", setSummary),
      fetchData("monthly", setMonthlyReport),
      fetchData("categories", setCategoryReport),
    ]).then(() => setLoading(false));
  }, []);

  // Helper function to create gradient options for charts
  const gradientOptions = (ctx, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  // Prepare data for the monthly income vs expenses chart
  const uniqueLabels = [...new Set(monthlyReport.map((data) => `${data.monthName} ${data.year}`))];

  const monthlyData = {
    labels: uniqueLabels,
    datasets: [
      {
        label: "Income",
        data: uniqueLabels.map((label) => {
          const [monthName, year] = label.split(" ");
          const entry = monthlyReport.find((data) => data.monthName === monthName && data.year.toString() === year && data.type === "income");
          return entry ? entry.totalAmount : 0;
        }),
        borderColor: "#4CAF50",
        backgroundColor: (ctx) => gradientOptions(ctx.chart.ctx, "rgba(76, 175, 80, 0.6)", "rgba(76, 175, 80, 0.1)"),
        fill: true,
        tension: 0.2,
      },
      {
        label: "Expenses",
        data: uniqueLabels.map((label) => {
          const [monthName, year] = label.split(" ");
          const entry = monthlyReport.find((data) => data.monthName === monthName && data.year.toString() === year && data.type === "expense");
          return entry ? entry.totalAmount : 0;
        }),
        borderColor: "#FF3D00",
        backgroundColor: (ctx) => gradientOptions(ctx.chart.ctx, "rgba(255, 61, 0, 0.6)", "rgba(255, 61, 0, 0.1)"),
        fill: true,
        tension: 0.2,
      },
    ],
  };

  // Prepare data for the expense categories chart
  const categoryData = {
    labels: categoryReport.map((data) => data.category),
    datasets: [
      {
        data: categoryReport.map((data) => data.totalAmount),
        backgroundColor: (ctx) => [
          gradientOptions(ctx.chart.ctx, "rgb(255, 0, 55)", "rgba(255, 52, 116, 0.6)")
        ],
        borderRadius: 8,
      },
    ],
  };

  // Prepare data for the goal progress chart
  const goalChartData = {
    labels: ["Current Amount", "Goal Amount"],
    datasets: [
      {
        data: summary ? [summary.netWorth, summary.goalAmount] : [0, 0],
        backgroundColor: (ctx) => [
          gradientOptions(ctx.chart.ctx, "rgb(0, 153, 255)", "rgba(32, 126, 189, 0.6)"),
          gradientOptions(ctx.chart.ctx, "rgb(102, 7, 255)", "rgba(127, 0, 206, 0.6)"),
        ],
        hoverBackgroundColor: ["#5EA3D1", "#9E5ACF"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  return (
    <div className="p-2 dark:bg-gray-700 bg-gray-100 dark:text-white space-y-6">

      {/* Display summary cards for net worth, income, expense, and due */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Net Worth", value: summary?.netWorth ?? 0, bg: "from-green-500 to-blue-300" },
          { label: "Total Income", value: summary?.totalIncome ?? 0, bg: "from-green-500 to-green-300" },
          { label: "Total Expenses", value: summary?.totalExpenses ?? 0, bg: "from-red-500 to-red-300" },
          { label: "Total Due", value: summary?.totalDue ?? 0, bg: "from-yellow-500 to-yellow-300" },
        ].map((item, index) => (
          <div key={index} className={`bg-gradient-to-r ${item.bg} p-10 rounded-lg shadow-md text-center`}>
            <h3 className="text-lg font-semibold">{item.label}</h3>
            {loading ? <div className={`h-8 w-24 bg-gray-300 rounded-md animate-pulse m-auto`}></div> : <p className="text-2xl font-bold">${item.value}</p>}
          </div>
        ))}
      </div>

      {/* Display charts for analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Monthly Income vs Expenses", Component: Line, data: monthlyData },
          { title: "Expense Categories", Component: Bar, data: categoryData, options: { scales: { x: { grid: { display: false }, }, }, }, },
          { title: "Goal Progress", Component: Doughnut, data: goalChartData, options: { cutout: "60%" }, },
        ].map((chart, index) => (
          <div key={index} className="dark:bg-gray-800 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-center mb-3">{chart.title}</h3>
            <div className="w-full h-64">
              {loading ? (
                <div className="w-full h-full bg-gray-300 rounded-md animate-pulse"></div>
              ) : (
                <chart.Component
                  data={chart.data}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    ...(chart.options || {}),
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;