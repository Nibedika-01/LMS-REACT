import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import apiClient from '../../../infrastructure/api/apiClient';

interface Issue {
  id: number;
  bookId: number;
  bookTitle: string;
  studentId: number;
  studentName: string;
  issueDate: string;
  returnDate: string | null;
}

interface Book {
  id: number;
  title: string;
  authorId: number;
  genre: string;
  isAvailable: boolean;
}

interface Student {
  id: number;
  name: string;
}

interface OverdueBook {
  id: number;
  title: string;
  member: string;
  daysOverdue: number;
  fine: number;
}

interface PopularBook {
  rank: number;
  title: string;
  author: string;
  issues: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const ReportsAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [checkoutData, setCheckoutData] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [issuesRes, booksRes, studentsRes] = await Promise.all([
        apiClient.get<Issue[]>('/Issues'),
        apiClient.get<Book[]>('/Books'),
        apiClient.get<Student[]>('/Students')
      ]);

      const issues = issuesRes.data;
      const books = booksRes.data;
      const students = studentsRes.data;

      setTotalBooks(books.length);
      setTotalStudents(students.length);
      setTotalIssues(issues.filter(i => !i.returnDate).length);

      calculateOverdueBooks(issues);
      calculatePopularBooks(issues, books);
      calculateCategoryDistribution(books);
      generateCheckoutTrends(issues);
      generateMembershipTrends(students);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverdueBooks = (issues: Issue[]) => {
    const now = new Date();
    const overdue: OverdueBook[] = [];

    issues.forEach(issue => {
      if (!issue.returnDate) {
        const issueDate = new Date(issue.issueDate);
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30); 

        if (now > dueDate) {
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const fine = daysOverdue * 10; 
          overdue.push({
            id: issue.id,
            title: issue.bookTitle || 'Unknown Book',
            member: issue.studentName || 'Unknown Student',
            daysOverdue,
            fine
          });
        }
      }
    });

    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
    setOverdueBooks(overdue.slice(0, 5)); 
  };

  const calculatePopularBooks = (issues: Issue[], books: Book[]) => {
    const bookIssueCount: { [key: number]: number } = {};
    
    issues.forEach(issue => {
      bookIssueCount[issue.bookId] = (bookIssueCount[issue.bookId] || 0) + 1;
    });

    const popular: PopularBook[] = Object.entries(bookIssueCount)
      .map(([bookId, count]) => {
        const book = books.find(b => b.id === parseInt(bookId));
        return {
          bookId: parseInt(bookId),
          title: book?.title || 'Unknown',
          authorId: book?.authorId || 0,
          issues: count
        };
      })
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 5)
      .map((book, index) => ({
        rank: index + 1,
        title: book.title,
        author: `Author ID: ${book.authorId}`, 
        issues: book.issues
      }));

    setPopularBooks(popular);
  };

  const calculateCategoryDistribution = (books: Book[]) => {
    const genreCount: { [key: string]: number } = {};
    
    books.forEach(book => {
      const genre = book.genre || 'Other';
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    const total = books.length;
    const colors = ['#9333ea', '#4ade80', '#facc15', '#fb923c', '#06b6d4', '#22d3ee', '#f43f5e', '#8b5cf6'];
    
    const distribution: CategoryData[] = Object.entries(genreCount)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories

    setCategoryData(distribution);
  };

  const generateCheckoutTrends = (issues: Issue[]) => {
    const monthlyData: { [key: string]: { checkouts: number; returns: number } } = {};
    
    issues.forEach(issue => {
      const issueMonth = new Date(issue.issueDate).toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[issueMonth]) {
        monthlyData[issueMonth] = { checkouts: 0, returns: 0 };
      }
      
      monthlyData[issueMonth].checkouts++;
      
      if (issue.returnDate) {
        const returnMonth = new Date(issue.returnDate).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[returnMonth]) {
          monthlyData[returnMonth] = { checkouts: 0, returns: 0 };
        }
        monthlyData[returnMonth].returns++;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map(month => ({
      month,
      checkouts: monthlyData[month]?.checkouts || 0,
      returns: monthlyData[month]?.returns || 0
    }));

    setCheckoutData(chartData);
  };

  const generateMembershipTrends = (students: Student[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const data = months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      students: Math.floor(students.length * ((index + 1) / (currentMonth + 1)))
    }));

    setMembershipData(data);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Library performance insights and statistics</p>
      </div>

      {/* Stats Overview */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Books</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalBooks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Loans</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalIssues}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

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
            {categoryData.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Membership Growth Trends - Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Membership Growth Trends</h2>
          <p className="text-sm text-gray-500 mb-6">Student registration over time</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Books Report */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Overdue Books Report</h3>
              </div>
            </div>
            <div className="p-4">
              {overdueBooks.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No overdue books!
                </div>
              )}
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
              {popularBooks.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No book issues yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;