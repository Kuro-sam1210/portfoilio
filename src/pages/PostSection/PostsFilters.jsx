import React from 'react';
import { FiSearch } from 'react-icons/fi';

const PostsFilters = ({ searchTerm, setSearchTerm, filter, setFilter, sortBy, setSortBy }) => {
  return (
    <div className="bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-xl shadow-lg p-6 mb-6 border transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-[var(--color-text-muted)] animate-pulse" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border  rounded-lg bg-white/5 backdrop-blur-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/10"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/10"
          >
            <option value="all">All Posts</option>
            <option value="reported">Reported</option>
            <option value="withMedia">With Media</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/10"
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostCommented">Most Commented</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PostsFilters;