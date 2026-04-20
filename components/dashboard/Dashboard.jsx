"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const T = {
  amber: "#E8940A",
  amberLight: "#FDF3DC",
  amberMid: "#F5C350",
  amberDark: "#B8730A",
  charcoal: "#1A1A1A",
  charcoalMid: "#2E2E2E",
  muted: "#6E6E6E",
  border: "#E4DDD4",
  surface: "#FAFAF8",
  white: "#FFFFFF",
  green: "#2D7A4F",
  greenBg: "#EAF5EE",
  blue: "#1B5FAA",
  blueBg: "#EBF3FC",
  red: "#C0392B",
  redBg: "#FDECEA",
  orange: "#DC6B2F",
  orangeBg: "#FDF0E8",
};

const CATEGORIES = ["Roads", "Garbage", "Drainage", "Street Lights"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const AREAS = [
  "Vellore", "Chennai", "Pondicherry", "Coimbatore", "Mysore",
  "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Kolkata",
];

const CAT_ICONS = {
  Roads: "🛣️",
  Garbage: "🗑️",
  Drainage: "💧",
  "Street Lights": "💡",
};

const PRIORITY_COLORS = {
  Low: T.muted,
  Medium: T.amber,
  High: T.orange,
  Urgent: T.red,
};

const STATUS_CONFIG = {
  Pending: { badge: "badge-pending", dot: T.amber },
  "In Progress": { badge: "badge-progress", dot: T.blue },
  Resolved: { badge: "badge-resolved", dot: T.green },
};

function generateSeedData() {
  const titles = {
    Roads: ["Deep pothole on main junction", "Road cave-in near school", "Broken asphalt stretch", "Unmarked speed bump"],
    Garbage: ["Overflowing dumpster", "Illegal dumping site", "Garbage not collected 4 days", "Trash near park entrance"],
    Drainage: ["Blocked storm drain flooding road", "Open manhole cover", "Sewage overflow on street", "Waterlogging after rain"],
    "Street Lights": ["5 lights out on service road", "Flickering lamp post", "No lighting near bus stop", "Broken pole light"],
  };
  const descs = [
    "This has been an issue for over two weeks now and is causing major inconvenience.",
    "Multiple residents have complained. Needs urgent attention.",
    "Situation is worsening. Please prioritize.",
    "Reported previously but no action taken yet.",
    "Causing safety hazards especially at night.",
  ];
  const statuses = ["Pending", "Pending", "In Progress", "In Progress", "Resolved"];
  const data = [];
  const now = Date.now();
  for (let i = 0; i < 18; i++) {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = now - daysAgo * 86400000 - Math.random() * 86400000;
    const resolvedAt =
      status === "Resolved" ? createdAt + Math.random() * 5 * 86400000 : null;
    data.push({
      id: now - i * 1000 - Math.random() * 100000,
      title: titles[cat][Math.floor(Math.random() * titles[cat].length)],
      description: descs[Math.floor(Math.random() * descs.length)],
      category: cat,
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      area,
      status,
      upvotes: Math.floor(Math.random() * 24),
      upvotedByMe: false,
      createdAt,
      resolvedAt,
    });
  }
  return data;
}

function useComplaints() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    setComplaints(generateSeedData());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.status === "Pending" && Math.random() < 0.15)
            return { ...c, status: "In Progress" };
          if (c.status === "In Progress" && Math.random() < 0.1)
            return { ...c, status: "Resolved", resolvedAt: Date.now() };
          return c;
        })
      );
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const addComplaint = (data) =>
    setComplaints((prev) => [
      {
        ...data,
        id: Date.now(),
        status: "Pending",
        upvotes: 0,
        upvotedByMe: false,
        createdAt: Date.now(),
        resolvedAt: null,
      },
      ...prev,
    ]);

  const toggleUpvote = (id) =>
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            upvotedByMe: !c.upvotedByMe,
            upvotes: c.upvotedByMe ? c.upvotes - 1 : c.upvotes + 1,
          }
          : c
      )
    );

  return { complaints, addComplaint, toggleUpvote };
}

function useStats(complaints) {
  return useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;

    const resolvedWithTime = complaints.filter(
      (c) => c.status === "Resolved" && c.resolvedAt
    );
    const avgResolutionMs =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce(
          (sum, c) => sum + (c.resolvedAt - c.createdAt),
          0
        ) / resolvedWithTime.length
        : 0;
    const avgResolutionDays = (avgResolutionMs / 86400000).toFixed(1);

    const heatmap = {};
    AREAS.forEach((a) => {
      heatmap[a] = {};
      CATEGORIES.forEach((c) => (heatmap[a][c] = 0));
    });
    complaints.forEach((c) => {
      if (heatmap[c.area]) heatmap[c.area][c.category]++;
    });
    const heatmapMax = Math.max(
      1,
      ...Object.values(heatmap).flatMap((row) => Object.values(row))
    );

    const now = Date.now();
    const weeks = [0, 1, 2, 3].map((w) => ({
      label: w === 0 ? "This week" : `${w}w ago`,
      start: now - (w + 1) * 7 * 86400000,
      end: now - w * 7 * 86400000,
    }));
    const barData = weeks.map((w) => {
      const wc = complaints.filter(
        (c) => c.createdAt >= w.start && c.createdAt < w.end
      );
      const byCat = {};
      CATEGORIES.forEach((cat) => {
        byCat[cat] = wc.filter((c) => c.category === cat).length;
      });
      return { label: w.label, ...byCat, total: wc.length };
    });
    const barMax = Math.max(1, ...barData.map((w) => w.total));

    return { total, pending, inProgress, resolved, avgResolutionDays, heatmap, heatmapMax, barData, barMax };
  }, [complaints]);
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statNum, color: color || T.charcoal }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

function Badge({ status }) {
  const cfg = {
    Pending: { bg: T.amberLight, color: "#7A4D00" },
    "In Progress": { bg: T.blueBg, color: T.blue },
    Resolved: { bg: T.greenBg, color: T.green },
  }[status] || { bg: T.surface, color: T.muted };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.05em",
        padding: "3px 9px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function HeatmapPanel({ heatmap, heatmapMax }) {
  const visibleAreas = AREAS.slice(0, 8);
  const getColor = (val) => {
    if (val === 0) return T.surface;
    const intensity = val / heatmapMax;
    if (intensity < 0.3) return "#FDF3DC";
    if (intensity < 0.6) return "#F5C350";
    if (intensity < 0.85) return T.amber;
    return T.amberDark;
  };
  const getTextColor = (val) => {
    const intensity = val / heatmapMax;
    return intensity >= 0.6 ? T.white : intensity > 0 ? "#7A4D00" : T.muted;
  };

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>Issue Heatmap</div>
        <div style={styles.panelSub}>Reports by area & category</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3 }}>
          <thead>
            <tr>
              <th style={{ ...styles.heatTh, textAlign: "left", width: 100 }}>Area</th>
              {CATEGORIES.map((c) => (
                <th key={c} style={styles.heatTh}>
                  {CAT_ICONS[c]}
                  <div style={{ fontSize: 9, marginTop: 2, fontWeight: 500 }}>
                    {c.split(" ")[0]}
                  </div>
                </th>
              ))}
              <th style={styles.heatTh}>Total</th>
            </tr>
          </thead>
          <tbody>
            {visibleAreas.map((area) => {
              const rowTotal = CATEGORIES.reduce(
                (s, c) => s + (heatmap[area]?.[c] || 0),
                0
              );
              return (
                <tr key={area}>
                  <td style={styles.heatAreaCell}>{area}</td>
                  {CATEGORIES.map((cat) => {
                    const v = heatmap[area]?.[cat] || 0;
                    return (
                      <td
                        key={cat}
                        style={{
                          ...styles.heatCell,
                          background: getColor(v),
                          color: getTextColor(v),
                        }}
                      >
                        {v || ""}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      ...styles.heatCell,
                      background: rowTotal > 0 ? T.charcoal : T.surface,
                      color: rowTotal > 0 ? T.white : T.muted,
                      fontWeight: 600,
                    }}
                  >
                    {rowTotal || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 10, color: T.muted }}>Low</span>
        {["#FDF3DC", "#F5C350", T.amber, T.amberDark].map((c) => (
          <div
            key={c}
            style={{ width: 18, height: 14, borderRadius: 3, background: c, border: `1px solid ${T.border}` }}
          />
        ))}
        <span style={{ fontSize: 10, color: T.muted }}>High</span>
      </div>
    </div>
  );
}

const CAT_CHART_COLORS = {
  Roads: "#E8940A",
  Garbage: "#DC6B2F",
  Drainage: "#1B5FAA",
  "Street Lights": "#2D7A4F",
};

function BarChartPanel({ barData, barMax }) {
  const [hovered, setHovered] = useState(null);
  const chartH = 140;

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>Complaints Over Time</div>
        <div style={styles.panelSub}>By category, last 4 weeks</div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: chartH + 32, paddingTop: 8 }}>
        {[...barData].reverse().map((week, wi) => (
          <div
            key={wi}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <div
              style={{ width: "100%", display: "flex", flexDirection: "column-reverse", gap: 1, height: chartH, justifyContent: "flex-start" }}
            >
              {CATEGORIES.map((cat) => {
                const val = week[cat] || 0;
                const h = val > 0 ? Math.max(4, (val / barMax) * chartH) : 0;
                return (
                  <div
                    key={cat}
                    title={`${cat}: ${val}`}
                    onMouseEnter={() => setHovered({ week: wi, cat, val })}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      width: "100%",
                      height: h,
                      background: CAT_CHART_COLORS[cat],
                      borderRadius: h > 0 ? "3px 3px 0 0" : 0,
                      opacity:
                        hovered && hovered.week === wi && hovered.cat === cat ? 1
                          : hovered && hovered.week === wi ? 0.5
                            : 1,
                      transition: "opacity 0.15s, height 0.4s ease",
                      cursor: "default",
                    }}
                  />
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4, textAlign: "center" }}>
              {week.label}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.charcoal }}>{week.total}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 14 }}>
        {CATEGORIES.map((cat) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: CAT_CHART_COLORS[cat] }} />
            <span style={{ fontSize: 11, color: T.muted }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResolutionPanel({ complaints }) {
  const resolved = complaints.filter((c) => c.status === "Resolved" && c.resolvedAt);

  const byCategory = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catResolved = resolved.filter((c) => c.category === cat);
      if (!catResolved.length) return { cat, avg: null, count: 0 };
      const avg =
        catResolved.reduce((s, c) => s + (c.resolvedAt - c.createdAt), 0) /
        catResolved.length /
        86400000;
      return { cat, avg: avg.toFixed(1), count: catResolved.length };
    });
  }, [resolved]);

  const fastest = byCategory
    .filter((r) => r.avg !== null)
    .sort((a, b) => a.avg - b.avg)[0];

  const maxAvg = Math.max(...byCategory.map((r) => parseFloat(r.avg) || 0), 1);

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>Resolution Times</div>
        <div style={styles.panelSub}>Average days to resolve, by category</div>
      </div>

      {resolved.length === 0 ? (
        <div style={{ fontSize: 13, color: T.muted, padding: "16px 0" }}>
          No resolved issues yet — stats will appear here.
        </div>
      ) : (
        <>
          {byCategory.map(({ cat, avg, count }) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.charcoal }}>
                  {CAT_ICONS[cat]} {cat}
                </span>
                <span style={{ fontSize: 12, color: T.muted }}>
                  {avg !== null ? `${avg}d avg · ${count} resolved` : "No data"}
                </span>
              </div>
              <div style={{ height: 7, background: T.surface, borderRadius: 4, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: avg !== null ? `${(parseFloat(avg) / maxAvg) * 100}%` : "0%",
                    background: avg !== null && parseFloat(avg) <= 2 ? T.green : parseFloat(avg) <= 4 ? T.amber : T.red,
                    borderRadius: 4,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          ))}

          {fastest && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: T.greenBg,
                borderRadius: 8,
                border: `1px solid #C2E8D0`,
                fontSize: 12,
                color: T.green,
                fontWeight: 500,
              }}
            >
              ✓ Fastest: {CAT_ICONS[fastest.cat]} {fastest.cat} issues resolved in {fastest.avg} days on average
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ComplaintCard({ complaint, onUpvote }) {
  return (
    <div style={styles.complaintCard}>
      <div style={styles.cardTop}>
        <div style={{ flex: 1 }}>
          <div style={styles.cardTitle}>
            {CAT_ICONS[complaint.category]} {complaint.title}
          </div>
          <div style={styles.cardDesc}>{complaint.description}</div>
          <div style={styles.cardMeta}>
            <span>📍 {complaint.area}</span>
            <span>{complaint.category}</span>
            <span style={{ color: PRIORITY_COLORS[complaint.priority] || T.muted }}>
              ● {complaint.priority}
            </span>
            <span style={{ color: T.muted }}>
              {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 12 }}>
          <Badge status={complaint.status} />
          <button
            onClick={() => onUpvote(complaint.id)}
            style={{
              ...styles.upvoteBtn,
              background: complaint.upvotedByMe ? T.amber : T.surface,
              color: complaint.upvotedByMe ? T.white : T.muted,
              borderColor: complaint.upvotedByMe ? T.amber : T.border,
            }}
          >
            ▲ {complaint.upvotes}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "Roads",
    priority: "Medium", area: "", image: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (file) { set("image", file); setPreview(URL.createObjectURL(file)); }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = true;
    if (!form.description.trim()) e.description = true;
    if (!form.area.trim()) e.area = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form });
    setForm({ title: "", description: "", category: "Roads", priority: "Medium", area: "", image: null });
    setPreview(null);
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = (key) => ({
    ...styles.formInput,
    borderColor: errors[key] ? T.red : T.border,
  });

  return (
    <div style={styles.formPanel}>
      <div style={styles.panelTitle}>File a Report</div>
      <div style={{ ...styles.panelSub, marginBottom: 20 }}>
        Help your municipality fix issues faster
      </div>

      {submitted && (
        <div style={styles.successBanner}>
          ✓ Report submitted successfully
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Issue Title</label>
        <input
          style={inputStyle("title")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Large pothole near school gate"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Description</label>
        <textarea
          style={{ ...inputStyle("description"), height: 80, resize: "vertical" }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the issue, its severity, how long it's been there…"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Category</label>
          <div style={styles.selectWrap}>
            <select
              style={styles.formSelect}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Priority</label>
          <div style={styles.selectWrap}>
            <select
              style={styles.formSelect}
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Area / Locality</label>
        <input
          style={inputStyle("area")}
          value={form.area}
          onChange={(e) => set("area", e.target.value)}
          placeholder="e.g. Vellore, Chennai…"
        />
      </div>

      <label style={styles.uploadZone}>
        <div style={{ fontSize: 12, color: T.muted }}>
          <span style={{ color: T.amber, fontWeight: 600 }}>Click to attach</span> a photo
          <br />
          <span style={{ fontSize: 11 }}>JPG, PNG up to 5MB</span>
        </div>
        {preview && (
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 7, marginTop: 8, maxHeight: 120, objectFit: "cover" }} />
        )}
        <input type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
      </label>

      <button style={styles.submitBtn} onClick={handleSubmit}>
        Submit Report →
      </button>
    </div>
  );
}

export default function ComplaintSystem() {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
    if (!match) {
      window.location.href = "/login";
    }
  }, []);
  const { complaints, addComplaint, toggleUpvote } = useComplaints();
  const stats = useStats(complaints);
  const [activeTab, setActiveTab] = useState("reports");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredComplaints = useMemo(() => {
    let list = complaints.filter((c) => {
      const matchCat = catFilter === "All" || c.category === catFilter;
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchSearch =
        !search ||
        (c.title + c.area + c.description).toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
    if (sortBy === "newest") list = list.sort((a, b) => b.createdAt - a.createdAt);
    else if (sortBy === "upvotes") list = list.sort((a, b) => b.upvotes - a.upvotes);
    else if (sortBy === "priority") {
      const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
      list = list.sort((a, b) => (order[a.priority] || 2) - (order[b.priority] || 2));
    }
    return list;
  }, [complaints, catFilter, statusFilter, search, sortBy]);

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>

        <div style={styles.leftCol}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.eyebrow}>Issue Tracker</div>
              <h1 style={styles.pageTitle}>Community Reports</h1>
              <p style={styles.pageSubtitle}>
                Live status of civic issues reported in your area
              </p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Pending" value={stats.pending} color={T.amber} />
            <StatCard label="In Progress" value={stats.inProgress} color={T.blue} />
            <StatCard label="Resolved" value={stats.resolved} color={T.green} sub={stats.resolved > 0 ? `avg ${stats.avgResolutionDays}d` : null} />
          </div>

          <div style={styles.navTabs}>
            {[
              { key: "reports", label: "Reports" },
              { key: "analytics", label: "Analytics" },
            ].map((t) => (
              <button
                key={t.key}
                style={{ ...styles.navTab, ...(activeTab === t.key ? styles.navTabActive : {}) }}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "reports" && (
            <>
              
              <div style={styles.filterRow}>
                <input
                  style={styles.searchInput}
                  placeholder="Search title, area, description…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div style={styles.selectWrap}>
                  <select
                    style={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    {["Pending", "In Progress", "Resolved"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.selectWrap}>
                  <select
                    style={styles.filterSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="upvotes">Most Upvoted</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>

              <div style={styles.catPills}>
                {["All", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    style={{
                      ...styles.catPill,
                      ...(catFilter === c ? styles.catPillActive : {}),
                    }}
                    onClick={() => setCatFilter(c)}
                  >
                    {c !== "All" && CAT_ICONS[c] + " "}{c}
                  </button>
                ))}
              </div>

              <div style={styles.list}>
                {filteredComplaints.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📋</div>
                    <p style={{ fontSize: 13, color: T.muted }}>
                      {complaints.length ? "No results match your filters." : "No reports yet. Submit one →"}
                    </p>
                  </div>
                ) : (
                  filteredComplaints.map((c) => (
                    <ComplaintCard key={c.id} complaint={c} onUpvote={toggleUpvote} />
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
              <HeatmapPanel heatmap={stats.heatmap} heatmapMax={stats.heatmapMax} />
              <BarChartPanel barData={stats.barData} barMax={stats.barMax} />
              <ResolutionPanel complaints={complaints} />
            </div>
          )}
        </div>

        <div style={styles.rightCol}>
          <SubmitForm onSubmit={addComplaint} />
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: 'Instrument Sans', sans-serif; }
  select { appearance: none; }
  button { font-family: 'Instrument Sans', sans-serif; }
  input, textarea, select { font-family: 'Instrument Sans', sans-serif; }
  textarea { resize: vertical; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
`;

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    minHeight: "100vh",
    background: T.surface,
    fontFamily: "'Instrument Sans', sans-serif",
  },
  leftCol: {
    padding: "40px 36px",
    borderRight: `1px solid ${T.border}`,
    overflowY: "auto",
  },
  rightCol: {
    padding: "40px 28px",
    background: T.white,
    overflowY: "auto",
  },
  pageHeader: { marginBottom: 28 },
  eyebrow: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: T.amber,
    marginBottom: 6,
  },
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 30,
    fontWeight: 600,
    color: T.charcoal,
    lineHeight: 1.15,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 13,
    color: T.muted,
    marginTop: 5,
    lineHeight: 1.5,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "16px 14px",
    textAlign: "center",
  },
  statNum: {
    fontFamily: "'Fraunces', serif",
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1,
    color: T.charcoal,
  },
  statLabel: {
    fontSize: 10,
    color: T.muted,
    fontWeight: 500,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginTop: 5,
  },
  statSub: {
    fontSize: 10,
    color: T.green,
    marginTop: 3,
    fontWeight: 500,
  },
  navTabs: {
    display: "flex",
    gap: 2,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    padding: 3,
    marginBottom: 20,
    width: "fit-content",
  },
  navTab: {
    padding: "7px 18px",
    border: "none",
    background: "none",
    fontSize: 13,
    fontWeight: 500,
    color: T.muted,
    cursor: "pointer",
    borderRadius: 6,
    transition: "all 0.18s",
  },
  navTabActive: {
    background: T.white,
    color: T.charcoal,
    boxShadow: "0 1px 4px rgba(0,0,0,0.09)",
  },
  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    padding: "9px 13px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 13,
    background: T.white,
    color: T.charcoal,
    outline: "none",
  },
  filterSelect: {
    padding: "9px 30px 9px 12px",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize: 13,
    background: T.white,
    color: T.charcoal,
    cursor: "pointer",
    outline: "none",
    width: "100%",
  },
  selectWrap: {
    position: "relative",
  },
  catPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  catPill: {
    padding: "5px 13px",
    borderRadius: 20,
    border: `1px solid ${T.border}`,
    background: T.white,
    fontSize: 12,
    color: T.muted,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  catPillActive: {
    background: T.charcoal,
    color: T.white,
    border: `1px solid ${T.charcoal}`,
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  complaintCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "16px 18px",
    transition: "border-color 0.18s",
  },
  cardTop: { display: "flex", justifyContent: "space-between" },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: T.charcoal,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  cardDesc: {
    fontSize: 12.5,
    color: T.muted,
    lineHeight: 1.55,
    marginBottom: 9,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 12px",
    fontSize: 11,
    color: "#B0A898",
  },
  upvoteBtn: {
    padding: "5px 10px",
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    background: T.surface,
    fontSize: 12,
    fontWeight: 600,
    color: T.muted,
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: T.surface,
    border: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    fontSize: 20,
  },
  panel: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: "22px 22px",
  },
  panelHeader: { marginBottom: 18 },
  panelTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 17,
    fontWeight: 600,
    color: T.charcoal,
    marginBottom: 3,
  },
  panelSub: {
    fontSize: 12,
    color: T.muted,
  },
  heatTh: {
    fontSize: 11,
    fontWeight: 600,
    color: T.muted,
    textAlign: "center",
    padding: "4px 6px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  heatAreaCell: {
    fontSize: 11,
    color: T.charcoal,
    fontWeight: 500,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    whiteSpace: "nowrap",
  },
  heatCell: {
    fontSize: 11,
    fontWeight: 600,
    textAlign: "center",
    borderRadius: 5,
    padding: "7px 4px",
    minWidth: 36,
    transition: "background 0.3s",
  },
  formPanel: {
    position: "sticky",
    top: 40,
  },
  formGroup: { marginBottom: 13 },
  formLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    color: T.muted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  formInput: {
    width: "100%",
    padding: "11px 13px",
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    fontSize: 13,
    background: T.surface,
    color: T.charcoal,
    outline: "none",
    transition: "border-color 0.18s",
  },
  formSelect: {
    width: "100%",
    padding: "11px 32px 11px 13px",
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    fontSize: 13,
    background: T.surface,
    color: T.charcoal,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
  },
  uploadZone: {
    display: "block",
    border: `1.5px dashed ${T.border}`,
    borderRadius: 9,
    padding: "16px",
    textAlign: "center",
    cursor: "pointer",
    background: T.surface,
    marginBottom: 14,
    transition: "border-color 0.18s",
  },
  submitBtn: {
    width: "100%",
    padding: 13,
    background: T.charcoal,
    color: T.white,
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "background 0.18s",
  },
  successBanner: {
    background: T.greenBg,
    color: T.green,
    border: `1px solid #C2E8D0`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
};