import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Share2,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportsData, setReportsData] = useState([]);

  const reportTypes = [
    { id: 'all', label: 'All Reports' },
    { id: 'alert', label: 'Alert Reports' }
  ];

  const scheduledReports = [
    { name: 'Weekly Security Summary', schedule: 'Every Monday, 8:00 AM', nextRun: 'Jan 22, 2024' },
    { name: 'Monthly Threat Report', schedule: '1st of month, 9:00 AM', nextRun: 'Feb 1, 2024' },
    { name: 'Daily Alert Digest', schedule: 'Daily, 6:00 AM', nextRun: 'Jan 16, 2024' }
  ];

  const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatGeneratedAt = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toISOString().replace('T', ' ').substring(0, 16);
  };

  const mapReport = (report) => ({
    id: report.id,
    name: `Security Alert Report ${report.id}`,
    type: 'alert',
    generatedAt: formatGeneratedAt(report.generatedAt),
    period: `${report.rowCount} alerts`,
    status: 'ready',
    size: formatBytes(report.sizeBytes),
    format: 'PDF',
    downloadUrl: report.downloadUrl ? `${API_BASE_URL}${report.downloadUrl}` : null,
  });

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`);
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      const payload = await response.json();
      const records = (payload.reports || []).map(mapReport);
      setReportsData(records);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = (reportId) => {
    setReportsData(prev => prev.filter(r => r.id !== reportId));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      await fetchReports();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report) => {
    if (!report.downloadUrl) {
      return;
    }
    window.open(report.downloadUrl, '_blank', 'noopener');
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'summary': return BarChart3;
      case 'alert': return Shield;
      case 'threat': return Shield;
      case 'vulnerability': return TrendingUp;
      case 'compliance': return FileText;
      case 'incident': return FileText;
      case 'network': return PieChart;
      default: return FileText;
    }
  };

  const filteredReports = useMemo(() => reportsData.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }), [reportsData, searchQuery, selectedType]);

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Security Reports</h1>
          <p className="page-subtitle">Generate and download security analytics reports</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Calendar size={16} />
            Schedule Report
          </button>
          <button className="btn btn-primary" onClick={handleGenerateReport} disabled={isGenerating}>
            <Plus size={16} />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="reports-main">
          <div className="reports-controls">
            <div className="type-tabs">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  className={`type-tab ${selectedType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="reports-list card">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Generated</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => {
                  const ReportIcon = getReportIcon(report.type);
                  return (
                    <tr key={report.id}>
                      <td>
                        <div className="report-name-cell cell-wrapper">
                          <ReportIcon size={18} />
                          <div className="report-info">
                            <span className="report-name">{report.name}</span>
                            <span className="report-id">{report.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="badge-cell cell-wrapper">
                          <span className="report-type-badge">{report.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="period-cell cell-wrapper">
                          <span>{report.period}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell cell-wrapper">
                          <Clock size={12} />
                          <span>{report.generatedAt}</span>
                        </div>
                      </td>
                      <td>
                        <div className="size-cell cell-wrapper">
                          <span>{report.size}</span>
                        </div>
                      </td>
                      <td>
                        <div className="status-cell cell-wrapper">
                          <span className={`status-badge ${report.status}`}>
                            {report.status === 'generating' && <span className="loading-dot"></span>}
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell cell-wrapper">
                          <button className="action-btn" title="View" disabled={report.status === 'generating'} onClick={() => handleDownloadReport(report)}>
                            <Eye size={16} />
                          </button>
                          <button className="action-btn" title="Download" disabled={report.status === 'generating'} onClick={() => handleDownloadReport(report)}>
                            <Download size={16} />
                          </button>
                          <button className="action-btn" title="Share" disabled={report.status === 'generating'}>
                            <Share2 size={16} />
                          </button>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDeleteReport(report.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="reports-sidebar">
          <div className="card scheduled-card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={18} />
                Scheduled Reports
              </h3>
            </div>
            <div className="scheduled-list">
              {scheduledReports.map((report, idx) => (
                <div key={idx} className="scheduled-item">
                  <div className="scheduled-info">
                    <span className="scheduled-name">{report.name}</span>
                    <span className="scheduled-schedule">{report.schedule}</span>
                  </div>
                  <div className="scheduled-next">
                    <span className="next-label">Next run:</span>
                    <span className="next-date">{report.nextRun}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-schedule-btn">
              <Plus size={16} />
              Add Schedule
            </button>
          </div>

          <div className="card quick-generate-card">
            <div className="card-header">
              <h3 className="card-title">Quick Generate</h3>
            </div>
            <div className="quick-options">
              <button className="quick-option" onClick={handleGenerateReport}>
                <BarChart3 size={20} />
                <span>Executive Summary</span>
              </button>
              <button className="quick-option" onClick={handleGenerateReport}>
                <Shield size={20} />
                <span>Threat Report</span>
              </button>
              <button className="quick-option" onClick={handleGenerateReport}>
                <TrendingUp size={20} />
                <span>Vulnerability Scan</span>
              </button>
              <button className="quick-option" onClick={handleGenerateReport}>
                <FileText size={20} />
                <span>Compliance Check</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
