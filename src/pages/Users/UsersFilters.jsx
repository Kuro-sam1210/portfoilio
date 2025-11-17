import React from 'react';

const UsersFilters = ({ query, setQuery, sortBy, setSortBy, planFilter, setPlanFilter, verifiedFilter, setVerifiedFilter }) => {
  return (
    <div className="relative bg-[var(--color-bg-secondary)] dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-transparent hover:border-white/10 mb-6">
      <div className="flex items-center gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full sm:w-80 px-3 py-2 rounded-md border border-transparent bg-white/5 dark:bg-white/5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-md border border-transparent bg-gray/5 dark:bg-white/5 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-transparent bg-gray/5 dark:bg-white/5 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Plans</option>
          <option value="Free">Free</option>
          <option value="Orbit">Orbit</option>
          <option value="Starlight">Starlight</option>
          <option value="Nova">Nova</option>
          <option value="Equinox">Equinox</option>
          <option value="Polaris">Polaris</option>
          <option value="Orion">Orion</option>
          <option value="Cosmos">Cosmos</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-transparent bg-gray/5 dark:bg-white/5 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>
    </div>
  );
};

export default UsersFilters;