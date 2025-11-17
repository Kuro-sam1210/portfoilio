import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PostsFilters from './PostsFilters';
import PostsTable from './PostsTable';
import PostsPagination from './PostsPagination';
import PostModal from './PostModal';
import usePostsData from './usePostsData';

const PostSection = () => {
  const { hasPermission } = useAuth();
  const {
    selectedPost,
    setSelectedPost,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    loading,
    currentPage,
    setCurrentPage,
    paginatedPosts,
    totalPages,
    formatDate,
    handleView,
    handleDelete,
    setQuery
  } = usePostsData();

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Posts</h2>
          </div>
        </div>

        <PostsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-lg overflow-hidden mt-6">
          <PostsTable
            loading={loading}
            paginatedPosts={paginatedPosts}
            handleView={handleView}
            setQuery={setQuery}
            handleDelete={handleDelete}
            hasPermission={hasPermission}
            formatDate={formatDate}
          />
          <PostsPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>

        <PostModal
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          setQuery={setQuery}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default PostSection;