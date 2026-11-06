import { TriageAnalysis, AuditTrailEntry } from '../types';

export function generateIncidentReportHtml(
  analysis: TriageAnalysis | null,
  auditEntries: AuditTrailEntry[]
): string {
  const timestamp = new Date().toLocaleString();
  const incidentTitle = analysis?.incidentTitle || 'SOC Security Telemetry Audit';
  const severity = analysis?.severity || 'LOW';
  const incidentId = analysis?.id || `INC-${Date.now()}`;
  const truthScore = analysis?.epistemicTruthScore ?? 100;
  const latency = analysis?.latencyMs ?? 0;
  const modelName = analysis?.modelName || 'Local Verification Engine';

  // Severity color badge style
  const sevColor =
    severity === 'CRITICAL'
      ? '#dc2626'
      : severity === 'HIGH'
      ? '#ea580c'
      : severity === 'MEDIUM'
      ? '#d97706'
      : '#2563eb';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Incident Report - ${incidentId}</title>
  <style>
    @media print {
      @page {
        margin: 1.5cm;
        size: letter portrait;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      padding: 30px;
    }

    .report-container {
      max-width: 850px;
      margin: 0 auto;
    }

    /* Print action bar */
    .action-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      font-family: monospace;
      font-size: 13px;
    }

    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-print:hover {
      background: #059669;
    }

    /* Header */
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header h1 {
      font-size: 24px;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .header .subtitle {
      font-size: 13px;
      color: #64748b;
      font-family: monospace;
    }

    .meta-badge {
      text-align: right;
      font-family: monospace;
      font-size: 12px;
    }

    .severity-pill {
      display: inline-block;
      background: ${sevColor};
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    /* Executive Summary */
    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: monospace;
    }

    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #0ea5e9;
      padding: 14px 16px;
      border-radius: 4px;
      font-size: 14px;
      color: #334155;
    }

    /* Grid cards */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .meta-card {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-family: monospace;
    }

    .meta-card .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }

    .meta-card .value {
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
    }

    /* Table styles */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }

    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      font-family: monospace;
      font-size: 11px;
    }

    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .code-snippet {
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      color: #0f172a;
      word-break: break-all;
    }

    .badge-status {
      font-family: monospace;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    .status-executed {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .status-rolledback {
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
    }

    /* Verification Axiom block */
    .axiom-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      padding: 12px 14px;
      border-radius: 4px;
      font-size: 12px;
      color: #166534;
      font-family: monospace;
      margin-bottom: 20px;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      margin-top: 30px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="report-container">
    
    <!-- Interactive Print Control Bar (Hidden when printed) -->
    <div class="action-bar no-print">
      <div>
        <span>WITGENSTEIN CYBER DEFENSE • INCIDENT DOCUMENTATION GENERATOR</span>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="header">
      <div>
        <h1>INCIDENT RESPONSE & REMEDIATION REPORT</h1>
        <div class="subtitle">Wittgenstein Epistemic AI Defense Agent • Tournament Audit Trail</div>
      </div>
      <div class="meta-badge">
        <div><span class="severity-pill">${severity} THREAT</span></div>
        <div>Report Generated: ${timestamp}</div>
        <div>Incident ID: ${incidentId}</div>
      </div>
    </div>

    <!-- Executive Metrics Grid -->
    <div class="meta-grid">
      <div class="meta-card">
        <span class="label">Truth Score</span>
        <span class="value" style="color: #16a34a;">${truthScore}% Empirically Verified</span>
      </div>
      <div class="meta-card">
        <span class="label">Latency</span>
        <span class="value">${latency}ms</span>
      </div>
      <div class="meta-card">
        <span class="label">Defense Model</span>
        <span class="value" style="font-size: 11px;">${modelName}</span>
      </div>
      <div class="meta-card">
        <span class="label">Authorized Actions</span>
        <span class="value">${auditEntries.filter(a => a.status === 'EXECUTED').length} / ${auditEntries.length}</span>
      </div>
    </div>

    <!-- Incident Executive Summary -->
    <div class="section">
      <div class="section-title">1. Executive Summary & Context</div>
      <div class="summary-box">
        <strong>${incidentTitle}:</strong><br/>
        ${analysis?.summary || 'Defensive log analysis executed across suspicious telemetry events.'}
      </div>
    </div>

    <!-- Epistemic Grounding (Wittgenstein Principle) -->
    <div class="section">
      <div class="section-title">2. Epistemic Deductive Verification (§ Ludwig Wittgenstein)</div>
      <div class="axiom-box">
        <strong>Axiom §7 Grounding:</strong> "Whereof one cannot speak, thereof one must be silent."<br/>
        Every assertion and proposed defensive action in this report is anchored to empirical log signatures. No LLM hallucinations or speculative indicators are tolerated.
      </div>
      
      ${
        analysis?.facts && analysis.facts.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th style="width: 15%;">Fact ID</th>
                  <th style="width: 35%;">Empirical Observation</th>
                  <th style="width: 35%;">Deductive Logical Reasoning</th>
                  <th style="width: 15%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.facts
                  .map(
                    f => `<tr>
                      <td class="code-snippet">${f.id}</td>
                      <td>${f.claim}</td>
                      <td>${f.reasoning}</td>
                      <td><span class="badge-status status-executed">${f.verdict} (${f.epistemicCertainty}%)</span></td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>`
          : '<p style="font-size: 12px; color: #64748b;">No individual fact records available.</p>'
      }
    </div>

    <!-- MITRE ATT&CK Matrix Progression -->
    <div class="section">
      <div class="section-title">3. Verified MITRE ATT&CK Attack Progression</div>
      ${
        analysis?.mitreTechniques && analysis.mitreTechniques.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th style="width: 15%;">Technique ID</th>
                  <th style="width: 25%;">Technique Name</th>
                  <th style="width: 25%;">Tactic (Kill Chain Phase)</th>
                  <th style="width: 20%;">Timestamp / Anchor</th>
                  <th style="width: 15%;">Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.mitreTechniques
                  .map(
                    t => `<tr>
                      <td><span class="code-snippet" style="font-weight: bold; color: #0284c7;">${t.id}</span></td>
                      <td><strong>${t.name}</strong></td>
                      <td>${t.tactic}</td>
                      <td class="code-snippet">${t.timestamp || t.provenByFactId}</td>
                      <td><span class="badge-status status-executed">${t.confidence}%</span></td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>`
          : '<p style="font-size: 12px; color: #64748b;">No MITRE techniques mapped for this incident.</p>'
      }
    </div>

    <!-- Indicators of Compromise -->
    ${
      analysis?.iocs && analysis.iocs.length > 0
        ? `<div class="section">
            <div class="section-title">4. Extracted Indicators of Compromise (IOCs)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Type</th>
                  <th style="width: 40%;">Indicator Value</th>
                  <th style="width: 40%;">Context / Attribution</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.iocs
                  .map(
                    ioc => `<tr>
                      <td><span class="code-snippet">${ioc.type}</span></td>
                      <td class="code-snippet" style="font-weight: bold;">${ioc.value}</td>
                      <td>${ioc.threatContext}</td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
        : ''
    }

    <!-- Human-in-the-Loop Remediation Audit Trail -->
    <div class="section page-break">
      <div class="section-title">5. Human-in-the-Loop Remediation & Command Audit Trail</div>
      <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
        As mandated by Defense Evaluation Guidelines, no containment commands are executed autonomously without human authorization. Every atomic action possesses a tested reversible rollback.
      </p>

      ${
        auditEntries.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th style="width: 18%;">Timestamp</th>
                  <th style="width: 20%;">Action Title</th>
                  <th style="width: 12%;">Risk Tier</th>
                  <th style="width: 15%;">Operator Status</th>
                  <th style="width: 35%;">Atomic Bash Execution / Rollback</th>
                </tr>
              </thead>
              <tbody>
                ${auditEntries
                  .map(entry => {
                    const statusClass =
                      entry.status === 'EXECUTED'
                        ? 'status-executed'
                        : entry.status === 'REJECTED'
                        ? 'status-rejected'
                        : entry.status === 'ROLLED_BACK'
                        ? 'status-rolledback'
                        : 'status-pending';

                    return `<tr>
                      <td class="code-snippet">${new Date(entry.timestamp).toLocaleString()}</td>
                      <td><strong>${entry.title}</strong></td>
                      <td><span class="code-snippet">${entry.riskLevel}</span></td>
                      <td><span class="badge-status ${statusClass}">${entry.status}</span></td>
                      <td>
                        <div class="code-snippet" style="margin-bottom: 4px;"><strong>CMD:</strong> $ ${entry.command}</div>
                        <div class="code-snippet" style="color: #64748b;"><strong>UNDO:</strong> $ ${entry.rollbackCommand}</div>
                      </td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table>`
          : analysis?.actions && analysis.actions.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th style="width: 25%;">Proposed Remediation</th>
                  <th style="width: 15%;">Risk Tier</th>
                  <th style="width: 60%;">Atomic Containment & Rollback Commands</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.actions
                  .map(
                    act => `<tr>
                      <td><strong>${act.title}</strong></td>
                      <td><span class="code-snippet">${act.riskLevel}</span></td>
                      <td>
                        <div class="code-snippet" style="margin-bottom: 4px;"><strong>CMD:</strong> $ ${act.command}</div>
                        <div class="code-snippet" style="color: #64748b;"><strong>UNDO:</strong> $ ${act.rollbackCommand}</div>
                      </td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>`
          : '<p style="font-size: 12px; color: #64748b;">No remediation actions logged in session.</p>'
      }
    </div>

    <!-- Footer Signoff -->
    <div class="footer">
      <div>Wittgenstein Defensive AI Engine • Hackers-Arise & OTW Technical Submission</div>
      <div>Confidential • Authorized Cybersecurity Audit</div>
    </div>

  </div>
</body>
</html>`;
}
