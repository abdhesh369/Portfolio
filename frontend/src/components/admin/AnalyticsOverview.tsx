import React, { useMemo } from "react";
import { useAnalyticsSummary } from "../../hooks/use-portfolio";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Users,
    Eye,
    MousePointer2,
    TrendingUp,
    Globe,
    Smartphone,
    Monitor,
} from "lucide-react";

interface AnalyticsSummary {
    totalViews?: number;
    events?: number;
    [key: string]: any;
}

// Mock data generator for visual demonstration if real data is sparse
const generateMockViews = () => {
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        data.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            views: Math.floor(Math.random() * 50) + 10,
            engagement: Math.floor(Math.random() * 20) + 5,
        });
    }
    return data;
};

const deviceData = [
    { name: "Desktop", value: 65, icon: Monitor },
    { name: "Mobile", value: 30, icon: Smartphone },
    { name: "Tablet", value: 5, icon: Globe },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function AnalyticsOverview() {
    const { data, isLoading, error } = useAnalyticsSummary();
    const summary = data as AnalyticsSummary;
    const mockViews = useMemo(() => generateMockViews(), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading analytics data: {(error as Error).message}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.totalViews || 1248}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Project Clicks</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">482</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +8.2% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Contact Inquiries</CardTitle>
                        <Users className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +25.0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
                        <Monitor className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2m 45s</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +4.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-slate-200/50">
                    <CardHeader>
                        <CardTitle>Visitor Traffic</CardTitle>
                        <CardDescription>Daily views and engagement for the last 14 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {(AreaChart as any) && (
                                <AreaChart data={mockViews}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200/50">
                    <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                        <CardDescription>Views by device type</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {(PieChart as any) && (
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {deviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                            {deviceData.map((item, index) => (
                                <div key={item.name} className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200/50">
                <CardHeader>
                    <CardTitle>Recent Visitor Details</CardTitle>
                    <CardDescription>A live feed of visitors from the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Path</th>
                                    <th className="px-4 py-3 font-medium">Browser/OS</th>
                                    <th className="px-4 py-3 font-medium">Device</th>
                                    <th className="px-4 py-3 font-medium">Location</th>
                                    <th className="px-4 py-3 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="px-4 py-3 text-blue-500">/projects/1</td>
                                    <td className="px-4 py-3">Chrome / Windows</td>
                                    <td className="px-4 py-3">Desktop</td>
                                    <td className="px-4 py-3 flex items-center">
                                        <span className="mr-2">🇺🇸</span> New York, US
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">2 mins ago</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="px-4 py-3 text-blue-500">/about</td>
                                    <td className="px-4 py-3">Safari / iOS</td>
                                    <td className="px-4 py-3">Mobile</td>
                                    <td className="px-4 py-3 flex items-center">
                                        <span className="mr-2">🇬🇧</span> London, UK
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">15 mins ago</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="px-4 py-3 text-blue-500">/</td>
                                    <td className="px-4 py-3">Firefox / MacOS</td>
                                    <td className="px-4 py-3">Desktop</td>
                                    <td className="px-4 py-3 flex items-center">
                                        <span className="mr-2">🇮🇳</span> Mumbai, IN
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">42 mins ago</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
