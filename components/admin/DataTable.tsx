"use client";

import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search, Filter, ChevronLeft, ChevronRight, Inbox, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface DataTableProps {
  data: any[];
  columns: any[];
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  actionSlot?: React.ReactNode;
  filterSlot?: React.ReactNode;
  isLoading?: boolean;
}

export default function DataTable({ 
  data, 
  columns, 
  title, 
  description, 
  searchPlaceholder = "Search...", 
  actionSlot, 
  filterSlot,
  isLoading = false
}: DataTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 }
    }
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header Section (Title + Actions) */}
      {(title || description || actionSlot) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && <h1 className="text-xl font-bold text-slate-800 md:text-2xl">{title}</h1>}
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          {actionSlot && <div className="flex gap-2 shrink-0">{actionSlot}</div>}
        </div>
      )}

      {/* Filter Section */}
      <div className="p-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md">
        <div className="relative flex-1 max-w-md group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none group-focus-within:text-violet-500 transition-colors">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
          />
        </div>
        
        {filterSlot && (
          <div className="flex flex-wrap items-center gap-3">
            {filterSlot}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`px-6 py-4 transition-colors group select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-slate-100/80' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-1 text-[10px]">
                            {{
                              asc: <ChevronUp className="w-3.5 h-3.5 text-violet-600" />,
                              desc: <ChevronDown className="w-3.5 h-3.5 text-violet-600" />,
                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-slate-400 font-medium">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors duration-200 group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-700">No data found</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Showing{" "}
              <span className="font-bold text-slate-800">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + (table.getPrePaginationRowModel().rows.length > 0 ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{table.getPrePaginationRowModel().rows.length}</span> results
            </span>

            {/* Rows Per Page selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                {[5, 10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 bg-violet-50 border border-violet-100 rounded-lg text-xs font-bold text-violet-700 shadow-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            
            <button 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
