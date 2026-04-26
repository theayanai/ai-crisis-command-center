const state = {
  scenarios: [],
  activeIncidentId: null,
};

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderScenarios() {
  const list = document.getElementById('scenario-list');

  list.innerHTML = state.scenarios
    .map((scenario) => {
      const activeClass = scenario.id === state.activeIncidentId ? 'is-active' : '';
      return `
        <button class="scenario-button ${activeClass}" data-incident-id="${scenario.id}">
          <strong>${escapeText(scenario.title)}</strong>
          <span>${escapeText(scenario.zone)} · ${escapeText(scenario.type)}</span>
        </button>
      `;
    })
    .join('');

  list.querySelectorAll('[data-incident-id]').forEach((button) => {
    button.addEventListener('click', () => loadOrchestration(button.dataset.incidentId));
  });
}

function renderResponse(response) {
  const severity = Number(response.severity ?? response.decision?.severity ?? 0);
  const impact = response.impact ?? response.decision?.impact ?? 'unknown';
  const isBroadcast = Boolean(response.broadcast ?? response.decision?.broadcast);
  const confidenceLabel = severity >= 9 ? 'VERY HIGH' : severity >= 7 ? 'HIGH' : severity >= 5 ? 'MEDIUM' : 'LOW';

  document.getElementById('incident-title').textContent = response.incident.title;
  document.getElementById('incident-meta').textContent = `${response.signal_unification.unified_incident_type.toUpperCase()} INCIDENT · ${response.incident.zone} · ${response.decision.priority.toUpperCase()} PRIORITY`;

  document.getElementById('unified-sources').textContent = `Unified from ${response.signal_unification.source_count} sources -> ${response.signal_unification.source_label}`;
  document.getElementById('fragmented-list').innerHTML = response.signal_unification.before
    .map((entry) => `<div class="signal-card">${escapeText(entry)}</div>`)
    .join('');
  document.getElementById('unified-result').textContent = response.signal_unification.after;

  const alertPanel = document.getElementById('alert-panel');
  alertPanel.style.borderColor = response.decision.priority === 'critical' ? 'rgba(251, 113, 133, 0.5)' : 'rgba(110, 231, 255, 0.3)';

  document.getElementById('responder-list').innerHTML = response.assigned_staff.length
    ? response.assigned_staff
        .map(
          (staff) => `
            <div class="responder-card">
              <strong>${escapeText(staff.name)}</strong>
              <div>${escapeText(staff.role)} responder</div>
              <div>Nearest available staff · ${escapeText(staff.location.zone)}</div>
            </div>
          `,
        )
        .join('')
    : '<div class="responder-card">No matching available staff found.</div>';

  document.getElementById('route-panel').innerHTML = `
    <div class="route-box">
      <strong>${escapeText(response.route.name)}</strong>
      <ol>
        ${response.route.steps.map((step) => `<li>${escapeText(step)}</li>`).join('')}
      </ol>
    </div>
  `;

  document.getElementById('timeline-list').innerHTML = response.timeline
    .map(
      (entry) => `
        <div class="timeline-item">
          <span class="status-chip status-${escapeText(entry.status)}">${escapeText(entry.stage)}</span>
          <div>${escapeText(entry.detail)}</div>
        </div>
      `,
    )
    .join('');

  document.getElementById('explanation').innerHTML = `<strong>AI Briefing:</strong><br/>${escapeText(response.briefing || response.ai_orchestration.reason || 'No briefing available.').replaceAll('\n', '<br/>')}`;
  document.getElementById('ai-provider').textContent = `AI brain: ${response.ai_orchestration.provider.toUpperCase()}`;
  document.getElementById('ai-decision-note').textContent = `AI Decision Engine Active · Severity ${severity}/10 · Impact ${impact}`;
  document.getElementById('ai-confidence').innerHTML = `<strong>Confidence:</strong> ${confidenceLabel} · Broadcast ${isBroadcast ? 'ON' : 'OFF'}`;
  document.getElementById('ai-reason').textContent = response.ai_orchestration.reason || '';
  document.getElementById('action-plan').innerHTML = response.action_plan
    .map(
      (step) => `
        <div class="action-item">
          ${escapeText(step)}
        </div>
      `,
    )
    .join('');
}

async function loadScenarios() {
  const response = await fetch('/api/incidents');
  const payload = await response.json();
  state.scenarios = payload.incidents || [];
  state.activeIncidentId = String(state.scenarios[0]?.id ?? '');
  renderScenarios();
  if (state.activeIncidentId) {
    await loadOrchestration(state.activeIncidentId);
  }
}

async function loadOrchestration(incidentId) {
  state.activeIncidentId = String(incidentId);
  renderScenarios();

  try {
    const response = await fetch(`/api/orchestrate/${incidentId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    renderResponse(payload);
    updateTelemetryLogs(payload);
  } catch (error) {
    document.getElementById('incident-title').textContent = 'Unable to orchestrate this incident';
    document.getElementById('incident-meta').textContent = 'Backend unavailable or AI timeout occurred. Using safe standby mode.';
    document.getElementById('status').textContent = 'System fallback active. Retry scenario.';
  }
}

loadScenarios().catch(() => {
  document.getElementById('scenario-list').innerHTML = '<div class="responder-card">Unable to load simulated incidents.</div>';
});

function setupActionButtons() {
  const statusEl = document.getElementById('status');

  document.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.innerText.trim();

      if (statusEl) {
        statusEl.innerText = `${action} -> Sending...`;
      }

      try {
        const response = await fetch('/execute-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const payload = await response.json();

        if (statusEl) {
          statusEl.innerText = payload.message || `${action} -> Executed`;
        }

        updateTelemetryLogs({
          event_type: 'manual_action',
          action,
          result: payload,
        });
      } catch (error) {
        if (statusEl) {
          statusEl.innerText = `${action} -> Failed`;
        }

        updateTelemetryLogs({
          event_type: 'manual_action',
          action,
          result: { status: 'failed', message: `${action} -> Failed` },
        });
      }
    });
  });
}

setupActionButtons();

(() => {
  const selectRevealNodes = () =>
    document.querySelectorAll(
      '.hero-card, .glass-panel, .dashboard-shell, .panel, .stat-box, .flow-step, .scenario-button, .responder-card, .timeline-item, .action-item',
    );

  const setupHeroTilt = () => {
    const hero = document.querySelector('.hero-card');
    if (!hero) {
      return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const tiltY = clamp((x - 0.5) * 10, -5, 5);
      const tiltX = clamp((0.5 - y) * 8, -4, 4);

      hero.style.setProperty('--tilt-x', `${tiltX}deg`);
      hero.style.setProperty('--tilt-y', `${tiltY}deg`);
    });

    hero.addEventListener('mouseleave', () => {
      hero.style.setProperty('--tilt-x', '0deg');
      hero.style.setProperty('--tilt-y', '0deg');
    });
  };

  const setupPointerSystem = () => {
    const cursor = document.querySelector('.ai-cursor');
    const trail = document.querySelector('.ai-cursor-trail');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      const root = document.documentElement;
      root.style.setProperty('--pointer-x', ((mouseX / window.innerWidth) * 100).toFixed(2));
      root.style.setProperty('--pointer-y', ((mouseY / window.innerHeight) * 100).toFixed(2));
    });

    const animateCursor = () => {
      if (cursor) {
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
      }

      if (trail) {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;
        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;
      }

      requestAnimationFrame(animateCursor);
    };

    animateCursor();
  };

  const setupRevealObserver = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );

    selectRevealNodes().forEach((node) => observer.observe(node));
  };

  setupHeroTilt();
  setupPointerSystem();
  setupRevealObserver();
})();

function switchTab(tabId, clickedButton) {
  // Hide all tabs safely
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.style.display = 'none';
  });
  // Remove active styling from all buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Show the selected tab and restore grid layout if needed
  const selectedTab = document.getElementById(tabId);
  if (tabId === 'dashboard-view') {
    selectedTab.style.display = 'grid'; // Restore grid layout to prevent UI breaking
  } else {
    selectedTab.style.display = 'block';
  }

  // Highlight the clicked button safely
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
}

function updateTelemetryLogs(data) {
  const logContainer = document.getElementById('raw-logs-container');
  if (!logContainer) return;

  const timestamp = new Date().toLocaleTimeString();
  const isActionEvent = data.event_type === 'manual_action';

  if (isActionEvent) {
    const action = escapeText(data.action || 'Unknown Action');
    const status = escapeText(data.result?.status || 'unknown');
    const message = escapeText(data.result?.message || 'No status message');

    const actionHTML = `
      <div class="telemetry-entry">
        <div class="telemetry-head">[${timestamp}] ⚙️ MANUAL ACTION EVENT</div>
        <div class="telemetry-line">>> ACTION: ${action}</div>
        <div class="telemetry-line">>> STATUS: ${status.toUpperCase()}</div>
        <div class="telemetry-line telemetry-muted">>> MESSAGE: ${message}</div>
      </div>
    `;

    logContainer.innerHTML = actionHTML + logContainer.innerHTML;
    return;
  }

  const rawSignals = escapeText(JSON.stringify(data.incoming_signals || [], null, 2));
  const aiReasoning = escapeText(JSON.stringify(data.ai_orchestration || {}, null, 2));
  const unifiedType = escapeText((data.signal_unification?.unified_incident_type || 'UNKNOWN').toUpperCase());
  const staffCount = Array.isArray(data.assigned_staff) ? data.assigned_staff.length : 0;
  const severity = data.severity ?? data.decision?.severity ?? 'N/A';
  const impact = escapeText(data.impact ?? data.decision?.impact ?? 'unknown');
  const broadcast = (data.broadcast ?? data.decision?.broadcast) ? 'ON' : 'OFF';

  const logHTML = `
    <div class="telemetry-entry">
      <div class="telemetry-head">[${timestamp}] 📡 SYSTEM TRIGGERED: Telemetry Ingestion Initiated</div>

      <div class="telemetry-line telemetry-alert">>> RAW SENSOR DATA INGESTED:</div>
      <pre class="telemetry-block telemetry-alert">${rawSignals}</pre>

      <div class="telemetry-line telemetry-warn">>> GEMINI NEURAL FUSION: Executing analysis...</div>
      <pre class="telemetry-block telemetry-ok">${aiReasoning}</pre>

      <div class="telemetry-line telemetry-ok">>> UNIFIED DECISION: ${unifiedType} THREAT DETECTED.</div>
      <div class="telemetry-line telemetry-muted">>> ROUTING ENGINE: Generated ${staffCount} staff assignments with dynamic hazard bypass.</div>
      <div class="telemetry-line telemetry-muted">>> SEVERITY: ${severity}/10 | IMPACT: ${impact} | BROADCAST: ${broadcast}</div>
    </div>
  `;

  logContainer.innerHTML = logHTML + logContainer.innerHTML;
}