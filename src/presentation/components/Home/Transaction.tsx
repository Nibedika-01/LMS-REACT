import React, { useState } from 'react';
import { BookOpen, Calendar, User, AlertCircle } from 'lucide-react';

interface ActiveLoan {
  id: string;
  memberName: string;
  memberId: string;
  bookTitle: string;
  bookIsbn: string;
  issueDate: string;
  dueDate: string;
  status: 'On Time' | 'Due Soon' | 'Overdue';
  daysRemaining: number;
}

const TransactionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'loans'>('checkout');
  
  // Form state
  const [formData, setFormData] = useState({
    memberId: '',
    bookIsbn: '',
    action: 'Book Checkout'
  });

  // Mock active loans data
  const [activeLoans] = useState<ActiveLoan[]>([
    {
      id: '1',
      memberName: 'Anish Giri',
      memberId: 'M001',
      bookTitle: 'The Great Gatsby',
      bookIsbn: '978-0-7432-7356-5',
      issueDate: '2025-10-15',
      dueDate: '2025-11-15',
      status: 'On Time',
      daysRemaining: 15
    },
    {
      id: '2',
      memberName: 'Pooja Sharma',
      memberId: 'M002',
      bookTitle: 'To Kill a Mockingbird',
      bookIsbn: '978-0-06-112008-4',
      issueDate: '2025-10-20',
      dueDate: '2025-11-20',
      status: 'On Time',
      daysRemaining: 20
    },
    {
      id: '3',
      memberName: 'Samiksha Shakya',
      memberId: 'M003',
      bookTitle: 'Introduction to Algorithms',
      bookIsbn: '978-0-7432-7356-5',
      issueDate: '2025-10-01',
      dueDate: '2025-11-05',
      status: 'Due Soon',
      daysRemaining: 5
    },
    {
      id: '4',
      memberName: 'Milan Magar',
      memberId: 'M005',
      bookTitle: 'Clean Code',
      bookIsbn: '978-0-1323-5088-4',
      issueDate: '2025-09-20',
      dueDate: '2025-10-25',
      status: 'Overdue',
      daysRemaining: -6
    },
    {
      id: '5',
      memberName: 'Tanvir Alam',
      memberId: 'M006',
      bookTitle: 'The Hobbit',
      bookIsbn: '978-0-3453-3968-3',
      issueDate: '2025-10-25',
      dueDate: '2025-11-25',
      status: 'On Time',
      daysRemaining: 25
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProcessTransaction = async () => {
    console.log('Processing transaction:', formData);
    // TODO: Connect to backend API
    // const response = await fetch('/api/transactions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    
    alert('Transaction processed successfully!');
    handleResetForm();
  };

  const handleResetForm = () => {
    setFormData({
      memberId: '',
      bookIsbn: '',
      action: 'Book Checkout'
    });
  };

  const handleReturnBook = async (loanId: string) => {
    console.log('Returning book for loan:', loanId);
    // TODO: Connect to backend API
    // const response = await fetch(`/api/transactions/${loanId}/return`, {
    //   method: 'POST'
    // });
    
    alert('Book returned successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
        return 'bg-green-100 text-green-700';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Overdue') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-500 mt-1">Manage book checkouts, returns, and track overdue items</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-4 font-medium transition-colors relative ${
              activeTab === 'checkout'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Book Checkout
            {activeTab === 'checkout' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-4 font-medium transition-colors relative ${
              activeTab === 'loans'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Loans
            {activeTab === 'loans' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'checkout' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">New Book Transaction</h2>
              </div>
              <p className="text-gray-500">Issue or return books to library members</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Member ID or Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member ID or Name
                  </label>
                  <input
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    placeholder="Enter member ID or search by name...."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Book ISBN or Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book ISBN or Title
                  </label>
                  <input
                    type="text"
                    name="bookIsbn"
                    value={formData.bookIsbn}
                    onChange={handleInputChange}
                    placeholder="Enter ISBN or search by title...."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    name="action"
                    value={formData.action}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="Book Checkout">Book Checkout</option>
                    <option value="Book Return">Book Return</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleProcessTransaction}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Process Transaction
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              {/* Right Column - Information Panels */}
              <div className="space-y-4">
                {/* Member Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Member Information</h3>
                  <p className="text-sm text-gray-500">Select a member to view their details</p>
                </div>

                {/* Book Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Book Information</h3>
                  <p className="text-sm text-gray-500">Select a book to view its details</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-lg font-semibold">Active Loans</h2>
              <p className="text-sm text-blue-100">Currently issued books and their due dates</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Book Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Days Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{loan.memberName}</div>
                            <div className="text-xs text-gray-500">{loan.memberId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{loan.bookTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{loan.bookIsbn}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {loan.issueDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {loan.dueDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded flex items-center gap-1 w-fit ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          loan.daysRemaining < 0 
                            ? 'text-red-600' 
                            : loan.daysRemaining <= 7 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`}>
                          {loan.daysRemaining < 0 
                            ? `${Math.abs(loan.daysRemaining)} days overdue` 
                            : `${loan.daysRemaining} days`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Return Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{activeLoans.length}</div>
                <div className="text-xs text-gray-500">Total Active Loans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activeLoans.filter(l => l.status === 'On Time').length}
                </div>
                <div className="text-xs text-gray-500">On Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {activeLoans.filter(l => l.status === 'Due Soon').length}
                </div>
                <div className="text-xs text-gray-500">Due Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {activeLoans.filter(l => l.status === 'Overdue').length}
                </div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;