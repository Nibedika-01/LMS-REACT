import React, { useEffect, useState } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { Search, Eye, Edit, Trash2, BookPlus, ArrowLeft, RotateCcw } from 'lucide-react';

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    status: 'Available' | 'Not Available';
    issued: number;
}

const BooksManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [authors, setAuthors] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: '',
        publisher: '',
        publicationYear: '',
        price: '',
        description: ''
    });

    const [books] = useState<Book[]>([
        { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', status: 'Available', issued: 2 },
        { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', status: 'Available', issued: 1 },
        { id: '3', title: 'Introduction to Algorithms', author: 'Thomas H Cormen', category: 'Computer Science', status: 'Not Available', issued: 12 },
        { id: '4', title: 'Clean Code', author: 'Robert C Martin', category: 'Computer Science', status: 'Available', issued: 5 },
        { id: '5', title: 'The Hobbit', author: 'J.R.R Tolkien', category: 'Fantasy', status: 'Available', issued: 1 },
        { id: '6', title: 'The Da Vinci Code', author: 'Dan Brown', category: 'Mystery', status: 'Available', issued: 3 },
        { id: '7', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', status: 'Not Available', issued: 4 }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await apiClient.get('/Authors');
                console.log('Authors fetched:', response.data);
                setAuthors(response.data);
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        }
        fetchAuthors();
    }, [])

    const handleAddBook = async () => {
        console.log('Adding book:', formData);
        try {
            const response = await apiClient.post('/Books', formData);
            console.log('Book added successfully:', response.data);

            setFormData({
                title: '',
                author: '',
                category: '',
                publisher: '',
                publicationYear: '',
                price: '',
                description: ''
            })
            setView('list');
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book. Please try again.');
        }
    };

    const handleResetForm = () => {
        setFormData({
            title: '',
            author: '',
            category: '',
            publisher: '',
            publicationYear: '',
            price: '',
            description: ''
        });
    };

    if (view === 'add') {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
                        <p className="text-gray-500 mt-1">Add a new book to the library collection</p>
                    </div>
                    <button
                        onClick={() => setView('list')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                </div>

                {/* Form */}
                <div className="p-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <BookPlus className="w-6 h-6" />
                                <h2 className="text-xl font-bold text-gray-900">Book Information</h2>
                            </div>
                            <p className="text-gray-500">Enter the details of the new book</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Book Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Book Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter book title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Author */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="authorId"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
                                >
                                    <option value="">Select author name</option>
                                    {authors.map((author: any) => (
                                        <option key={author.id} value={author.id}>
                                            {author.authorName}
                                        </option>
                                    ))}
                                </select>

                            </div>


                            {/* ISBN */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="for e.g. 978-0-06-112008-4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div> */}

                            {/* Category/Genre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Genre
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category || ""}
                                    onChange={handleInputChange}
                                    placeholder="Genre"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>


                            {/* Publisher */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Publisher
                                </label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleInputChange}
                                    placeholder="Publisher name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Publication Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Publication Year
                                </label>
                                <input
                                    type="text"
                                    name="publicationYear"
                                    value={formData.publicationYear}
                                    onChange={handleInputChange}
                                    placeholder="for e.g. 2025"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Language */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select language</option>
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div> */}

                            {/* Number of Copies */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of copies <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="copies"
                  value={formData.copies}
                  onChange={handleInputChange}
                  placeholder="Enter the number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div> */}

                            {/* Shelf Location */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf location
                </label>
                <input
                  type="text"
                  name="shelfLocation"
                  value={formData.shelfLocation}
                  onChange={handleInputChange}
                  placeholder="for e.g. A-1-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div> */}

                            {/* Condition */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div> */}

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (Rs)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="499"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Barcode */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Enter the book's barcode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div> */}

                            {/* Description */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of the book ...."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleAddBook}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <BookPlus className="w-5 h-5" />
                                Add Book
                            </button>
                            <button
                                onClick={handleResetForm}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
                    <p className="text-gray-500 mt-1">Manage your library's book collection</p>
                </div>
                <button
                    onClick={() => setView('add')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <BookPlus className="w-5 h-5" />
                    Add Book
                </button>
            </div>

            {/* Search and Filter */}
            <div className="p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Books</h2>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, author, or ISBN"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option>All Status</option>
                            <option>Available</option>
                            <option>Not Available</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option>All Categories</option>
                            <option>Fiction</option>
                            <option>Computer Science</option>
                            <option>Fantasy</option>
                            <option>Mystery</option>
                        </select>
                    </div>
                </div>

                {/* Books Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-4">
                        <h2 className="text-lg font-semibold">Book List/Collection</h2>
                        <p className="text-sm text-blue-100">Showing 8 of 40 books</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ISBN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Copies</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Issued</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{book.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{book.author}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-300">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs rounded ${book.status === 'Available'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{book.issued}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded">
                                                    <Eye className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded">
                                                    <Edit className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded">
                                                    <Trash2 className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            &lt;
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">2</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">3</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">4</button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">5</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BooksManagement;