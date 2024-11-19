import React from 'react';

export const LoadingSpinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

export const TabButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg transition-all duration-200 ${active
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
    >
        {children}
    </button>
);

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">משהו השתבש</h2>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        נסה שוב
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}