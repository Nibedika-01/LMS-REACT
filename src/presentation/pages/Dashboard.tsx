import React, { useState, useEffect } from 'react';
import { BookOpen, Users, AlertCircle, TrendingUp, UserPlus, BookPlus, ArrowLeft } from 'lucide-react';

// Types
interface DashboardStats {
  totalBooks: number;
  booksIssued: number;
  activeMembers: number;
  overdueBooks: number;
  booksAddedThisMonth: number;
  membersAddedThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'book_returned' | 'new_member' | 'book_issued' | 'book_added';
  title: string;
  subtitle: string;
  timestamp: string;
}

interface PopularBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  timesIssued: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    booksIssued: 0,
    activeMembers: 0,
    overdueBooks: 0,
    booksAddedThisMonth: 0,
    membersAddedThisMonth: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual API base URL
      const API_BASE = 'https://your-api-url.com/api';
      
      // Fetch dashboard statistics
      const statsResponse = await fetch(`${API_BASE}/dashboard/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent activity
      const activityResponse = await fetch(`${API_BASE}/dashboard/recent-activity`);
      const activityData = await activityResponse.json();
      setRecentActivity(activityData);

      // Fetch popular books
      const booksResponse = await fetch(`${API_BASE}/dashboard/popular-books`);
      const booksData = await booksResponse.json();
      setPopularBooks(booksData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for demo
      setStats({
        totalBooks: 1484,
        booksIssued: 182,
        activeMembers: 759,
        overdueBooks: 9,
        booksAddedThisMonth: 24,
        membersAddedThisMonth: 15
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'book_returned',
          title: 'The Great Gatsby',
          subtitle: 'Ram Shrestha',
          timestamp: '40 min ago'
        },
        {
          id: '2',
          type: 'new_member',
          title: 'David John',
          subtitle: 'Student • BCA 4th Semester',
          timestamp: '2 hours ago'
        },
        {
          id: '3',
          type: 'book_issued',
          title: 'To Kill a Mockingbird',
          subtitle: 'Isha Gupta',
          timestamp: '3 hours ago'
        },
        {
          id: '4',
          type: 'book_added',
          title: '1984',
          subtitle: 'by George Orwell • Librarian',
          timestamp: '4 hours ago'
        }
      ]);

      setPopularBooks([
        { id: '1', title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', timesIssued: 15 },
        { id: '2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', genre: 'Computer Science', timesIssued: 14 },
        { id: '3', title: 'Harry Potter Series', author: 'J.K. Rowling', genre: 'Fantasy', timesIssued: 13 },
        { id: '4', title: 'The Da Vinci Code', author: 'Dan Brown', genre: 'Mystery', timesIssued: 11 },
        { id: '5', title: 'Mining Made Simple', author: '', genre: 'Educational', timesIssued: 9 }
      ]);
      
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'book_returned':
        return <ArrowLeft className="w-4 h-4" />;
      case 'new_member':
        return <UserPlus className="w-4 h-4" />;
      case 'book_issued':
        return <BookOpen className="w-4 h-4" />;
      case 'book_added':
        return <BookPlus className="w-4 h-4" />;
    }
  };

  const getActivityLabel = (type: RecentActivity['type']) => {
    switch (type) {
      case 'book_returned':
        return 'Book Returned';
      case 'new_member':
        return 'New Member';
      case 'book_issued':
        return 'Book Issued';
      case 'book_added':
        return 'Book Added';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the Library management system</p>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Books */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Total Books</span>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBooks}</div>
            <div className="text-sm text-gray-500">Available in library</div>
            <div className="text-xs text-green-600 mt-2">+ {stats.booksAddedThisMonth} this month</div>
          </div>

          {/* Active Members */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Active Members</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeMembers}</div>
            <div className="text-sm text-gray-500">Registered members</div>
            <div className="text-xs text-green-600 mt-2">+ {stats.membersAddedThisMonth} this month</div>
          </div>

          {/* Books Issued */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Book Issued</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.booksIssued}</div>
            <div className="text-sm text-gray-500">Currently checked out</div>
            <div className="text-xs text-green-600 mt-2">23 due soon</div>
          </div>

          {/* Overdue Books */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Overdue Books</span>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overdueBooks}</div>
            <div className="text-sm text-gray-500">Need Attention</div>
            <div className="text-xs text-red-600 mt-2">Return reminder sent</div>
          </div>
        </div>

        {/* Recent Activity & Popular Books */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-sm text-blue-100">Latest library transactions and updates</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-gray-100 rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {getActivityLabel(activity.type)}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">{activity.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{activity.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Books */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Popular Books</h2>
              <p className="text-sm text-blue-100">Most issued books this month</p>
            </div>
            <div className="divide-y divide-gray-100">
              {popularBooks.map((book) => (
                <div key={book.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {book.author && `by ${book.author} • `}{book.genre}
                      </div>
                    </div>
                    <div className="ml-4 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full whitespace-nowrap">
                      {book.timesIssued} times
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;