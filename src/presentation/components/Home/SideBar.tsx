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

            const [issuesFullRes, booksFullRes] = await Promise.all([
                apiClient.get('/Issues'),
                apiClient.get('/Books'),
            ]);

            const issues: any[] = issuesFullRes.data;
            const books: any[] = booksFullRes.data;

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

            const popularList = Object.entries(issueCount)
                .map(([bookId, count]) => {
                    const book = books.find((b) => b.id === parseInt(bookId));
                    return {
                        title: book?.title || 'Unknown',
                        author: book?.authorId ? `Author ID: ${book.authorId}` : 'Unknown',
                        timesIssued: count,
                    };
                })
                .sort((a, b) => b.timesIssued - a.timesIssued)
                .slice(0, 5);
            setStats(prev => ({
                ...prev,
                totalBooks: bookRes.data.total,
                booksIssued: issuesRes.data.total,
                activeMembers: studentRes.data.total,
                overdueBooks: overdueList.length
            }));

            const activities: RecentActivity[] = [];

            books.forEach(book => {
                const addedDate = new Date(book.createdAt || book.addedDate || '');
                const diffDays = (now.getTime() - addedDate.getTime()) / (1000 * 3600 * 24);
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `book-added-${book.id}`,
                        type: 'book_added',
                        title: book.title,
                        subtitle: `Added ${Math.floor(diffDays)} days ago`,
                        timestamp: addedDate.toLocaleDateString('en-GB'),
                    });
                }
            });

            const studentsRes = await apiClient.get('/Students');
            studentsRes.data.forEach((student: any) => {
                const joinedDate = new Date(student.createdAt || student.registeredAt || '');
                const diffDays = (now.getTime() - joinedDate.getTime()) / (1000 * 3600 * 24);
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `member-${student.id}`,
                        type: 'new_member',
                        title: student.name,
                        subtitle: `Joined ${Math.floor(diffDays)} days ago`,
                        timestamp: joinedDate.toLocaleDateString('en-GB'),
                    });
                }
            });

            issues.forEach(issue => {
                const issuedDate = new Date(issue.issueDate);
                const diffDays = (now.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);
                if (!isNaN(diffDays) && diffDays <= 30) {
                    activities.push({
                        id: `issue-${issue.id}`,
                        type: 'book_issued',
                        title: `Book ID ${issue.bookId}`,
                        subtitle: `Issued to Student ${issue.studentId}`,
                        timestamp: issuedDate.toLocaleDateString('en-GB'),
                    });
                }
            });

            issues.forEach(issue => {
                if (issue.returnDate) {
                    const returnDt = new Date(issue.returnDate);
                    const diffDays = (now.getTime() - returnDt.getTime()) / (1000 * 3600 * 24);
                    if (!isNaN(diffDays) && diffDays <= 30) {
                        activities.push({
                            id: `returned-${issue.id}`,
                            type: 'book_returned',
                            title: `Book ID ${issue.bookId}`,
                            subtitle: `Returned by Student ${issue.studentId}`,
                            timestamp: returnDt.toLocaleDateString('en-GB'),
                        });
                    }
                }
            });

            activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setRecentActivity(activities.slice(0, 5));

            setPopularBooks(
                popularList.map((book, index) => ({
                    id: (index + 1).toString(),
                    title: book.title,
                    author: book.author,
                    genre: '—',
                    timesIssued: book.timesIssued,
                }))
            );

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
        { id: 'Student', label: 'Student', icon: Users },
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
                        <p className="text-gray-500 mt-1">Welcome to the Library management system</p>
                    </div>

                    {/* Dashboard Content */}
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
                                <div className="text-xs text-green-600 mt-2">{stats.booksIssued}due</div>
                            </div>

                            {/* Overdue Books */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Overdue Books</span>
                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overdueBooks}</div>
                                <div className="text-sm text-gray-500">Need Attention</div>
                            </div>
                        </div>

                        {/* Recent Activity & Popular Books */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                                    <h2 className="text-lg font-semibold">Recent Activity</h2>
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
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {popularBooks.map((book) => (
                                        <div key={book.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{book.title}</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {book.author && `${book.author}`}
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
                </>
            );
        }

        if (activeMenu === 'Books') {
            return <BooksManagement />;
        } else if (activeMenu === 'Student') {
            return <StudentManagement />
        } else if (activeMenu === 'Transactions') {
            return < TransactionManagement />
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
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-all ${isActive
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