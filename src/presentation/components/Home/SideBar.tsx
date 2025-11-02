import React, { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import BooksManagement from './Book';
import StudentManagement from './Student';
import ReportsAnalytics from './Report';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Users, AlertCircle, TrendingUp, UserPlus, BookPlus, ArrowLeft, Home, RefreshCw, BarChart3, LogOut } from 'lucide-react';
import TransactionManagement from './Transaction';

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
    sortDate: Date;
}

interface PopularBook {
    id: string;
    title: string;
    author: string;
    timesIssued: number;
}

const LibraryManagementSystem: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [stats, setStats] = useState<DashboardStats>({
        totalBooks: 0,
        booksIssued: 0,
        activeMembers: 0,
        overdueBooks: 0,
        booksAddedThisMonth: 0,
        membersAddedThisMonth: 0
    });

    const navigate = useNavigate();
    const { logout } = useAuth();
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeMenu === 'Dashboard') {
            fetchDashboardData();
        }
    }, [activeMenu]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const bookRes = await apiClient.get('/Books/total');
            const issuesRes = await apiClient.get('/Issues/total');
            const studentRes = await apiClient.get('/Students/total');

            const [issuesFullRes, booksFullRes, studentsRes] = await Promise.all([
                apiClient.get('/Issues'),
                apiClient.get('/Books'),
                apiClient.get('/Students'),
            ]);

            const issues: any[] = issuesFullRes.data;
            const books: any[] = booksFullRes.data;
            const students: any[] = studentsRes.data;

            const now = new Date();
            const overdueList: any[] = [];
            
            issues.forEach(issue => {
                if (issue.returnDate) return;

                const issueDate = new Date(issue.issueDate);
                const dueDate = new Date(issueDate);
                dueDate.setDate(dueDate.getDate() + 30);

                if (now > dueDate) {
                    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                    overdueList.push({
                        id: issue.id,
                        title: issue.bookTitle || 'Unknown Book',
                        member: issue.studentName || 'Unknown Student',
                        daysOverdue,
                        fine: daysOverdue * 10,
                    });
                }
            });
            overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);
            
            const issueCount: { [bookId: number]: number } = {};
            issues.forEach((issue) => {
                issueCount[issue.bookId] = (issueCount[issue.bookId] || 0) + 1;
            });

            //issues recent activities
            const popularList = Object.entries(issueCount)
                .map(([bookId, count]) => {
                    const book = books.find((b) => b.id === parseInt(bookId));
                    return {
                        id: bookId,
                        title: book?.title || 'Unknown',
                        author: book?.authorId ? `Author ID: ${book.authorId}` : 'Unknown',
                        timesIssued: count,
                    };
                })
                .sort((a, b) => b.timesIssued - a.timesIssued)
                .slice(0, 5);
                
            setStats({
                totalBooks: bookRes.data.total,
                booksIssued: issuesRes.data.total,
                activeMembers: studentRes.data.total,
                overdueBooks: overdueList.length,
                booksAddedThisMonth: 0,
                membersAddedThisMonth: 0
            });

            //book recent activities
            const activities: RecentActivity[] = [];
            books.forEach(book => {
                if (!book.createdAt && !book.addedDate) return;
                
                const addedDate = new Date(book.createdAt || book.addedDate || '');
                const diffDays = (now.getTime() - addedDate.getTime()) / (1000 * 3600 * 24);
                
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `book-added-${book.id}`,
                        type: 'book_added',
                        title: book.title || 'Unknown Book',
                        subtitle: `Added ${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''} ago`,
                        timestamp: addedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        sortDate: addedDate
                    });
                }
            });

            //student recent activities
            students.forEach((student: any) => {
                if (!student.createdAt && !student.registeredAt) return;
                
                const joinedDate = new Date(student.createdAt || student.registeredAt || '');
                const diffDays = (now.getTime() - joinedDate.getTime()) / (1000 * 3600 * 24);
                
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `member-${student.id}`,
                        type: 'new_member',
                        title: student.name || 'Unknown Member',
                        subtitle: `Joined ${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''} ago`,
                        timestamp: joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        sortDate: joinedDate
                    });
                }
            });

            //issued recent activities
            issues.forEach(issue => {
                const issuedDate = new Date(issue.issueDate);
                const diffDays = (now.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);
                
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `issue-${issue.id}`,
                        type: 'book_issued',
                        title: issue.bookTitle || `Book ID ${issue.bookId}`,
                        subtitle: `Issued to ${issue.studentName || `Student ${issue.studentId}`}`,
                        timestamp: issuedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        sortDate: issuedDate
                    });
                }
            });

            //returned recent activities
            issues.forEach(issue => {
                if (issue.returnDate) {
                    const returnDate = new Date(issue.returnDate);
                    const diffDays = (now.getTime() - returnDate.getTime()) / (1000 * 3600 * 24);
                    
                    if (!isNaN(diffDays) && diffDays <= 30) {
                        activities.push({
                            id: `returned-${issue.id}`,
                            type: 'book_returned',
                            title: issue.bookTitle || `Book ID ${issue.bookId}`,
                            subtitle: `Returned by ${issue.studentName || `Student ${issue.studentId}`}`,
                            timestamp: returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            sortDate: returnDate
                        });
                    }
                }
            });

            //sort activities by date
            activities.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
            setRecentActivity(activities.slice(0, 10));

            setPopularBooks(popularList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'Dashboard', label: 'Dashboard', icon: Home },
        { id: 'Transactions', label: 'Transactions', icon: RefreshCw },
        { id: 'Books', label: 'Books', icon: BookOpen },
        { id: 'Student', label: 'Students', icon: Users },
        { id: 'Reports', label: 'Reports', icon: BarChart3 },
    ];

    const logoutClicked = () => {
        logout();
        navigate('/');
    }

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

    const getActivityColor = (type: RecentActivity['type']) => {
        switch (type) {
            case 'book_returned':
                return 'bg-green-100 text-green-600';
            case 'new_member':
                return 'bg-blue-100 text-blue-600';
            case 'book_issued':
                return 'bg-purple-100 text-purple-600';
            case 'book_added':
                return 'bg-orange-100 text-orange-600';
        }
    };

    const renderContent = () => {
        if (activeMenu === 'Dashboard') {
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
                <>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome to the Library Management System</p>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Books */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Total Books</span>
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBooks}</div>
                                <div className="text-sm text-gray-500">Available in library</div>
                            </div>

                            {/* Active Members */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Active Members</span>
                                    <Users className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeMembers}</div>
                                <div className="text-sm text-gray-500">Registered members</div>
                            </div>

                            {/* Books Issued */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Books Issued</span>
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.booksIssued}</div>
                                <div className="text-sm text-gray-500">Currently checked out</div>
                            </div>

                            {/* Overdue Books */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Overdue Books</span>
                                    <AlertCircle className={`w-5 h-5 ${stats.overdueBooks > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                                </div>
                                <div className={`text-3xl font-bold mb-1 ${stats.overdueBooks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {stats.overdueBooks}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {stats.overdueBooks > 0 ? 'Need attention' : 'All clear'}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity & Popular Books */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {recentActivity.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-500">
                                            No recent activity
                                        </div>
                                    ) : (
                                        recentActivity.map((activity) => (
                                            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 p-2 rounded-full ${getActivityColor(activity.type)}`}>
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
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Popular Books */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                                    <h2 className="text-lg font-semibold">Popular Books</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {popularBooks.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-500">
                                            No data available
                                        </div>
                                    ) : (
                                        popularBooks.map((book) => (
                                            <div key={book.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate">{book.title}</div>
                                                        <div className="text-sm text-gray-500 mt-1 truncate">
                                                            {book.author}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full whitespace-nowrap">
                                                        {book.timesIssued} {book.timesIssued === 1 ? 'time' : 'times'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (activeMenu === 'Books') {
            return <BooksManagement />;
        } else if (activeMenu === 'Student') {
            return <StudentManagement />
        } else if (activeMenu === 'Transactions') {
            return <TransactionManagement />
        } else if (activeMenu === 'Reports') {
            return <ReportsAnalytics />;
        }

    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-blue-600 min-h-screen flex flex-col">
                {/* Logo Section */}
                <div className="px-6 py-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-8 h-8" />
                        <div>
                            <div className="text-lg font-bold tracking-wide">LIBRARY</div>
                            <div className="text-xs font-medium opacity-90">MANAGEMENT SYSTEM</div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveMenu(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-all ${
                                    isActive
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-white hover:bg-blue-700'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="px-4 pb-6">
                    <button
                        onClick={() => logoutClicked()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
};

export default LibraryManagementSystem;