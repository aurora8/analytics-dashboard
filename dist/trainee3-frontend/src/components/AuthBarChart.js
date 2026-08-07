"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthBarChart;
const recharts_1 = require("recharts");
function AuthBarChart({ data }) {
    return (<div style={{ width: "100%", height: 300 }}>
      <h3>Success vs Failure</h3>
      <recharts_1.ResponsiveContainer width="100%" height="90%">
        <recharts_1.BarChart data={data}>
          <recharts_1.CartesianGrid strokeDasharray="3 3"/>
          <recharts_1.XAxis dataKey="label"/>
          <recharts_1.YAxis />
          <recharts_1.Tooltip />
          <recharts_1.Legend />
          <recharts_1.Bar dataKey="success" fill="#4caf50"/>
          <recharts_1.Bar dataKey="failure" fill="#f44336"/>
        </recharts_1.BarChart>
      </recharts_1.ResponsiveContainer>
    </div>);
}
