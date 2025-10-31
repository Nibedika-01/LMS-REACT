import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';

const ReportsAnalytics: React.FC = () => {
  // Monthly Checkout Trends Data
  const checkoutData = [
    { month: 'Jan', checkouts: 145, returns: 132 },
    { month: 'Feb', checkouts: 162, returns: 148 },
    { month: 'Mar', checkouts: 178, returns: 165 },
    { month: 'Apr', checkouts: 195, returns: 182 },
    { month: 'May', checkouts: 168, returns: 175 },
    { month: 'Jun', checkouts: 152, returns: 163 }
  ];

  // Book Category Distribution Data
  const categoryData = [
    { name: 'Fiction', value: 35, color: '#9333ea' },
    { name: 'Technology', value: 20, color: '#4ade80' },
    { name: 'Educational', value: 15, color: '#facc15' },
    { name: 'Mystery', value: 12, color: '#fb923c' },
    { name: 'History', value: 10, color: '#06b6d4' },
    { name: 'Other', value: 8, color: '#22d3ee' }
  ];

  // Membership Growth Trends Data
  const membershipData = [
    { month: 'Jan', students: 120 },
    { month: 'Feb', students: 135 },
    { month: 'Mar', students: 142 },
    { month: 'Apr', students: 158 },
    { month: 'May', students: 165 },
    { month: 'Jun', students: 172 },
    { month: 'Jul', students: 178 },
    { month: 'Aug', students: 162 },
    { month: 'Sep', students: 148 },
    { month: 'Oct', students: 132 }
  ];

  // Overdue Books Data
  const overdueBooks = [
    { id: 1, title: 'Introduction to Algorithms', member: 'Milan Magar', daysOverdue: 6, fine: 60 },
    { id: 2, title: 'The Alchemist', member: 'Rohan Bhandari', daysOverdue: 3, fine: 30 },
    { id: 3, title: 'Clean Code', member: 'Anish Giri', daysOverdue: 2, fine: 20 }
  ];

  // Popular Books Data
  const popularBooks = [
    { rank: 1, title: 'The Alchemist', author: 'Paulo Coelho', issues: 45 },
    { rank: 2, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', issues: 38 },
    { rank: 3, title: 'Harry Potter Series', author: 'J.K. Rowling', issues: 35 },
    { rank: 4, title: 'The Da Vinci Code', author: 'Dan Brown', issues: 32 },
    { rank: 5, title: 'Clean Code', author: 'Robert C Martin', issues: 28 }
  ];

  // Member Activity Data
  const memberActivity = [
    { member: 'Anish Giri', booksIssued: 12, lastActive: '2 hours ago' },
    { member: 'Pooja Sharma', booksIssued: 8, lastActive: '1 day ago' },
    { member: 'Samiksha Shakya', booksIssued: 15, lastActive: '3 hours ago' },
    { member: 'Tanvir Alam', booksIssued: 6, lastActive: '5 days ago' },
    { member: 'Milan Magar', booksIssued: 10, lastActive: '1 week ago' }
  ];

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.month}</p>
          <p className="text-sm text-blue-600">Checkouts: {payload[0].value}</p>
          <p className="text-sm text-green-600">Returns: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value}% of collection</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.month}</p>
          <p className="text-sm text-purple-600">Students: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Library performance insights and statistics</p>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Top Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Checkout Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Monthly Checkout Trends</h2>
            <p className="text-sm text-gray-500 mb-6">Book checkouts and returns over time</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={checkoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar dataKey="checkouts" fill="#60a5fa" name="Checkouts" radius={[8, 8, 0, 0]} />
                <Bar dataKey="returns" fill="#4ade80" name="Returns" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Book Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Book Category Distribution</h2>
            <p className="text-sm text-gray-500 mb-6">Popular categories in the collection</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Growth Trends - Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Membership Growth Trends</h2>
          <p className="text-sm text-gray-500 mb-6">Member registration by type over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={membershipData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#a855f7" 
                strokeWidth={2}
                name="Students"
                dot={{ fill: '#a855f7', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overdue Books Report */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Overdue Books Report</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {overdueBooks.map((book) => (
                  <div key={book.id} className="p-3 bg-red-50 rounded-lg border border-red-100 hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-gray-900">{book.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{book.member}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-red-600 font-medium">{book.daysOverdue} days overdue</span>
                      <span className="text-xs text-gray-900 font-semibold">Rs. {book.fine}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total Fine:</span>
                  <span className="text-lg font-bold text-red-600">
                    Rs. {overdueBooks.reduce((sum, book) => sum + book.fine, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Books */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Popular Books</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {popularBooks.map((book) => (
                  <div key={book.rank} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {book.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{book.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{book.author}</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">{book.issues} issues</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Member Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Member Activity</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {memberActivity.map((member, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{member.member}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {member.booksIssued} books issued
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last active: {member.lastActive}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;