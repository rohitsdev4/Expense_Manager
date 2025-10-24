import React, { useState, useContext, useEffect } from 'react';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';
import { DataProvider, DataContext } from './contexts/DataContext';
import LabourPage from './pages/LabourPage';
import ClientsPage from './pages/ClientsPage';
import SitesPage from './pages/SitesPage';
import TasksPage from './pages/TasksPage';
import ChatPage from './pages/ChatPage';

// Enhanced Payments Page Component
const PaymentsPage: React.FC = () => {
  const data = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'site'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    site: '',
    client: '',
    amount: '',
    mode: 'Cash' as 'Cash' | 'Bank Transfer' | 'Cheque',
    remarks: ''
  });

  // Get available sites and clients from data
  const availableSites = [
    ...new Set([
      ...data.sites.map(site => site.siteName),
      ...data.payments.map(payment => payment.site),
    ])
  ].filter(Boolean).sort();

  const availableClients = [
    ...new Set([
      ...data.clients.map(client => client.name),
      // Extract clients from parties data if available
      ...data.payments.map(payment => payment.site), // Sites can also be clients
    ])
  ].filter(Boolean).sort();

  // Filter and sort payments
  const filteredPayments = data.payments
    .filter(payment => {
      const matchesSearch =
        payment.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.mode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMode = filterMode === 'all' || payment.mode === filterMode;

      const matchesDateRange =
        (!dateFilter.start || payment.date >= dateFilter.start) &&
        (!dateFilter.end || payment.date <= dateFilter.end);

      return matchesSearch && matchesMode && matchesDateRange;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'site':
          aValue = a.site.toLowerCase();
          bValue = b.site.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      return sortOrder === 'asc' ?
        (aValue > bValue ? 1 : -1) :
        (aValue < bValue ? 1 : -1);
    });

  const handleAddPayment = async () => {
    if ((!newPayment.site && !newPayment.client) || !newPayment.amount) {
      alert('Please fill in all required fields (Site or Client, and Amount)');
      return;
    }

    try {
      await data.addPayment({
        date: newPayment.date,
        site: newPayment.site || newPayment.client, // Use site if provided, otherwise client
        amount: parseFloat(newPayment.amount),
        mode: newPayment.mode,
        remarks: newPayment.remarks
      });

      // Reset form
      setNewPayment({
        date: new Date().toISOString().split('T')[0],
        site: '',
        client: '',
        amount: '',
        mode: 'Cash',
        remarks: ''
      });
      setShowAddModal(false);
    } catch (error) {
      alert('Error adding payment. Please try again.');
    }
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Payments Management</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredPayments.length} payments • Total: ₹{totalAmount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Payment
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by site, mode, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          {/* Mode Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'site')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="site">Site</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterMode('all');
              setDateFilter({ start: '', end: '' });
              setSortBy('date');
              setSortOrder('desc');
            }}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-100 dark:bg-green-900/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Site</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Mode</th>
                  <th className="text-left py-3 px-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.id} className={`border-b border-green-100 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 ${index % 2 === 0 ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-green-50/50 dark:bg-green-900/20'}`}>
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4 font-medium">{payment.site}</td>
                    <td className="py-3 px-4 font-bold text-green-600">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.mode === 'Cash' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        payment.mode === 'Bank Transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {payment.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {payment.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {data.payments.length === 0
                ? 'No payments found. Add your first payment or configure Google Sheets.'
                : 'No payments match your current filters.'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add First Payment
            </button>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Add New Payment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Site *</label>
                <select
                  value={newPayment.site}
                  onChange={(e) => setNewPayment({ ...newPayment, site: e.target.value, client: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="">Select Site</option>
                  {availableSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client (Alternative to Site)</label>
                <select
                  value={newPayment.client}
                  onChange={(e) => setNewPayment({ ...newPayment, client: e.target.value, site: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="">Select Client</option>
                  {availableClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose either Site or Client (not both)
                  {newPayment.site && <span className="text-green-600"> • Site selected</span>}
                  {newPayment.client && <span className="text-blue-600"> • Client selected</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select
                  value={newPayment.mode}
                  onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value as 'Cash' | 'Bank Transfer' | 'Cheque' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  value={newPayment.remarks}
                  onChange={(e) => setNewPayment({ ...newPayment, remarks: e.target.value })}
                  placeholder="Optional remarks or notes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Add Payment
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Expenses Page Component
const ExpensesPage: React.FC = () => {
  const data = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: '',
    site: ''
  });

  // Get unique categories from existing expenses and predefined ones
  const availableCategories = [
    ...new Set([
      ...data.expenseCategories.map(cat => cat.name),
      ...data.expenses.map(exp => exp.category),
      'Materials', 'Labour', 'Transport', 'Equipment', 'Utilities', 'Rent', 'Other'
    ])
  ].filter(Boolean).sort();

  // Get sites from existing data
  const availableSites = [
    ...new Set([
      ...data.sites.map(site => site.siteName),
      ...data.expenses.map(exp => exp.description.match(/@ (.+?)(?:\s|$)/)?.[1]).filter(Boolean),
      'General', 'Office', 'Warehouse'
    ])
  ].filter(Boolean).sort();

  // Filter and sort expenses
  const filteredExpenses = data.expenses
    .filter(expense => {
      const matchesSearch =
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;

      const matchesSite = filterSite === 'all' ||
        expense.description.toLowerCase().includes(filterSite.toLowerCase());

      const matchesDateRange =
        (!dateFilter.start || expense.date >= dateFilter.start) &&
        (!dateFilter.end || expense.date <= dateFilter.end);

      return matchesSearch && matchesCategory && matchesSite && matchesDateRange;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      return sortOrder === 'asc' ?
        (aValue > bValue ? 1 : -1) :
        (aValue < bValue ? 1 : -1);
    });

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const description = newExpense.site && newExpense.site !== 'General'
        ? `${newExpense.description} @ ${newExpense.site}`
        : newExpense.description;

      await data.addExpense({
        date: newExpense.date,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: description
      });

      // Reset form
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        description: '',
        site: ''
      });
      setShowAddModal(false);
    } catch (error) {
      alert('Error adding expense. Please try again.');
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Expenses Management</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredExpenses.length} expenses • Total: ₹{totalAmount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Expense
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Sites</option>
              {availableSites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterSite('all');
              setDateFilter({ start: '', end: '' });
              setSortBy('date');
              setSortOrder('desc');
            }}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-100 dark:bg-red-900/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Site</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, index) => (
                  <tr key={expense.id} className={`border-b border-red-100 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ${index % 2 === 0 ? 'bg-red-50/30 dark:bg-red-900/10' : 'bg-red-50/50 dark:bg-red-900/20'}`}>
                    <td className="py-3 px-4">{expense.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.category === 'Materials' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        expense.category === 'Labour' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          expense.category === 'Transport' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            expense.category === 'Equipment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-red-600">₹{expense.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate" title={expense.description}>
                        {expense.description.replace(/ @ .+$/, '')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {expense.description.match(/ @ (.+)$/)?.[1] || 'General'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {data.expenses.length === 0
                ? 'No expenses found. Add your first expense or configure Google Sheets.'
                : 'No expenses match your current filters.'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add First Expense
            </button>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Add New Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  required
                >
                  <option value="">Select Category</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Enter expense description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Site (Optional)</label>
                <select
                  value={newExpense.site}
                  onChange={(e) => setNewExpense({ ...newExpense, site: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="">Select Site</option>
                  {availableSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// App with contexts
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const settings = useContext(SettingsContext);
  const data = useContext(DataContext);

  // Debug logging
  useEffect(() => {
    console.log('AppContent render:', {
      hasSettings: !!settings,
      hasData: !!data,
      settingsKeys: settings ? Object.keys(settings) : [],
      dataKeys: data ? Object.keys(data) : []
    });
  }, [settings, data]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple loading check - temporarily disabled for debugging
  if (!settings || !data) {
    console.log('Loading state:', { settings: !!settings, data: !!data });
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Loading ExpenseMan...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">
            Settings: {settings ? '✓' : '✗'} | Data: {data ? '✓' : '✗'}
          </p>
          {!settings && <p className="text-xs text-red-500 mt-2">Settings context not loaded</p>}
          {!data && <p className="text-xs text-red-500 mt-2">Data context not loaded</p>}
        </div>
      </div>
    );
  }

  // More menu items for mobile - with fallbacks
  const moreItems = [
    { name: 'Sites', count: data?.sites?.length || 0, icon: '🏗️' },
    { name: 'Labour', count: data?.labours?.length || 0, icon: '👷' },
    { name: 'Clients', count: data?.clients?.length || 0, icon: '🤝' },
    { name: 'Tasks', count: (data?.tasks?.length || 0) + (data?.habits?.length || 0), icon: '📋' },
    { name: 'AI Chat', count: null, icon: '🤖' },
    { name: 'Settings', count: null, icon: '⚙️' }
  ];

  // All pages for desktop sidebar - with fallbacks
  const allPages = [
    'Dashboard',
    `Payments (${data?.payments?.length || 0})`,
    `Expenses (${data?.expenses?.length || 0})`,
    `Sites (${data?.sites?.length || 0})`,
    `Labour (${data?.labours?.length || 0})`,
    `Clients (${data?.clients?.length || 0})`,
    `Tasks (${(data?.tasks?.length || 0) + (data?.habits?.length || 0)})`,
    'AI Chat',
    'Settings'
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
          <aside className="w-80 max-w-[85vw] bg-white dark:bg-gray-800 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-blue-500">ExpenseMan</h1>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <nav className="px-4 py-4 overflow-y-auto h-full pb-20">
              {allPages.map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(
                      page.includes('Payments') ? 'Payments' :
                        page.includes('Expenses') ? 'Expenses' :
                          page.includes('Sites') ? 'Sites' :
                            page.includes('Labour') ? 'Labour' :
                              page.includes('Clients') ? 'Clients' :
                                page.includes('Tasks') ? 'Tasks' :
                                  page.includes('AI Chat') ? 'AI Chat' :
                                    page
                    );
                    setShowSidebar(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${(currentPage === page) ||
                    (currentPage === 'Payments' && page.includes('Payments')) ||
                    (currentPage === 'Expenses' && page.includes('Expenses')) ||
                    (currentPage === 'Sites' && page.includes('Sites')) ||
                    (currentPage === 'Labour' && page.includes('Labour')) ||
                    (currentPage === 'Clients' && page.includes('Clients')) ||
                    (currentPage === 'Tasks' && page.includes('Tasks')) ||
                    (currentPage === 'AI Chat' && page.includes('AI Chat'))
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-500">ExpenseMan</h1>
          </div>

          <nav className="px-4">
            {allPages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(
                  page.includes('Payments') ? 'Payments' :
                    page.includes('Expenses') ? 'Expenses' :
                      page.includes('Sites') ? 'Sites' :
                        page.includes('Labour') ? 'Labour' :
                          page.includes('Clients') ? 'Clients' :
                            page.includes('Tasks') ? 'Tasks' :
                              page.includes('AI Chat') ? 'AI Chat' :
                                page
                )}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${(currentPage === page) ||
                  (currentPage === 'Payments' && page.includes('Payments')) ||
                  (currentPage === 'Expenses' && page.includes('Expenses')) ||
                  (currentPage === 'Sites' && page.includes('Sites')) ||
                  (currentPage === 'Labour' && page.includes('Labour')) ||
                  (currentPage === 'Clients' && page.includes('Clients')) ||
                  (currentPage === 'Tasks' && page.includes('Tasks')) ||
                  (currentPage === 'AI Chat' && page.includes('AI Chat'))
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        {/* Mobile Header with Hamburger Menu */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-blue-500">ExpenseMan</h1>
              <button
                onClick={() => data?.refreshData?.()}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {!isMobile && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold">{currentPage}</h2>
                <button
                  onClick={() => data?.refreshData?.()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}

            {isMobile && (
              <div className="mb-4">
                <h2 className="text-xl font-bold">{currentPage}</h2>
              </div>
            )}

            {currentPage === 'Dashboard' && (
              <div>
                {/* Connection Status */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${data?.connectionStatus === 'connected' ? 'bg-green-500' :
                      data?.connectionStatus === 'loading' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    <span className="text-sm">Status: {data?.connectionStatus || 'initializing'}</span>
                    {data?.lastSync && (
                      <span className="text-xs text-gray-500">
                        • Last sync: {data.lastSync.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {data?.error && (
                    <p className="text-sm text-red-600 mt-1">{data.error}</p>
                  )}
                </div>

                {/* Quick Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-2">Today's Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Recent Activity: </span>
                      <span className="font-medium">
                        {(data?.payments?.length || 0) + (data?.expenses?.length || 0)} transactions
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Categories: </span>
                      <span className="font-medium">
                        {[...new Set((data?.expenses || []).map(e => e.category))].length} expense types
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Active Sites: </span>
                      <span className="font-medium">{data?.sites?.length || 0} projects</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Payments</h3>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(data?.payments || []).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{data?.payments?.length || 0} payments</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{(data?.expenses || []).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{data?.expenses?.length || 0} expenses</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Sites</h3>
                    <p className="text-2xl font-bold text-blue-600">{data?.sites?.length || 0}</p>
                    <p className="text-sm text-gray-500">Active projects</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Profit</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{((data?.payments || []).reduce((sum, p) => sum + p.amount, 0) - (data?.expenses || []).reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Current profit</p>
                  </div>
                </div>

                {/* Latest Transactions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 lg:mt-8">
                  {/* Latest Payments */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-green-600">Latest Payments</h3>
                      <button
                        onClick={() => setCurrentPage('Payments')}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View All →
                      </button>
                    </div>
                    {(data?.payments?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        {(data?.payments || [])
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div>
                                <p className="font-medium">{payment.site}</p>
                                <p className="text-sm text-gray-500">{payment.date} • {payment.mode}</p>
                              </div>
                              <p className="font-bold text-green-600">+₹{payment.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        {(data?.payments?.length || 0) > 5 && (
                          <p className="text-sm text-gray-500 text-center mt-3">
                            +{(data?.payments?.length || 0) - 5} more payments
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No payments yet</p>
                    )}
                  </div>

                  {/* Latest Expenses */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-red-600">Latest Expenses</h3>
                      <button
                        onClick={() => setCurrentPage('Expenses')}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View All →
                      </button>
                    </div>
                    {(data?.expenses?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        {(data?.expenses || [])
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div>
                                <p className="font-medium">{expense.category}</p>
                                <p className="text-sm text-gray-500">{expense.date}</p>
                                <p className="text-xs text-gray-400 truncate max-w-48">{expense.description}</p>
                              </div>
                              <p className="font-bold text-red-600">-₹{expense.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        {(data?.expenses?.length || 0) > 5 && (
                          <p className="text-sm text-gray-500 text-center mt-3">
                            +{(data?.expenses?.length || 0) - 5} more expenses
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No expenses yet</p>
                    )}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 lg:mt-8">
                  {/* Expense Category Pie Chart */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
                    {(data?.expenses?.length || 0) > 0 ? (
                      <div className="space-y-4">
                        {(() => {
                          const categoryTotals = (data?.expenses || []).reduce((acc, expense) => {
                            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                            return acc;
                          }, {} as Record<string, number>);

                          const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
                          const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];

                          return Object.entries(categoryTotals)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount], index) => {
                              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                              return (
                                <div key={category} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                                    <span className="font-medium">{category}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">₹{amount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{percentage}%</p>
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No expense data available</p>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                              <span>Configure Google Sheets to see data</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expenses by Site Bar Chart */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Expenses by Site</h3>
                    {(data?.expenses?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        {(() => {
                          // Get site expenses by matching expense descriptions with site names
                          const siteExpenses = (data?.sites || []).reduce((acc, site) => {
                            const siteExpenseTotal = (data?.expenses || [])
                              .filter(expense =>
                                expense.description.toLowerCase().includes(site.siteName.toLowerCase()) ||
                                expense.category.toLowerCase().includes(site.siteName.toLowerCase())
                              )
                              .reduce((sum, expense) => sum + expense.amount, 0);

                            if (siteExpenseTotal > 0) {
                              acc[site.siteName] = siteExpenseTotal;
                            }
                            return acc;
                          }, {} as Record<string, number>);

                          // Add general expenses (not site-specific)
                          const generalExpenses = (data?.expenses || [])
                            .filter(expense => {
                              return !(data?.sites || []).some(site =>
                                expense.description.toLowerCase().includes(site.siteName.toLowerCase()) ||
                                expense.category.toLowerCase().includes(site.siteName.toLowerCase())
                              );
                            })
                            .reduce((sum, expense) => sum + expense.amount, 0);

                          if (generalExpenses > 0) {
                            siteExpenses['General'] = generalExpenses;
                          }

                          const maxAmount = Math.max(...Object.values(siteExpenses));

                          return Object.entries(siteExpenses)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 8) // Show top 8 sites
                            .map(([siteName, amount]) => {
                              const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                              return (
                                <div key={siteName} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">{siteName}</span>
                                    <span className="font-bold text-sm">₹{amount.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No site expense data available</p>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm text-gray-400">Sample Site A</span>
                              <span className="font-bold text-sm text-gray-400">₹0</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'Payments' && (
              <PaymentsPage />
            )}

            {currentPage === 'Expenses' && (
              <ExpensesPage />
            )}

            {currentPage === 'Settings' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">User Name</label>
                    <input
                      type="text"
                      value={settings?.userName || ''}
                      onChange={(e) => settings?.updateSettings?.({ userName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Google Sheet URL</label>
                    <input
                      type="text"
                      value={settings?.googleSheetUrl || ''}
                      onChange={(e) => settings?.updateSettings?.({ googleSheetUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <input
                      type="password"
                      value={settings?.apiKey || ''}
                      onChange={(e) => settings?.updateSettings?.({ apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                      placeholder="Enter your Google API Key"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This API key is used for both Google Sheets data sync and AI Chat functionality.
                      A fallback key is provided for AI Chat, but you'll need your own key for Google Sheets access.
                      Create a key in Google Cloud Console and enable Google Sheets API and Gemini API.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={settings?.theme || 'dark'}
                      onChange={(e) => settings?.setTheme?.(e.target.value as 'light' | 'dark')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'Sites' && (
              <SitesPage />
            )}

            {currentPage === 'Labour' && (
              <LabourPage />
            )}

            {currentPage === 'Clients' && (
              <ClientsPage />
            )}

            {currentPage === 'Tasks' && (
              <TasksPage />
            )}

            {currentPage === 'AI Chat' && (
              <ChatPage />
            )}

            {!['Dashboard', 'Payments', 'Expenses', 'Sites', 'Labour', 'Clients', 'Tasks', 'AI Chat', 'Settings'].includes(currentPage) && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400">
                  {currentPage} functionality will be added step by step.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <SettingsProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </SettingsProvider>
  );
};

export default App;