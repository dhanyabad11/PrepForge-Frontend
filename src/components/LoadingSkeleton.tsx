export function QuestionsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
}

export function InterviewSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-gray-100 p-6 rounded-lg">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 bg-gray-100 rounded-lg">
                        <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-100 rounded-lg">
                        <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="p-6 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    );
}
