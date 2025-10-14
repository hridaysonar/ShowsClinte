import React from 'react';

const Table = ({ columns, data, renderActions }) => {
    return (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                            >
                                {col.header}
                            </th>
                        ))}
                        {renderActions && (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm">
                                    {col.render ? col.render(item) : item[col.key]}
                                </td>
                            ))}
                            {renderActions && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                    {renderActions(item)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
