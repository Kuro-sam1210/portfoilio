import React from 'react';
import { FiEye, FiTrash2 } from 'react-icons/fi';

const PostsTable = ({
  loading,
  paginatedPosts,
  handleView,
  setQuery,
  handleDelete,
  hasPermission,
  formatDate
}) => {
  return (
    <div className="relative bg-[var(--color-bg-secondary)] dark:bg-gray-800 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-transparent">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-gray-800 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-[var(--color-text-secondary)]">Loading posts...</td>
              </tr>
            ) : paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <tr key={post.id} className="relative bg-[var(--color-bg-secondary)] dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border hover:bg-gray-700" onClick={() => handleView(post)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {post.media && post.media.length > 0 && (
                        <div className="relative bg-[var(--color-bg-secondary)] dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-transparent hover:border-white/10 flex-shrink-0">
                          {/* show small thumbnail if we have a url */}
                          {post.media[0] ? (
                            // eslint-disable-next-line jsx-a11y/img-redundant-alt
                            <img src={post.media[0]} alt="post thumbnail" className="h-10 w-10 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <span className="text-xs">IMG</span>
                          )}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
                          {post.content}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--color-text-primary)]">{post.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      <span className="mr-3">❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                    {formatDate(post.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleView(post); setQuery('post', post.id); }}
                        className="text-blue-500 hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-500/20 transition-all duration-300 transform hover:scale-110"
                        title="View Post"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      {hasPermission('delete_post') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                          className="text-red-500 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/20 transition-all duration-300 transform hover:scale-110"
                          title="Delete Post"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--color-text-secondary)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">📭</div>
                    <p>No posts to display.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostsTable;