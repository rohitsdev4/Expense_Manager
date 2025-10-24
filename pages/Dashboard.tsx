import React, { useContext, useMemo } from 'react';
import StatCard from '../components/StatCard';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import ExpensePieChart from '../components/ExpensePieChart';
import { DataContext } from '../contexts/DataContext';
import { DollarSignIcon, BuildingIcon, UsersIcon, WalletIcon } from '../components/icons';

const Dashboard: React.FC = () => {
  const { payments, expenses, sites, labours, clients, tasks } = useContext(DataContext);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isCurrentMonth = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };

    const monthlyIncome = payments
        .filter(p => isCurrentMonth(p.date))
        .reduce((sum, p) => sum + p.amount, 0);
    
    const monthlyExpenses = expenses
        .filter(e => isCurrentMonth(e.date))
        .reduce((sum, e) => sum + e.amount, 0);

    const monthlyProfit = monthlyIncome - monthlyExpenses;

    const pendingPayments = clients
        .reduce((sum, p) => sum + p.balance, 0);

    const activeSites = sites.filter(s => s.progress < 100).length;
    const totalSites = sites.length;

    const pendingSalaries = labours.reduce((sum, l) => sum + l.balance, 0);
    
    return { monthlyProfit, pendingPayments, activeSites, totalSites, pendingSalaries };
  }, [payments, expenses, sites, labours, clients]);


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome Back!</h2>
        <p className="text-md sm:text-lg text-gray-500 dark:text-gray-400">Here's a live snapshot of your business performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Profit (This Month)"
          value={`₹${dashboardStats.monthlyProfit.toLocaleString()}`}
          icon={DollarSignIcon}
          trend="up"
          trendValue="+12.5%"
          period="this month"
          color="green"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${dashboardStats.pendingPayments.toLocaleString()}`}
          icon={WalletIcon}
          trend="down"
          trendValue="-3.2%"
          period="from clients"
          color="yellow"
        />
        <StatCard
          title="Active Sites"
          value={`${dashboardStats.activeSites} / ${dashboardStats.totalSites}`}
          icon={BuildingIcon}
          trend="up"
          trendValue="+2"
          period="in progress"
          color="blue"
        />
        <StatCard
          title="Pending Salaries"
          value={`₹${dashboardStats.pendingSalaries.toLocaleString()}`}
          icon={UsersIcon}
          trend="stale"
          trendValue="-1.0%"
          period="to labour"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart />
        <ExpensePieChart />
      </div>
      
    </div>
  );
};

export default Dashboard;
