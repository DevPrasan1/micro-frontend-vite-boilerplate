import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore, useUIStore } from '@streamhub/shared-store';
import { VideoCard, Tabs, Dropdown, Spinner } from '@streamhub/shared-ui';
import { Channel } from '@streamhub/shared-types';
import { YT_CHANNELS } from '@streamhub/shared-utils';

const MOCK_CHANNELS: Channel[] = YT_CHANNELS;

export default function App() {
  let navigate: any;
  try {
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const { setSelectedChannel } = usePlayerStore();
  const { searchQuery } = useUIStore();
  const [localSearch, setLocalSearch] = useState('');

  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [countryInfo, setCountryInfo] = useState<Record<string, { flag: string; name: string }>>({});
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Detect standalone mode (i.e. not embedded in host on port 5000)
  const isStandalone = typeof window !== 'undefined' && window.location.port !== '5000';
  const activeSearch = isStandalone ? localSearch : searchQuery;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // 4 columns x 4 rows layout

  useEffect(() => {
    const loadApiData = async () => {
      try {
        setLoading(true);
        // Fetch countries for flag mapping in filter dropdown
        const countriesRes = await fetch('https://iptv-org.github.io/api/countries.json');
        const countriesData = countriesRes.ok ? await countriesRes.json() : [];
        const infoMap: Record<string, { flag: string; name: string }> = {};
        countriesData.forEach((c: any) => {
          if (c.code) {
            infoMap[c.code.toUpperCase()] = {
              flag: c.flag || '🏳️',
              name: c.name || c.code
            };
          }
        });
        setCountryInfo(infoMap);

        // Load Shemaroo comedy channel playlist directly!
        setChannels(YT_CHANNELS);
      } catch (err) {
        console.warn('API load failed. Using offline fallback.', err);
        setChannels(YT_CHANNELS);
      } finally {
        setLoading(false);
      }
    };

    loadApiData();
  }, []);

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    if (navigate) {
      navigate(`/watch/${channel.id}`);
    } else {
      alert(`Playing channel: ${channel.name} (Standalone Mode)`);
    }
  };

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, activeCategory]);

  // Extract categories dynamically from currently loaded channels
  const categories = ['All', ...Array.from(new Set(channels.map((c) => c.category).filter(Boolean))).sort()];

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = activeSearch
      ? channel.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      channel.country.toLowerCase().includes(activeSearch.toLowerCase()) ||
      (countryInfo[channel.country.toUpperCase()]?.name || '').toLowerCase().includes(activeSearch.toLowerCase())
      : true;
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination coordinates
  const totalPages = Math.ceil(filteredChannels.length / itemsPerPage);
  const paginatedChannels = filteredChannels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth">
          <Tabs
            tabs={categories.map((c) => ({ id: c, label: c }))}
            activeTab={activeCategory}
            onChange={setActiveCategory}
            className="flex-nowrap border-b-0 whitespace-nowrap overflow-x-auto"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {isStandalone && (
            <div className="w-full sm:w-64">
              <Search
                placeholder="Search name or country..."
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : paginatedChannels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedChannels.map((channel) => (
            <VideoCard
              key={channel.id}
              channel={channel}
              onClick={handleChannelClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 border border-zinc-800 border-dashed rounded-xl">
          No channels match your filters.
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-zinc-900/40 px-6 py-4 rounded-xl border border-zinc-800">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            ← Previous
          </button>

          <span className="text-sm font-medium text-zinc-400 text-center">
            Page <span className="text-zinc-200">{currentPage}</span> of <span className="text-zinc-200">{totalPages}</span>
            <span className="hidden sm:inline"> ({filteredChannels.length} channels total)</span>
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
