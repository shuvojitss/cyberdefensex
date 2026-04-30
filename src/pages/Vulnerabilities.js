import React, { useState, useEffect, useCallback } from 'react';
import {
  Bug,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import './Vulnerabilities.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000';

const Vulnerabilities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Chart data from backend
  const [attackFrequency, setAttackFrequency] = useState([]);
  const [attackShare, setAttackShare] = useState([]);
  const [attackTimeline, setAttackTimeline] = useState([]);

  // Target-attack matrix data
  const [matrixTypes, setMatrixTypes] = useState([]);
  const [matrixRows, setMatrixRows] = useState([]);

  const fetchChartData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vuln-charts`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAttackFrequency(data.attackFrequency || []);
        setAttackShare(data.attackShare || []);
        setAttackTimeline(data.attackTimeline || []);
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  }, []);

  const fetchMatrix = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/target-attack-matrix`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMatrixTypes(data.attackTypes || []);
        setMatrixRows(data.rows || []);
      }
    } catch (err) {
      console.error('Failed to fetch matrix data:', err);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
    fetchMatrix();
  }, [fetchChartData, fetchMatrix]);

  const handleRunScan = async () => {
    setIsScanning(true);
    await Promise.all([fetchChartData(), fetchMatrix()]);
    setIsScanning(false);
  };

  // Compute max for attack frequency to size bars
  const maxFreq = Math.max(...attackFrequency.map(d => d.count), 1);

  // Stats derived from matrix data
  const totalAttacks = matrixRows.reduce((sum, r) => sum + r.total, 0);
  const totalTargets = matrixRows.length;
  const topTarget = matrixRows.length > 0 ? matrixRows[0] : null;
  const topTargetCount = topTarget ? topTarget.total : 0;

  // Filter matrix rows by search
  const filteredRows = matrixRows.filter(row =>
    row.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom tooltip for doughnut
  const ShareTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value} attacks</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for timeline
  const TimelineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{payload[0].value} attacks per 2min</p>
        </div>
      );
    }
    return null;
  };

  // Custom dot for line chart
  const CustomDot = (props) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#0a0a1a"
        stroke="#00e5ff"
        strokeWidth={2}
      />
    );
  };

  // Get a color class for a cell value (heat-map style)
  const getCellClass = (value) => {
    if (value === 0) return 'cell-zero';
    if (value >= 100) return 'cell-critical';
    if (value >= 20) return 'cell-high';
    if (value >= 5) return 'cell-medium';
    return 'cell-low';
  };

  return (
    <div className="vulnerabilities-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Vulnerability Management</h1>
          <p className="page-subtitle">Track and remediate security vulnerabilities</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={handleRunScan} disabled={isScanning}>
            <RefreshCw size={16} className={isScanning ? 'spinning' : ''} />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>
      </div>

      <div className="vuln-stats">
        <div className="vuln-stat-card">
          <Bug size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{totalAttacks}</span>
            <span className="stat-label">Total Attacks</span>
          </div>
        </div>
        <div className="vuln-stat-card critical">
          <AlertCircle size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{matrixTypes.length}</span>
            <span className="stat-label">Attack Types</span>
          </div>
        </div>
        <div className="vuln-stat-card open">
          <Target size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{totalTargets}</span>
            <span className="stat-label">Target IPs</span>
          </div>
        </div>
        <div className="vuln-stat-card overdue">
          <AlertCircle size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{topTargetCount}</span>
            <span className="stat-label">Most Attacked</span>
          </div>
        </div>
      </div>

      {/* Attack Frequency Bar Chart */}
      <div className="vuln-charts">
        <div className="card chart-card attack-frequency-card">
          <div className="card-header">
            <div className="card-title-group">
              <h3 className="card-title">Attack Frequency</h3>
              <span className="card-subtitle">Counts by attack class</span>
            </div>
          </div>
          <div className="frequency-bars">
            {attackFrequency.map((item, idx) => (
              <div key={idx} className="freq-bar-wrapper">
                <div className="freq-bar-container">
                  <div
                    className="freq-bar"
                    style={{
                      height: `${(item.count / maxFreq) * 100}%`,
                      background: item.color,
                    }}
                  ></div>
                </div>
                <span className="freq-count">{item.count}</span>
                <span className="freq-label">{item.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Share Doughnut Chart */}
        <div className="card chart-card attack-share-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-title-icon">🍩</span>
              <h3 className="card-title">Attack Share</h3>
            </div>
            <span className="chart-type-badge">DOUGHNUT</span>
          </div>
          <div className="doughnut-chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={attackShare}
                  cx="40%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={1}
                >
                  {attackShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ShareTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="doughnut-legend">
              {attackShare.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }}></span>
                  <span className="legend-text">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attack Timeline Line Chart */}
      {attackTimeline.length > 0 && (
        <div className="card chart-card attack-timeline-card">
          <div className="card-header">
            <div className="card-title-group">
              <TrendingUp size={18} className="card-title-icon-svg" />
              <h3 className="card-title">Attack Timeline</h3>
            </div>
            <span className="chart-type-badge timeline-badge">LINE CHART</span>
          </div>
          <div className="timeline-legend-row">
            <div className="timeline-legend-item">
              <span className="timeline-legend-swatch"></span>
              <span>Attacks per 2min</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attackTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#4a4a6a"
                tick={{ fill: '#6a6a8a', fontSize: 12 }}
                axisLine={{ stroke: '#2a2a5a' }}
                tickLine={false}
              />
              <YAxis
                stroke="#4a4a6a"
                tick={{ fill: '#6a6a8a', fontSize: 12 }}
                axisLine={{ stroke: '#2a2a5a' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<TimelineTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00e5ff"
                strokeWidth={2.5}
                fill="url(#timelineGrad)"
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#00e5ff', stroke: '#0a0a1a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Target IP vs Attack Type Matrix Table */}
      <div className="vuln-table-container card">
        <div className="table-header">
          <h3 className="card-title">Target IP vs Attack Type</h3>
          <div className="table-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search target IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="matrix-table-scroll">
          <table className="vuln-table">
            <thead>
              <tr>
                <th className="target-ip-header">Target IP</th>
                {matrixTypes.map(type => (
                  <th key={type} className="attack-type-header">{type}</th>
                ))}
                <th className="total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={matrixTypes.length + 2} className="no-results">
                    No targets found matching your search
                  </td>
                </tr>
              ) : filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="cve-id">{row.target}</td>
                  {matrixTypes.map(type => (
                    <td key={type} className={`matrix-cell ${getCellClass(row[type] || 0)}`}>
                      {row[type] || 0}
                    </td>
                  ))}
                  <td className="matrix-total">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities;
