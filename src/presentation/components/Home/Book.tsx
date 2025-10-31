import React, { useEffect, useState } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { Search, Edit, Trash2, BookPlus, ArrowLeft, RotateCcw, UserPlus, X } from 'lucide-react';

interface Book {
    id: string;
    title: string;
    authorId: number;
    genre: string;
    isAvailable: string;
    issued: number;
}

const BooksManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [authorName, setAuthorName] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        genre: '',
        publisher: '',
        publicationYear: '',
        price: '',
        description: ''
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await apiClient.get('/Books');
                console.log('Books fetched:', response.data);
                const data = response.data.map((b: any) => ({
                    id: b.id.toString(),
                    title: b.title,
                    authorId: b.authorId,
                    genre: b.genre,
                    isAvailable: b.isAvailable,
                }));
                setBooks(data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    const handleDeleteBook = async (bookId: string) => {
        console.log('Deleting book with ID:', bookId);
        try {
            await apiClient.delete(`/Books/${bookId}`);
            alert('Book deleted successfully');
            setBooks(books.filter(book => book.id !== bookId));
        } catch (error) {
            alert('Failed to delete book. Please try again.');
        }
    }

    // const handleUpdateBook = async (bookId: string) => {
    //     console.log('Updating book with ID:', bookId);
    //     setFormData({
    //         title: '',
    //         author: '',
    //         genre: '',
    //         publisher: '',
    //         publicationYear: '',
    //         price: '',
    //         description: ''
    //     })
    //     try {
    //         await apiClient.put(`/Books/${bookId}`, formData);

    //     } catch (error) {
    //         console.error('Error updating book:', error);
    //         alert('Failed to update book. Please try again.');
    //     }
    // }
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await apiClient.get('/Authors');
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
                genre: '',
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
            genre: '',
            publisher: '',
            publicationYear: '',
            price: '',
            description: ''
        });
    };

    const handleAddAuthor = async () => {
        console.log("Adding author:", authorName);
        try {
            const response = await apiClient.post('/Authors', { authorName });
            console.log('Author added successfully:', response.data);
        } catch (error) {
            console.error('Error adding author:', error);
            alert('Failed to add author. Please try again.');
            return;
        }
        alert(`Author "${authorName}" added successfully!`);
        setAuthorName('');
        setShowAuthorModal(false);
    }

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
                            {/* Category/Genre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Genre
                                </label>
                                <input
                                    type="text"
                                    name="genre"
                                    value={formData.genre || ""}
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
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAuthorModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Author
                    </button>
                    <button
                        onClick={() => setView('add')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <BookPlus className="w-5 h-5" />
                        Add Book
                    </button>
                </div>
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
                        {/* <select
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
                        </select> */}
                    </div>
                </div>

                {/* Books Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-4">
                        <h2 className="text-lg font-semibold">Book List/Collection</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Genre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{book.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{book.authorId}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-300">
                                                {book.genre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs rounded ${book.isAvailable
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {book.isAvailable ? "Available" : "Not Available"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded">
                                                    <Edit className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded" onClick={() => handleDeleteBook(book.id)}>
                                                    <Trash2 className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Add Author Modal */}
            {showAuthorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-6 h-6 text-green-600" />
                                <h3 className="text-xl font-bold text-gray-900">Add New Author</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAuthorModal(false);
                                    setAuthorName('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Enter author name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddAuthor}
                                    disabled={!authorName.trim()}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Add Author
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAuthorModal(false);
                                        setAuthorName('');
                                    }}
                                    className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksManagement;