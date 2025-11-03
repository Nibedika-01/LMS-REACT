import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, Printer } from 'lucide-react';
import apiClient from '../../../infrastructure/api/apiClient';

interface Issue {
    id: string;
    studentId: string;
    studentName?: string;
    bookId: string;
    bookTitle?: string;
    issueDate: string;
    returnDate: string | null;
}

interface ActiveLoan {
    id: string;
    studentName: string;
    studentId: string;
    bookTitle: string;
    bookId: string;
    issueDate: string;
    returnDate: string;
    daysRemaining: number;
    status: 'On Time' | 'Due Soon' | 'Overdue';
}

interface TicketData {
    studentId: string;
    studentName: string;
    bookId: string;
    bookTitle: string;
    issueDate: string;
    dueDate: string;
    issueId: string;
}

const TransactionManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'checkout' | 'loans'>('checkout');
    const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        studentId: '',
        bookId: '',
    });

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const issuesRes = await apiClient.get('/Issues');
            const [studentsRes, booksRes] = await Promise.all([
                apiClient.get('/Students'),
                apiClient.get('/Books'),
            ]);
            const studentMap = Object.fromEntries((studentsRes.data as any[]).map(s => [s.id, s.name]));
            const bookMap = Object.fromEntries((booksRes.data as any[]).map(b => [b.id, b.title]));

            const now = new Date();
            const loans: ActiveLoan[] = (issuesRes.data as Issue[])
                .filter(issue => !issue.returnDate)
                .map(issue => {
                    const issueDt = new Date(issue.issueDate);
                    const dueDt = new Date(issueDt);
                    dueDt.setDate(dueDt.getDate() + 30);

                    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const dueMidnight = new Date(dueDt.getFullYear(), dueDt.getMonth(), dueDt.getDate());

                    const diffMs = dueMidnight.getTime() - todayMidnight.getTime();
                    let daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                    let status: ActiveLoan['status'] = 'On Time';
                    if (daysRemaining < 0) {
                        status = 'Overdue';
                    } else if (daysRemaining <= 7) {
                        status = 'Due Soon';
                    }

                    return {
                        id: issue.id,
                        studentId: issue.studentId,
                        studentName: studentMap[issue.studentId] || 'Unknown',
                        bookId: issue.bookId,
                        bookTitle: bookMap[issue.bookId] || 'Unknown',
                        issueDate: issueDt.toLocaleDateString('en-GB'),
                        returnDate: dueDt.toLocaleDateString('en-GB'),
                        daysRemaining: Math.abs(daysRemaining),
                        status,
                    };
                });

            setActiveLoans(loans);
        } catch (err) {
            console.error('Failed to fetch issues:', err);
            alert('Could not load active loans.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        if (activeTab === 'loans') {
            fetchIssues();
        }
    }, [activeTab]);

    const handlePrint = () => {
        window.print();
    };

    const handleProcessTransaction = async () => {
        if (!formData.studentId.trim() || !formData.bookId.trim()) {
            alert('Please fill Student ID and Book ID');
            return;
        }

        const payload = {
            bookId: parseInt(formData.bookId),
            studentId: parseInt(formData.studentId),
            issueDate: new Date().toISOString(),
        }

        try {
            const response = await apiClient.post('/Issues', payload);
            if (response.status === 201 || response.status === 200) {
                // Fetch student and book details for the ticket
                const studentsRes = await apiClient.get('/Students');
                const booksRes = await apiClient.get('/Books');

                const student = (studentsRes.data as any[]).find(s => s.id === parseInt(formData.studentId));
                const book = (booksRes.data as any[]).find(b => b.id === parseInt(formData.bookId));

                const issueDate = new Date();
                const dueDate = new Date(issueDate);
                dueDate.setDate(dueDate.getDate() + 30);

                // Prepare ticket data
                const ticket: TicketData = {
                    studentId: formData.studentId,
                    studentName: student?.name || 'N/A',
                    bookId: formData.bookId,
                    bookTitle: book?.title || 'N/A',
                    issueDate: issueDate.toLocaleDateString('en-GB'),
                    dueDate: dueDate.toLocaleDateString('en-GB'),
                    issueId: response.data.id
                };

                setTicketData(ticket);

                // Wait for state to update, then print
                setTimeout(() => {
                    handlePrint();
                    alert('Book issued successfully! Please check your printer.');
                    handleResetForm();
                    setTicketData(null);
                }, 100);

                if (activeTab === 'loans') {
                    fetchIssues();
                }
            }
        } catch (error) {
            console.error('Issue error:', error);
            alert('Failed to issue book. Check console.');
        }
    };

    const handleResetForm = () => {
        setFormData({ studentId: '', bookId: '' });
    };

    const handleReturnBook = async (loanId: string) => {
        if (!window.confirm('Are you sure you want to mark this book as returned?')) {
            return;
        }

        try {
            const response = await apiClient.post(`/Issues/return/${loanId}`);

            if (response.status === 200) {
                alert('Book returned successfully!');
                fetchIssues();
            }
        } catch (error: any) {
            console.error('Return error:', error);
            if (error.response?.data) {
                alert(`Failed to return book: ${error.response.data}`);
            } else {
                alert('Failed to return book. Please try again.');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            'On Time': 'bg-green-100 text-green-700',
            'Due Soon': 'bg-yellow-100 text-yellow-700',
            'Overdue': 'bg-red-100 text-red-700',
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                     .print-ticket, .print-ticket * {
                        visibility: visible !important;
                }
                .print-ticket {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 210mm !important;
                }
                .ticket-copy {
                 page-break-after: always !important;
                 page-break-inside: avoid !important;
                 display: block !important;
                }
                .ticket-copy:last-child {
                page-break-after: avoid !important;
                }
                @page {
                size: A4;
                margin: 0;
                }
                html, body {
                margin: 0;
                padding: 0;
                }
            }
            `}</style>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
                    <p className="text-gray-500 mt-1">
                        Issue books, view active loans and return books
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-200 px-8">
                    <div className="flex gap-8">
                        {(['checkout', 'loans'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-4 font-medium transition-colors relative capitalize ${activeTab === tab ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'checkout' ? 'Book Checkout' : 'Active Loans'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {activeTab === 'checkout' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <BookOpen className="w-6 h-6" />
                                <h2 className="text-xl font-bold text-gray-900">Issue a Book</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Form */}
                                <div className="space-y-6">
                                    <div className='flex w-full space-x-4'>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Student ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleInputChange}
                                                placeholder="Enter student ID"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Book ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="bookId"
                                                value={formData.bookId}
                                                onChange={handleInputChange}
                                                placeholder="Enter book ID"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={handleProcessTransaction}
                                            disabled={!formData.studentId.trim() || !formData.bookId.trim()}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Issue & Print Ticket
                                        </button>
                                        <button
                                            onClick={handleResetForm}
                                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'loans' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-600 text-white px-6 py-4">
                                <h2 className="text-lg font-semibold">Active Loans</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Book Title
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
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                    <p className="mt-2 text-gray-600">Loading loans...</p>
                                                </td>
                                            </tr>
                                        ) : activeLoans.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No active loans</td>
                                            </tr>
                                        ) : (
                                            activeLoans.map((loan) => (
                                                <tr key={loan.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{loan.studentName}</div>
                                                                <div className="text-xs text-gray-500">ID: {loan.studentId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm text-gray-900">{loan.bookTitle}</div>
                                                                <div className="text-xs text-gray-500">ID: {loan.bookId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {loan.issueDate}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {loan.returnDate}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(loan.status)}`}>
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-sm font-medium ${loan.status === 'Overdue'
                                                            ? 'text-red-600'
                                                            : loan.status === 'Due Soon'
                                                                ? 'text-yellow-600'
                                                                : 'text-green-600'
                                                            }`}>
                                                            {loan.status === 'Overdue'
                                                                ? `${loan.daysRemaining} days overdue`
                                                                : `${loan.daysRemaining} ${loan.daysRemaining === 1 ? 'day' : 'days'} left`
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleReturnBook(loan.id)}
                                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Return
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {activeLoans.length}
                                    </div>
                                    <div className="text-xs text-gray-500">Total Loans</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {activeLoans.filter((l) => l.status === 'On Time').length}
                                    </div>
                                    <div className="text-xs text-gray-500">On Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {activeLoans.filter((l) => l.status === 'Due Soon').length}
                                    </div>
                                    <div className="text-xs text-gray-500">Due Soon</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {activeLoans.filter((l) => l.status === 'Overdue').length}
                                    </div>
                                    <div className="text-xs text-gray-500">Overdue</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {ticketData && (
                <div ref={printRef} className="print-ticket" style={{ position: 'absolute', left: '-9999px' }}>
                    {/* Copy 1 - Library Copy */}
                    <div className="ticket-copy" style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        fontFamily: 'Arial, sans-serif',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '20mm',
                            right: '20mm',
                            background: '#764ba2',
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            LIBRARY COPY
                        </div>

                        <div style={{ textAlign: 'center', borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '28px', color: '#333', margin: '0 0 5px 0' }}>Library Management System</h2>
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Book Issue Ticket</p>
                        </div>

                        <div style={{ background: '#667eea', color: 'white', padding: '12px', textAlign: 'center', fontSize: '20px', fontWeight: '600', marginBottom: '30px', borderRadius: '5px' }}>
                            BOOK ISSUE RECEIPT
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Book ID:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.bookId}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Book Title:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.bookTitle}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Issue Date:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.issueDate}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Due Date:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.dueDate}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', lineHeight: '1.6', padding: '15px', background: '#fff9e6', borderRadius: '5px', border: '1px solid #ffe066' }}>
                            <strong>Terms & Conditions:</strong>
                            <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                                <li>Books must be returned on or before the due date</li>
                                <li>Late returns will incur a fine as per library policy</li>
                                <li>Lost or damaged books must be replaced or paid for</li>
                                <li>This ticket must be presented when returning the book</li>
                            </ul>
                        </div>

                        <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '2px solid #333', width: '200px', marginBottom: '8px' }}></div>
                                    <span style={{ fontSize: '12px', color: '#666' }}>Librarian Signature</span>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '2px solid #333', width: '200px', marginBottom: '8px' }}></div>
                                    <span style={{ fontSize: '12px', color: '#666' }}>Student Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Copy 2 - Student Copy */}
                    <div className="ticket-copy" style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        fontFamily: 'Arial, sans-serif',
                        position: 'relative',
                        pageBreakBefore: 'always'  
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '20mm',
                            right: '20mm',
                            background: '#667eea',
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            STUDENT COPY
                        </div>

                        <div style={{ textAlign: 'center', borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '28px', color: '#333', margin: '0 0 5px 0' }}>Library Management System</h2>
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Book Issue Ticket</p>
                        </div>

                        <div style={{ background: '#667eea', color: 'white', padding: '12px', textAlign: 'center', fontSize: '20px', fontWeight: '600', marginBottom: '30px', borderRadius: '5px' }}>
                            BOOK ISSUE RECEIPT
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Book ID:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.bookId}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Book Title:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.bookTitle}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Issue Date:</span>
                                <span style={{ flex: 1, color: '#555' }}>{ticketData.issueDate}</span>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <span style={{ fontWeight: '600', width: '180px', color: '#333' }}>Due Date:</span>
                                <span style={{ flex: 1, color: '#555', fontWeight: '600' }}>
                                    {ticketData.dueDate} (Return By This Date!)
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '13px', color: '#2d3436', lineHeight: '1.7', padding: '18px', background: '#e8f4f8', borderRadius: '8px', border: '2px dashed #74b9ff' }}>
                            <strong>Keep This Safe!</strong><br />
                            <ul style={{ margin: '12px 0 0 20px', padding: 0 }}>
                                <li>Show this copy when returning the book</li>
                                <li>Return by <strong>{ticketData.dueDate}</strong> to avoid fine</li>
                                <li>Lost ticket? Contact librarian immediately</li>
                            </ul>
                        </div>

                        <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <div style={{ borderTop: '2px solid #333', width: '220px', margin: '0 auto 10px' }}></div>
                                <span style={{ fontSize: '13px', color: '#2d3436', fontWeight: '600' }}>Your Signature</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#636e72', textAlign: 'center', marginTop: '15px', fontStyle: 'italic' }}>
                                I confirm receipt of the book in good condition.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TransactionManagement;