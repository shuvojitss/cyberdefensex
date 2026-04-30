import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCcw,
  Plus,
  RotateCcw,
  Download,
  Search,
  Grid2x2,
  List,
  ShieldCheck,
  ShieldAlert,
  WifiOff,
  Server,
  Crown,
} from 'lucide-react';
import './Blockchain.css';
import useEventStream from '../hooks/useEventStream';

const API_BASE_URL = process.env.REACT_APP_BLOCKCHAIN_API_URL || 'http://localhost:8000/blockchain';

const initialCounts = {
  all: 0,
  leader: 0,
  worker: 0,
  running: 0,
  offline: 0,
  risk: 0,
};

const safeValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
};

const boolText = (value) => {
  if (value === true) return 'True';
  if (value === false) return 'False';
  return safeValue(value);
};

const classifyNode = (running, verified) => {
  if (!running) return 'offline';
  if (!verified) return 'risk';
  return 'healthy';
};

const statusLabel = (node) => {
  if (node.statusClass === 'healthy') return 'Healthy';
  if (node.statusClass === 'offline') return 'Offline';
  return 'At Risk';
};

const toNodes = (payload) => {
  const leader = payload?.leader || {};
  const workers = Array.isArray(payload?.workers) ? payload.workers : [];

  const leaderVerified = leader.integrity_ok === true;
  const nodes = [
    {
      key: 'leader',
      id: 0,
      type: 'leader',
      name: 'Leader Node',
      meta: 'Main coordinator',
      port: 5000,
      running: true,
      removable: false,
      verified: leaderVerified,
      statusClass: classifyNode(true, leaderVerified),
      details: [
        ['Blocks', safeValue(leader.blocks)],
        ['Excel Intact', boolText(leader.excel_intact)],
        ['Excel Matches Chain', boolText(leader.excel_matches_chain)],
        ['Blockchain Valid', boolText(leader.blockchain_valid)],
        ['File Changed', boolText(leader.file_changed)],
      ],
    },
  ];

  workers.forEach((worker) => {
    const running = worker.running === true;
    const verified = worker.verify?.integrity_ok === true;
    const workerId = typeof worker.id === 'number' ? worker.id : -1;

    nodes.push({
      key: `worker-${workerId}`,
      id: workerId,
      type: 'worker',
      name: worker.name || `Worker Node ${safeValue(workerId)}`,
      meta: `Folder: ${safeValue(worker.folder)}`,
      port: worker.port,
      running,
      removable: worker.removable === true,
      verified,
      statusClass: classifyNode(running, verified),
      details: [
        ['Port', safeValue(worker.port)],
        ['Chain Valid', boolText(worker.verify?.chain_valid)],
        ['File Changed', boolText(worker.verify?.file_changed)],
        ['Last Index', safeValue(worker.status?.last_index)],
      ],
    });
  });

  return nodes;
};

const matchesFilter = (node, filterName) => {
  if (filterName === 'all') return true;
  if (filterName === 'leader') return node.type === 'leader';
  if (filterName === 'worker') return node.type === 'worker';
  if (filterName === 'running') return node.running;
  if (filterName === 'offline') return !node.running;
  if (filterName === 'risk') return node.statusClass === 'risk';
  return true;
};

const matchesQuery = (node, queryText) => {
  if (!queryText) return true;

  const haystack = [node.name, node.type, String(node.id), String(node.port), node.meta]
    .join(' ')
    .toLowerCase();

  return haystack.includes(queryText.toLowerCase());
};

const Blockchain = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [statusMessage, setStatusMessage] = useState('Preparing dashboard...');
  const [statusTone, setStatusTone] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');

  const callApi = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }

    return payload;
  };

  const setStatus = (message, tone = '') => {
    setStatusMessage(message);
    setStatusTone(tone);
  };

  const refreshDashboard = async (announceSuccess = false) => {
    try {
      const payload = await callApi('/api/dashboard');
      const nextNodes = toNodes(payload);
      setNodes(nextNodes);

      if (announceSuccess) {
        setStatus(`Dashboard synced at ${new Date().toLocaleTimeString()}.`, 'ok');
      }
    } catch (error) {
      setStatus(`Dashboard refresh failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (name, action, successMessage) => {
    setBusyAction(name);
    try {
      await action();
      await refreshDashboard(false);
      setStatus(successMessage, 'ok');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusyAction('');
    }
  };

  // SSE-driven refresh: refetch when backend pushes an event
  useEventStream('alerts.changed', () => refreshDashboard(false));

  useEffect(() => {
    refreshDashboard(true);

    // Fallback safety-net poll (60s) in case SSE connection drops
    const timer = setInterval(() => {
      refreshDashboard(false);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const counters = useMemo(() => {
    return {
      all: nodes.length,
      leader: nodes.filter((node) => node.type === 'leader').length,
      worker: nodes.filter((node) => node.type === 'worker').length,
      running: nodes.filter((node) => node.running).length,
      offline: nodes.filter((node) => !node.running).length,
      risk: nodes.filter((node) => node.statusClass === 'risk').length,
    };
  }, [nodes]);

  const metrics = useMemo(() => {
    return {
      total: nodes.length,
      healthy: nodes.filter((node) => node.statusClass === 'healthy').length,
      risk: nodes.filter((node) => node.statusClass === 'risk').length,
      offline: nodes.filter((node) => node.statusClass === 'offline').length,
    };
  }, [nodes]);

  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => matchesFilter(node, filter) && matchesQuery(node, query));
  }, [nodes, filter, query]);

  const filters = [
    { key: 'all', label: 'All Nodes' },
    { key: 'leader', label: 'Leader' },
    { key: 'worker', label: 'Workers' },
    { key: 'running', label: 'Running' },
    { key: 'offline', label: 'Offline' },
    { key: 'risk', label: 'At Risk' },
  ];

  return (
    <div className="blockchain-page">
      <header className="blockchain-topbar">
        <div>
          <h1 className="blockchain-heading">Node Security Dashboard</h1>
          <p className="blockchain-subtitle">
            Monitor blockchain integrity, worker health, and response actions in one panel.
          </p>
        </div>
        <div className="blockchain-actions">
          <button
            className="blockchain-btn blockchain-btn-ghost"
            type="button"
            onClick={() => refreshDashboard(true)}
            disabled={busyAction !== ''}
          >
            <RefreshCcw size={16} />
            Sync Nodes
          </button>
          <button
            className="blockchain-btn blockchain-btn-primary"
            type="button"
            onClick={() => runAction('add-worker', () => callApi('/api/workers/add', { method: 'POST' }), 'Worker created.')}
            disabled={busyAction !== ''}
          >
            <Plus size={16} />
            Add Worker
          </button>
          <button
            className="blockchain-btn blockchain-btn-warn"
            type="button"
            onClick={() => {
              const confirmed = window.confirm('Reset all will remove workers 2-5, delete alerts files and reset blockchain json files. Continue?');
              if (!confirmed) return;
              runAction('reset-all', () => callApi('/api/reset_all', { method: 'POST' }), 'Reset complete.');
            }}
            disabled={busyAction !== ''}
          >
            <RotateCcw size={16} />
            Reset All
          </button>
          <a className="blockchain-btn blockchain-btn-ghost" href={`${API_BASE_URL}/download_excel`} target="_blank" rel="noreferrer">
            <Download size={16} />
            Download Excel
          </a>
        </div>
      </header>

      <section className="blockchain-metrics">
        <article className="metric-card">
          <p className="metric-label">Total Nodes</p>
          <p className="metric-value">{metrics.total}</p>
        </article>
        <article className="metric-card metric-good">
          <p className="metric-label">Healthy</p>
          <p className="metric-value">{metrics.healthy}</p>
        </article>
        <article className="metric-card metric-risk">
          <p className="metric-label">At Risk</p>
          <p className="metric-value">{metrics.risk}</p>
        </article>
        <article className="metric-card metric-offline">
          <p className="metric-label">Offline</p>
          <p className="metric-value">{metrics.offline}</p>
        </article>
      </section>

      <section className="blockchain-toolbar">
        <div className="blockchain-filters">
          {filters.map((chip) => {
            const count = counters[chip.key] ?? initialCounts[chip.key] ?? 0;
            return (
              <button
                key={chip.key}
                type="button"
                className={`blockchain-chip ${filter === chip.key ? 'active' : ''}`}
                onClick={() => setFilter(chip.key)}
              >
                {chip.label}
                <span className="blockchain-chip-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="blockchain-tools-row">
          <label className="blockchain-search-wrap" htmlFor="blockchainSearch">
            <Search size={16} />
            <input
              id="blockchainSearch"
              type="search"
              className="blockchain-search"
              placeholder="Search by node name, id, or port"
              value={query}
              onChange={(event) => setQuery(event.target.value.trimStart())}
            />
          </label>

          <div className="blockchain-view-switch" role="tablist" aria-label="View mode">
            <button
              className={`blockchain-view-btn ${view === 'grid' ? 'active' : ''}`}
              type="button"
              onClick={() => setView('grid')}
              title="Grid view"
            >
              <Grid2x2 size={14} />
              Grid
            </button>
            <button
              className={`blockchain-view-btn ${view === 'list' ? 'active' : ''}`}
              type="button"
              onClick={() => setView('list')}
              title="List view"
            >
              <List size={14} />
              List
            </button>
          </div>

          <button className="blockchain-btn blockchain-btn-ghost" type="button" onClick={() => setQuery('')}>
            Clear Search
          </button>
        </div>
      </section>

      <p className={`blockchain-status ${statusTone}`}>{statusMessage}</p>

      <section className={`blockchain-cards ${view === 'list' ? 'list-view' : 'grid-view'}`}>
        {loading ? (
          <div className="blockchain-empty">Loading dashboard...</div>
        ) : null}

        {!loading && visibleNodes.length === 0 ? (
          <div className="blockchain-empty">No nodes match your filters. Try another view or clear search.</div>
        ) : null}

        {!loading &&
          visibleNodes.map((node, index) => (
            <article className={`blockchain-card ${node.statusClass}`} key={node.key} style={{ animationDelay: `${index * 45}ms` }}>
              <div className="blockchain-card-head">
                <div>
                  <h2 className="blockchain-card-name">
                    {node.type === 'leader' ? <Crown size={16} /> : <Server size={16} />}
                    {node.name}
                  </h2>
                  <p className="blockchain-card-meta">
                    {node.meta} | Node ID: {node.id} | Port: {node.port}
                  </p>
                </div>
                <span className={`blockchain-health-tag ${node.statusClass}`}>
                  {node.statusClass === 'healthy' ? <ShieldCheck size={14} /> : null}
                  {node.statusClass === 'risk' ? <ShieldAlert size={14} /> : null}
                  {node.statusClass === 'offline' ? <WifiOff size={14} /> : null}
                  {statusLabel(node)}
                </span>
              </div>

              <ul className="blockchain-facts">
                {node.details.map(([label, value]) => (
                  <li key={`${node.key}-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>

              <div className="blockchain-card-actions">
                {node.type === 'leader' ? (
                  <>
                    <button
                      className="blockchain-btn"
                      type="button"
                      onClick={() => runAction('leader-verify', () => callApi('/api/leader/verify', { method: 'POST' }), 'Leader verification completed.')}
                      disabled={busyAction !== ''}
                    >
                      Verify
                    </button>
                    <button
                      className="blockchain-btn blockchain-btn-warn"
                      type="button"
                      onClick={() => runAction('leader-mitigate', () => callApi('/api/leader/mitigate', { method: 'POST' }), 'Mitigation completed.')}
                      disabled={busyAction !== ''}
                    >
                      Mitigate
                    </button>
                    <button
                      className="blockchain-btn blockchain-btn-ghost"
                      type="button"
                      onClick={() => runAction('leader-update', () => callApi('/api/leader/update', { method: 'POST' }), 'Leader update completed.')}
                      disabled={busyAction !== ''}
                    >
                      Update
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="blockchain-btn"
                      type="button"
                      onClick={() => runAction(`verify-${node.id}`, () => callApi(`/api/workers/${node.id}/verify`, { method: 'POST' }), `Worker ${node.id} verification completed.`)}
                      disabled={busyAction !== ''}
                    >
                      Verify
                    </button>
                    <button
                      className="blockchain-btn blockchain-btn-ghost"
                      type="button"
                      onClick={() => runAction(`update-${node.id}`, () => callApi(`/api/workers/${node.id}/update`, { method: 'POST' }), `Worker ${node.id} update completed.`)}
                      disabled={busyAction !== ''}
                    >
                      Update
                    </button>

                    {node.removable ? (
                      <button
                        className="blockchain-btn blockchain-btn-ghost"
                        type="button"
                        onClick={() => runAction(`start-${node.id}`, () => callApi(`/api/workers/${node.id}/start`, { method: 'POST' }), `Worker ${node.id} started.`)}
                        disabled={busyAction !== '' || node.running}
                      >
                        Start
                      </button>
                    ) : null}

                    {node.removable ? (
                      <button
                        className="blockchain-btn blockchain-btn-ghost"
                        type="button"
                        onClick={() => runAction(`stop-${node.id}`, () => callApi(`/api/workers/${node.id}/stop`, { method: 'POST' }), `Worker ${node.id} stopped.`)}
                        disabled={busyAction !== '' || !node.running}
                      >
                        Stop
                      </button>
                    ) : null}

                    {node.removable ? (
                      <button
                        className="blockchain-btn blockchain-btn-warn"
                        type="button"
                        onClick={() => {
                          const confirmed = window.confirm(`Delete worker ${node.id} and remove its folder?`);
                          if (!confirmed) return;
                          runAction(`remove-${node.id}`, () => callApi(`/api/workers/${node.id}`, { method: 'DELETE' }), `Worker ${node.id} removed.`);
                        }}
                        disabled={busyAction !== ''}
                      >
                        Remove
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </article>
          ))}
      </section>
    </div>
  );
};

export default Blockchain;
