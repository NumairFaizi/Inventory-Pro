import React from 'react'

const Card = ({ title, count, color = "border-gray-700" }) => {
    return (
        <div
            className={`flex items-center bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 ${color} hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out`}
        >
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {title}
                </p>
                <p className="text-3xl font-extrabold text-white">
                    {count !== undefined ? count : 0}
                </p>
            </div>
        </div>
    )
}

export default Card