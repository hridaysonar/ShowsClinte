import { Link } from 'react-router'

const Forbidden = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
            <h1 className="text-5xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
            <p className="text-lg text-gray-700 mb-6">You do not have permission to access this page.</p>
            <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go Home
            </Link>
        </div>
    )
}

export default Forbidden
