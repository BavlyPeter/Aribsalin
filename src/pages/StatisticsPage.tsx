import { useMemo } from 'react';
import { ArrowRight, Users, Calendar, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Participant } from '../types';
import { stageLabels, getParticipantClassStage } from '../app/utils/stageHelpers';

interface StatisticsPageProps {
  onBack: () => void;
  participants: Participant[];
  totalDays: number;
}

const educationStageLabels = stageLabels;

export function StatisticsPage({ onBack, participants, totalDays }: StatisticsPageProps) {
  const stats = useMemo(() => {
    const defaultStats = {
      totalParticipants: 0,
      males: 0,
      females: 0,
      genderData: [],
      averageAttendance: 0,
      topParticipants: [],
      topAttendance: [],
      totalPointsDistributed: 0,
      stageData: [],
      attendanceData: [],
      attendanceTimelineData: [],
      pointsDistributionData: [],
      avgAttendanceRate: 0,
      highAttendance: 0,
      totalAttendanceRecords: 0,
      allAttendanceDates: [],
      avgAttendancePerDay: 0,
      avgPoints: 0,
    };

    if (!participants || participants.length === 0) return defaultStats;

    const totalParticipants = participants.length;

    const males = participants.filter(p => p.data?.gender === 'male').length;
    const females = participants.filter(p => p.data?.gender === 'female').length;
    const genderData = [
      { name: 'ذكور', value: males, color: '#3b82f6' },
      { name: 'إناث', value: females, color: '#ec4899' }
    ].filter(d => d.value > 0);

    const totalAttendancePercentage = participants.reduce((sum, p) => {
      const attendedDays = p.attendanceDays?.length || 0;
      const percentage = totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;
      return sum + (percentage > 100 ? 100 : percentage);
    }, 0);
    const averageAttendance = totalParticipants > 0 ? Math.round(totalAttendancePercentage / totalParticipants) : 0;

    const topParticipants = [...participants]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name || p.data?.fullName || 'بدون اسم',
        points: p.points || 0,
        stage: p.data?.educationStage || p.data?.educational_stage || 'غير محدد',
        attendanceCount: p.attendanceDays?.length || 0
      }));

    const topAttendance = [...participants]
      .sort((a, b) => ((b.attendanceDays?.length || 0) - (a.attendanceDays?.length || 0)))
      .slice(0, 10)
      .map(p => ({
        id: p.id || Math.random().toString(),
        name: p.name || p.data?.fullName || 'بدون اسم',
        attendanceCount: p.attendanceDays?.length || 0
      }));

    const totalPointsDistributed = participants.reduce((sum, p) => sum + (p.points || 0), 0);

    const stageCounts: Record<string, number> = {};
    participants.forEach(p => {
      const stageKey = p.data?.educationStage || p.data?.educational_stage || 'أخرى';
      stageCounts[stageKey] = (stageCounts[stageKey] || 0) + 1;
    });

    const stageData = Object.entries(stageCounts).map(([name, value]) => ({
      name: educationStageLabels[name] || name,
      value
    }));

    const allAttendanceDates = Array.from(new Set(participants.flatMap(p => p.attendanceDays || []))).sort();
    const totalAttendanceRecords = allAttendanceDates.reduce((sum, date) => {
      return sum + participants.filter(p => (p.attendanceDays || []).includes(date)).length;
    }, 0);

    const avgAttendancePerDay = allAttendanceDates.length > 0
      ? Math.round(totalAttendanceRecords / allAttendanceDates.length)
      : 0;

    const avgPoints = totalParticipants > 0 ? Math.round(totalPointsDistributed / totalParticipants) : 0;

    const attendanceTimelineData = allAttendanceDates.slice(-14).map(date => {
      const count = participants.filter(p => (p.attendanceDays || []).includes(date)).length;
      const dateObj = new Date(date);
      return {
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        fullDate: date,
        attendance: count
      };
    });

    const pointsRanges = [
      { range: '0-50', min: 0, max: 50 },
      { range: '51-100', min: 51, max: 100 },
      { range: '101-150', min: 101, max: 150 },
      { range: '151-200', min: 151, max: 200 },
      { range: '200+', min: 201, max: Infinity }
    ];

    const pointsDistributionData = pointsRanges
      .map(({ range, min, max }) => ({
        range,
        count: participants.filter(p => (p.points || 0) >= min && (p.points || 0) <= max).length
      }))
      .filter(d => d.count > 0);

    const attendanceRates = participants.map(p => ({
      rate: totalDays > 0 ? ((p.attendanceDays?.length || 0) / totalDays) * 100 : 0
    }));

    const avgAttendanceRate = attendanceRates.length > 0
      ? attendanceRates.reduce((sum, r) => sum + r.rate, 0) / attendanceRates.length
      : 0;

    const highAttendance = participants.filter(p =>
      (((p.attendanceDays?.length || 0) / Math.max(1, totalDays)) * 100) >= 80
    ).length;

    // 6. Attendance Timeline (Curve)
    const dateCounts: Record<string, number> = {};
    participants.forEach(p => {
      if (p.attendanceDays && Array.isArray(p.attendanceDays)) {
        p.attendanceDays.forEach(date => {
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
      }
    });

    let timelineData = Object.entries(dateCounts)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, count]) => ({
        name: date,
        value: count
      }));

    if (timelineData.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      timelineData = [{ name: today, value: 0 }];
    }

    return {
      totalParticipants,
      males,
      females,
      genderData,
      averageAttendance,
      topParticipants,
      topAttendance,
      totalPointsDistributed,
      stageData,
      attendanceData: [],
      attendanceTimelineData: timelineData,
      pointsDistributionData,
      avgAttendanceRate,
      highAttendance,
      totalAttendanceRecords,
      allAttendanceDates,
      avgAttendancePerDay,
      avgPoints,
    };
  }, [participants, totalDays]);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">إحصائيات المهرجان</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-primary">{stats?.totalParticipants || 0}</div>
              <div className="text-xs text-muted-foreground">إجمالي المشاركين</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-green-600">{stats?.totalAttendanceRecords || 0}</div>
              <div className="text-xs text-muted-foreground">إجمالي الحضور</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-blue-600">{stats?.averageAttendance || 0}%</div>
              <div className="text-xs text-muted-foreground">متوسط الحضور</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1" style={{ color: 'var(--secondary)' }}>{stats?.totalPointsDistributed || 0}</div>
              <div className="text-xs text-muted-foreground">إجمالي النقاط الموزعة</div>
            </div>
          </div>
        </div>

        {/* Top Participants by Points */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-primary mb-4 text-center">أعلى المشاركين في النقاط</h3>
          <div className="space-y-2">
            {(stats?.topParticipants || []).map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-primary/60'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm truncate">{participant.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm" style={{ color: 'var(--secondary)' }}>{participant.points}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {educationStageLabels[participant.stage] || participant.stage}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {participant.attendanceCount} يوم ({((participant.attendanceCount / Math.max(1, totalDays)) * 100).toFixed(0)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-primary mb-4 text-center">توزيع المشاركين حسب النوع</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats?.genderData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {(stats?.genderData || []).map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.males || 0}</div>
              <div className="text-xs text-blue-700">ذكور</div>
              <div className="text-[11px] text-blue-600 mt-1">
                {Math.round(((stats?.males || 0) / (stats?.totalParticipants || 1)) * 100)}%
              </div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{stats?.females || 0}</div>
              <div className="text-xs text-pink-700">إناث</div>
              <div className="text-[11px] text-pink-600 mt-1">
                {Math.round(((stats?.females || 0) / (stats?.totalParticipants || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Students by Education Stage */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-primary mb-4 text-center">المشاركين حسب المرحلة الدراسية</h3>
            <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.stageData || []}>
              <CartesianGrid strokeDasharray="3 3" key="grid" />
              <XAxis dataKey="name" style={{ fontSize: '11px' }} key="xaxis" />
              <YAxis style={{ fontSize: '11px' }} key="yaxis" />
              <Tooltip key="tooltip" />
              <Legend key="legend" />
              <Bar dataKey="ذكور" fill="#3B82F6" key="male-bar" />
              <Bar dataKey="إناث" fill="#EC4899" key="female-bar" />
            </BarChart>
          </ResponsiveContainer>

          {/* Stage Details Table */}
          <div className="mt-4 space-y-2">
            {(stats?.stageData || []).map(stage => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">{stage.name}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-blue-600">ذكور: {stage.ذكور}</span>
                  <span className="text-pink-600">إناث: {stage.إناث}</span>
                  <span className="font-bold">المجموع: {stage.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Timeline */}
        {(stats?.attendanceTimelineData || []).length > 0 && (
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="text-primary mb-4 text-center">منحنى الحضور</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats?.attendanceTimelineData || []}>
                <CartesianGrid strokeDasharray="3 3" key="grid" />
                <XAxis dataKey="name" style={{ fontSize: '10px' }} key="xaxis" />
                <YAxis domain={[0, 'dataMax']} allowDecimals={false} style={{ fontSize: '11px' }} key="yaxis" />
                <Tooltip key="tooltip" />
                <Legend key="legend" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  name="الحضور"
                  key="attendance-line"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Points Distribution */}
        {(stats?.pointsDistributionData || []).length > 0 && (
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="text-primary mb-4 text-center">توزيع النقاط</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.pointsDistributionData || []}>
                <CartesianGrid strokeDasharray="3 3" key="grid" />
                <XAxis dataKey="range" style={{ fontSize: '11px' }} key="xaxis" />
                <YAxis style={{ fontSize: '11px' }} key="yaxis" />
                <Tooltip key="tooltip" />
                <Bar dataKey="count" fill="var(--secondary)" name="عدد المشاركين" key="points-bar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Attendance Rate Statistics */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-primary mb-4">إحصائيات نسبة الحضور</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">متوسط نسبة الحضور</span>
              <span className="text-lg font-bold text-primary">{(stats?.avgAttendanceRate || 0).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">مشاركين بحضور عالي (80%+)</span>
              <span className="text-lg font-bold text-green-600">{stats?.highAttendance || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">إجمالي أيام الحضور المسجلة</span>
              <span className="text-lg font-bold text-blue-600">{(stats?.allAttendanceDates || []).length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">إجمالي النقاط الموزعة</span>
              <span className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{stats?.totalPointsDistributed || 0}</span>
            </div>
          </div>
        </div>

        {/* Points Statistics by Class */}
        {Object.entries(educationStageLabels).map(([stageKey, stageLabel]) => {
          const stageParticipants = participants.filter(p => getParticipantClassStage(p.data?.educationStage || '', p.data?.educationYear || '') === stageKey);

          if (stageParticipants.length === 0) return null;

          const stageTotalPoints = stageParticipants.reduce((sum, p) => sum + (p.points || 0), 0);
          const stageAvgPoints = Math.round(stageTotalPoints / stageParticipants.length);
          const stageMaxPoints = Math.max(...stageParticipants.map(p => p.points || 0));
          const stageMinPoints = Math.min(...stageParticipants.map(p => p.points || 0));

          return (
            <div key={stageKey} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="text-primary mb-4">{stageLabel} - إحصائيات النقاط</h3>

              {/* Stage Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">إجمالي النقاط</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{stageTotalPoints}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">متوسط النقاط</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{stageAvgPoints}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">أعلى نقاط</div>
                  <div className="text-lg font-bold text-green-600">{stageMaxPoints}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">أقل نقاط</div>
                  <div className="text-lg font-bold text-blue-600">{stageMinPoints}</div>
                </div>
              </div>

              {/* Top 10 by Points */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--secondary)' }}>أعلى 10 مشاركين في النقاط</h4>
                <div className="space-y-2">
                  {stageParticipants
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .slice(0, 10)
                    .map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-primary/60'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm">{participant.name}</span>
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--secondary)' }}>{participant.points}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top 10 by Attendance */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">أعلى 10 مشاركين في الحضور</h4>
                <div className="space-y-2">
                  {stageParticipants
                    .sort((a, b) => ((b.attendanceDays?.length || 0) - (a.attendanceDays?.length || 0)))
                    .slice(0, 10)
                    .map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-green-400' :
                            index === 2 ? 'bg-green-300 text-gray-800' :
                            'bg-green-600/60'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm">{participant.name || participant.data?.fullName || 'بدون اسم'}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">{participant.attendanceDays?.length || 0} يوم</div>
                          <div className="text-xs text-muted-foreground">
                            {((((participant.attendanceDays?.length || 0)) / Math.max(1, totalDays)) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
