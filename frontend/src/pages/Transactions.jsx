import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const Transactions = () => {
  // State variables for managing transactions, filters, pagination, and UI
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const location = useLocation();
  const [isAddTransactionPopupOpen, setIsAddTransactionPopupOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    type: '',
    category: '',
    amount: '',
    method: '',
    status: '',
    note: ''
  });
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(["Utilities", "Food", "Travel", "Rent", "Insurance", "Salary"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch transactions from the API on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5277/api/transactions', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (response.ok) {
          const formattedData = data.map(({ userId, ...t }) => ({
            ...t,
            date: t.date.split('T')[0]
          }));
          setTransactions(formattedData);
        } else {
          toast.error('Failed to fetch transactions');
        }
      } catch (error) {
        toast.error('An error occurred.');
      }
    };

    fetchTransactions();
  }, []);

  // Update filtered transactions based on search query
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    if (searchQuery) {
      setFilteredTransactions(
        transactions.filter(
          (t) =>
            t.date.toString().includes(searchQuery) ||
            t.type.toLowerCase().includes(searchQuery) ||
            t.category.toLowerCase().includes(searchQuery) ||
            t.amount.toString().includes(searchQuery) ||
            t.method.toLowerCase().includes(searchQuery) ||
            t.status.toLowerCase().includes(searchQuery) ||
            t.note?.toLowerCase().includes(searchQuery)
        )
      );
    } else {
      setFilteredTransactions(transactions);
    }

    setCurrentPage(1);

  }, [transactions, location.search]);

  // Toggle the add/edit transaction popup
  const toggleAddTransactionPopup = () => {
    setIsAddTransactionPopupOpen(!isAddTransactionPopupOpen);
    setNewTransaction({ id: null, date: '', type: '', category: '', amount: '', method: '', status: '', note: '' });
  };

  // Handle adding or editing a transaction
  const handleAddOrEditTransaction = async () => {
    if (!newTransaction.date || !newTransaction.type || !newTransaction.category || !newTransaction.amount || !newTransaction.method || !newTransaction.status) {
      toast.error("All fields except note are required");
      return;
    }

    const url = newTransaction.id
      ? `http://localhost:5277/api/transactions/${newTransaction.id}`
      : "http://localhost:5277/api/transactions";
    const method = newTransaction.id ? "PUT" : "POST";

    const formattedDate = new Date(newTransaction.date).toISOString();

    const transactionPayload = {
      ...newTransaction,
      date: formattedDate
    };
    if (!newTransaction.id) delete transactionPayload.id;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionPayload),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        if (newTransaction.id) {
          setTransactions(transactions.map((t) => (t.id === newTransaction.id ? data : t)));
          toast.success("Transaction updated successfully");
        } else {
          setTransactions([...transactions, data]);
          toast.success("Transaction added successfully");
        }
        setIsAddTransactionPopupOpen(false);
        setNewTransaction({ id: null, date: "", type: "", category: "", amount: "", method: "", status: "", note: "" });
      } else {
        toast.error(data?.message || "Failed to process transaction");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:5277/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success('Transaction deleted successfully');
      } else {
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      toast.error('An error occurred.');
    }
  };

  // Handle input changes for the transaction form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setNewTransaction((prev) => ({ ...prev, category: "custom" }));
      setCustomCategory("");
    } else {
      setNewTransaction((prev) => ({ ...prev, category: value }));
    }
  };

  // Handle custom category input
  const handleCustomCategoryChange = (e) => {
    let value = e.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15);
    value = value.charAt(0).toUpperCase() + value.slice(1);
    setCustomCategory(value);
    setNewTransaction(prev => ({ ...prev, category: value }));
  };

  // Open the edit transaction popup with pre-filled data
  const handleEditTransaction = (transaction) => {
    setNewTransaction(transaction);
    setIsAddTransactionPopupOpen(true);
  };

  // Calculate pagination details
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Handle page change for pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 3;
    const sideButtons = Math.floor(maxButtons / 2);

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= sideButtons + 1) {
        // Near start: 1 2 3 ... n
        for (let i = 1; i <= maxButtons; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - sideButtons) {
        // Near end: 1 ... (n-2) (n-1) n
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - maxButtons + 1; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: 1 ... x x+1 x+2 ... n
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-3 space-y-6 h-full w-full bg-gray-100 dark:bg-gray-700">

      {/* Add/Edit Transaction Popup */}
      {isAddTransactionPopupOpen && (
        <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-80 flex items-center text-center justify-center">
          <div className="bg-white dark:bg-gray-700 dark:text-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center">{newTransaction.id ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="date" className="font-medium text-left">Date*</label>
                <input id="date" type="date" name="date" value={newTransaction.date} onChange={handleInputChange} className="col-span-2 p-2 border border-gray-300 rounded-md w-full" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="type" className="font-medium text-left">Type*</label>
                <select id="type" name="type" value={newTransaction.type} onChange={handleInputChange} className="col-span-2 dark:bg-gray-700 p-2 border border-gray-300 rounded-md w-full">
                  <option value="">Select Type</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="category" className="font-medium text-left">Category*</label>
                <select id="category" name="category" value={newTransaction.category} onChange={handleCategoryChange} className="col-span-2 dark:bg-gray-700 p-2 border border-gray-300 rounded-md w-full">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="custom">Add New</option>
                </select>
              </div>
              {(newTransaction.category === "custom" || customCategory) && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="custom-category" className="font-medium text-left">New Category *:</label>
                  <input id="custom-category" name="category" type="text" value={customCategory} onChange={handleCustomCategoryChange} placeholder="Enter new category" className="col-span-2 p-2 border border-gray-300 rounded-md w-full" />
                </div>
              )}
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="amount" className="font-medium text-left">Amount*</label>
                <div className="col-span-2 flex items-center border border-gray-300 rounded-md p-2 w-full">
                  <span className="mr-2">$</span>
                  <input id="amount" type="number" name="amount" value={newTransaction.amount} onChange={handleInputChange} placeholder="Amount" className="w-full outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="method" className="font-medium text-left">Payment Method*</label>
                <select id="method" name="method" value={newTransaction.method} onChange={handleInputChange} className="col-span-2 dark:bg-gray-700 p-2 border border-gray-300 rounded-md w-full">
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="crypto">Crypto</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="status" className="font-medium text-left">Status*</label>
                <select id="status" name="status" value={newTransaction.status} onChange={handleInputChange} className="col-span-2 dark:bg-gray-700 p-2 border border-gray-300 rounded-md w-full">
                  <option value="">Select Status</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="awaiting">Awaiting</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="note" className="font-medium text-left">Note</label>
                <textarea id="note" name="note" value={newTransaction.note} onChange={handleInputChange} maxLength={100} placeholder="Optional note" className="col-span-2 p-2 border border-gray-300 rounded-md w-full"></textarea>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={handleAddOrEditTransaction} className={`${newTransaction.id ? "bg-blue-500 hover:bg-blue-400" : "bg-green-500 hover:bg-green-400"} text-white p-2 cursor-pointer rounded-md`}>{newTransaction.id ? 'Edit Transaction' : 'Add Transaction'}</button>
                <button onClick={toggleAddTransactionPopup} className="bg-red-500 hover:bg-red-400 text-white p-2 cursor-pointer rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="bg-white shadow-md dark:bg-gray-800 dark:text-white p-6 rounded-lg">
        {/* Header with Add Transaction Button */}
        <div className="flex flex-wrap items-center mb-4">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <button onClick={toggleAddTransactionPopup} className="bg-gray-800 dark:bg-gray-700 ml-auto mt-2 sm:mt-0 hover:bg-gray-600 text-white p-2 py-3 cursor-pointer rounded-md">+ Add Transaction</button>
        </div>
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="hidden sm:table min-w-full text-center border-collapse">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Method</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Note</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr className="hover:bg-gray-100 dark:hover:bg-gray-700" key={transaction.id}>
                  <td className="py-2 px-4 border-b">{transaction.date}</td>
                  <td className="py-2 px-4 border-b">{transaction.type}</td>
                  <td className="py-2 px-4 border-b">{transaction.category.toLowerCase()}</td>
                  <td className="py-2 px-4 border-b">${transaction.amount}</td>
                  <td className="py-2 px-4 border-b">{transaction.method}</td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-sm font-medium ${transaction.status === "completed"
                        ? "bg-green-500"
                        : transaction.status === "awaiting"
                          ? "bg-blue-500"
                          : "bg-red-500"
                        }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{transaction.note.length > 30 ? transaction.note.slice(0, 30) + "..." : transaction.note}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleEditTransaction(transaction)} className="bg-blue-500 px-3 hover:bg-blue-400 cursor-pointer text-white p-1 rounded-md">Edit</button>
                    <button onClick={() => handleDeleteTransaction(transaction.id)} className="bg-red-500 hover:bg-red-400 cursor-pointer text-white p-1 rounded-md ml-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sm:hidden space-y-4">
            {currentTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{transaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{transaction.category.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>${transaction.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Method:</span>
                  <span>{transaction.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm font-medium ${transaction.status === "completed"
                      ? "bg-green-500"
                      : transaction.status === "awaiting"
                        ? "bg-blue-500"
                        : "bg-red-500"
                      }`}
                  >
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Note:</span>
                  <span>{transaction.note.length > 30 ? transaction.note.slice(0, 30) + "..." : transaction.note}</span>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleEditTransaction(transaction)} className="bg-blue-500 px-3 hover:bg-blue-400 cursor-pointer text-white p-1 rounded-md">Edit</button>
                  <button onClick={() => handleDeleteTransaction(transaction.id)} className="bg-red-500 hover:bg-red-400 cursor-pointer text-white p-1 rounded-md">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap justify-center items-center mt-4 space-x-2">
          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500"> ... </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`p-2 rounded-md ${currentPage === page ? "bg-gray-600 text-white" : " cursor-pointer hover:bg-gray-400"}`}
              >
                {page}
              </button>
            )
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Transactions;