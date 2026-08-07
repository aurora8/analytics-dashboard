import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  data: { label: string; success: number; failure: number }[];
}

export default function AuthBarChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Success vs Failure</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="success" fill="#4caf50" />
          <Bar dataKey="failure" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}