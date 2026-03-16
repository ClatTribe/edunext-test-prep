'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Clock, Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Award, Brain, Zap, Activity, AlertTriangle } from 'lucide-react';

const PerformanceTab = ({ data }) => {
  const COLORS = {
    primary: '#060818',
    secondary: '#F59E0B',
    correct: '#10B981',
    incorrect: '#EF4444',
    unattempted: '#6B7280',
    bg: '#1F2937',
    card: '#111827',
    text: '#F3F4F6',
    border: '#374151'
  };

  if (!data) return null;

  const overallData = [{
    name: 'Your Test',
    Correct: data.overall.correct,
    Incorrect: data.overall.incorrect,
    Unattempted: data.overall.unattempted
  }];

  return (
    <div style={{ padding: '20px', maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
      {/* Quick Stats Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          background: COLORS.card, 
          padding: '14px', 
          borderRadius: '10px', 
          border: `2px solid ${COLORS.correct}` 
        }}>
          <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
            ✅ CORRECT
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.correct }}>
            {data.overall.correct}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
            +{data.overall.totalPositiveMarks} marks
          </div>
        </div>

        <div style={{ 
          background: COLORS.card, 
          padding: '14px', 
          borderRadius: '10px', 
          border: `2px solid ${COLORS.incorrect}` 
        }}>
          <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
            ❌ INCORRECT
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.incorrect }}>
            {data.overall.incorrect}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
            -{data.overall.negativeMarks} marks
          </div>
        </div>

        <div style={{ 
          background: COLORS.card, 
          padding: '14px', 
          borderRadius: '10px', 
          border: `2px solid ${COLORS.unattempted}` 
        }}>
          <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
            ⭕ SKIPPED
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.unattempted }}>
            {data.overall.unattempted}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
            {Math.round((data.overall.unattempted / data.overall.totalQuestions) * 100)}% left
          </div>
        </div>

        <div style={{ 
          background: COLORS.card, 
          padding: '14px', 
          borderRadius: '10px', 
          border: `2px solid ${COLORS.secondary}` 
        }}>
          <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
            🎯 ACCURACY
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.secondary }}>
            {data.overall.accuracy}%
          </div>
          <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
            {data.overall.correct}/{data.overall.correct + data.overall.incorrect} attempted
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '16px' 
      }}>
        
        {/* 1️⃣ OVERALL PERFORMANCE */}
        <div style={{ 
          background: COLORS.card, 
          padding: '18px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`,
          gridColumn: 'span 1'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
            1️⃣ Overall Performance
          </h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
            Distribution of correct, incorrect & unattempted questions
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overallData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" stroke={COLORS.text} style={{ fontSize: '11px' }} />
              <YAxis stroke={COLORS.text} style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: COLORS.bg, 
                  border: `1px solid ${COLORS.secondary}`, 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
              />
              <Bar dataKey="Correct" stackId="a" fill={COLORS.correct} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Incorrect" stackId="a" fill={COLORS.incorrect} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Unattempted" stackId="a" fill={COLORS.unattempted} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ 
            marginTop: '12px', 
            padding: '10px', 
            background: COLORS.bg, 
            borderRadius: '8px', 
            fontSize: '11px',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: COLORS.secondary }}>💡 Insight:</strong> {
              data.overall.unattempted > data.overall.totalQuestions * 0.2 
                ? 'Conservative approach - attempt more questions!' 
                : data.overall.incorrect > data.overall.correct 
                  ? 'Over-attempting - focus on accuracy first'
                  : 'Good balance between attempt rate and accuracy'
            }
          </div>
        </div>

        {/* 2️⃣ SUBJECT-WISE PERFORMANCE */}
        <div style={{ 
          background: COLORS.card, 
          padding: '18px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`,
          gridColumn: 'span 1'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
            2️⃣ Subject-wise Performance
          </h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
            Marks scored vs maximum marks per subject
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.subjectWise}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="subject" stroke={COLORS.text} style={{ fontSize: '10px' }} />
              <YAxis stroke={COLORS.text} style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: COLORS.bg, 
                  border: `1px solid ${COLORS.secondary}`, 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
              />
              <Bar dataKey="marks" fill={COLORS.secondary} name="Marks Scored" radius={[4, 4, 0, 0]}>
                {data.subjectWise.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.marks < 0 ? COLORS.incorrect : COLORS.secondary} />
                ))}
              </Bar>
              <Bar dataKey="accuracy" fill={COLORS.correct} name="Accuracy %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {data.subjectWise.map((subject, idx) => (
              <div key={idx} style={{ 
                flex: '1 1 140px',
                padding: '8px', 
                background: COLORS.bg, 
                borderRadius: '6px', 
                fontSize: '11px' 
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{subject.subject}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                  <span>{subject.marks}/{subject.maxMarks}</span>
                  <span style={{ color: COLORS.correct }}>{subject.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3️⃣ CHAPTER-WISE ACCURACY */}
        <div style={{ 
          background: COLORS.card, 
          padding: '18px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`,
          gridColumn: 'span 2'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
            3️⃣ Chapter-wise Accuracy
          </h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
            Performance across different chapters (Top 10 shown)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.chapterWise.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" stroke={COLORS.text} style={{ fontSize: '11px' }} domain={[0, 100]} />
              <YAxis 
                dataKey="chapter" 
                type="category" 
                stroke={COLORS.text} 
                style={{ fontSize: '10px' }} 
                width={120}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Tooltip 
                contentStyle={{ 
                  background: COLORS.bg, 
                  border: `1px solid ${COLORS.secondary}`, 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
              />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {data.chapterWise.slice(0, 10).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.accuracy >= 75 ? COLORS.correct : 
                      entry.accuracy >= 50 ? COLORS.secondary : 
                      COLORS.incorrect
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ 
            marginTop: '12px', 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px'
          }}>
            <div style={{ padding: '8px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px' }}>
              <strong style={{ color: COLORS.correct }}>✅ Strongest:</strong> {data.chapterWise[0]?.chapter} ({data.chapterWise[0]?.accuracy}%)
            </div>
            <div style={{ padding: '8px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px' }}>
              <strong style={{ color: COLORS.incorrect }}>⚠️ Weakest:</strong> {data.chapterWise[data.chapterWise.length - 1]?.chapter} ({data.chapterWise[data.chapterWise.length - 1]?.accuracy}%)
            </div>
          </div>
        </div>

        {/* 4️⃣ DIFFICULTY ANALYSIS */}
        <div style={{ 
          background: COLORS.card, 
          padding: '18px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`,
          gridColumn: 'span 2'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
            4️⃣ Difficulty vs Accuracy
          </h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
            How you performed across different difficulty levels
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.difficultyWise}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="difficulty" stroke={COLORS.text} style={{ fontSize: '11px' }} />
              <YAxis stroke={COLORS.text} style={{ fontSize: '11px' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  background: COLORS.bg, 
                  border: `1px solid ${COLORS.secondary}`, 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke={COLORS.secondary} 
                strokeWidth={3}
                name="Accuracy %"
                dot={{ fill: COLORS.secondary, r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="attemptRate" 
                stroke={COLORS.correct} 
                strokeWidth={3}
                name="Attempt Rate %"
                dot={{ fill: COLORS.correct, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {data.difficultyWise.map((diff, idx) => (
              <div key={idx} style={{ 
                flex: 1,
                padding: '10px', 
                background: COLORS.bg, 
                borderRadius: '8px', 
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '6px', color: COLORS.secondary }}>
                  {diff.difficulty}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  Accuracy: <strong style={{ color: COLORS.secondary }}>{diff.accuracy}%</strong>
                </div>
                <div>
                  Attempted: <strong style={{ color: COLORS.correct }}>{diff.attemptRate}%</strong>
                </div>
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '12px', 
            padding: '10px', 
            background: COLORS.bg, 
            borderRadius: '8px', 
            fontSize: '11px'
          }}>
            <strong style={{ color: COLORS.secondary }}>💡 Strategy:</strong> {
              data.difficultyWise.find(d => d.difficulty === 'Hard')?.attemptRate < 50
                ? 'You are avoiding hard questions - build confidence by practicing them!'
                : data.difficultyWise.find(d => d.difficulty === 'Easy')?.accuracy < 80
                  ? 'Focus on silly mistakes in easy questions - they are high-value!'
                  : 'Good strategy - maintain this approach!'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeAnalysisTab = ({ data }) => {
    const COLORS = {
      primary: '#060818',
      secondary: '#F59E0B',
      correct: '#10B981',
      incorrect: '#EF4444',
      unattempted: '#6B7280',
      bg: '#1F2937',
      card: '#111827',
      text: '#F3F4F6',
      border: '#374151',
      purple: '#8B5CF6',
      blue: '#3B82F6'
    };
  
    if (!data) return null;
  
    const timelineData = data.sectionTimeline.map((section, idx) => ({
      name: section.section,
      start: 0,
      duration: Math.round(section.duration / 60),
      order: idx + 1
    }));
  
    const PIE_COLORS = [COLORS.secondary, COLORS.correct, COLORS.incorrect, COLORS.purple, COLORS.blue];
  
    return (
      <div style={{ padding: '20px', maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
        
        {/* Time Stats Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.secondary}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              ⏱️ TOTAL TIME
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.secondary }}>
              {Math.round((data.session?.total_time_seconds || 0) / 60)} min
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              of {data.session?.duration_minutes || 180} min available
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.correct}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              ⚡ AVG PER QUESTION
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.correct }}>
              {Math.round((data.session?.total_time_seconds || 0) / data.overall.totalQuestions / 60 * 10) / 10} min
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              Target: ~2 min/question
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.incorrect}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              🔄 REVISITS
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.incorrect }}>
              {data.visitBuckets.multiple}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              Questions visited 4+ times
            </div>
          </div>
        </div>
  
        {/* Charts Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '16px' 
        }}>
  
          {/* 5️⃣ TIME VS MARKS SCATTER PLOT */}
          <div style={{ 
            background: COLORS.card, 
            padding: '18px', 
            borderRadius: '12px', 
            border: `1px solid ${COLORS.border}`,
            gridColumn: 'span 2'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
              5️⃣ Time Spent vs Correctness
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
              Each dot represents a question - see if more time = better results
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis 
                  dataKey="time" 
                  name="Time (min)" 
                  stroke={COLORS.text} 
                  style={{ fontSize: '11px' }}
                  label={{ value: 'Time (minutes)', position: 'bottom', fill: COLORS.text, fontSize: 11 }}
                />
                <YAxis 
                  dataKey="correct" 
                  name="Result" 
                  stroke={COLORS.text} 
                  style={{ fontSize: '11px' }}
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  tickFormatter={(value) => value === 1 ? 'Correct' : 'Wrong'}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: COLORS.bg, 
                    border: `1px solid ${COLORS.secondary}`, 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  formatter={(value, name) => {
                    if (name === 'Result') return value === 1 ? 'Correct ✅' : 'Wrong ❌';
                    return `${value} min`;
                  }}
                />
                <Scatter 
                  data={data.timeVsMarks} 
                  fill={COLORS.secondary}
                  shape="circle"
                >
                  {data.timeVsMarks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.correct ? COLORS.correct : COLORS.incorrect} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ 
              marginTop: '12px', 
              padding: '10px', 
              background: COLORS.bg, 
              borderRadius: '8px', 
              fontSize: '11px',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: COLORS.secondary }}>💡 Insight:</strong> {
                (() => {
                  const longTimeCorrect = data.timeVsMarks.filter(q => q.time > 3 && q.correct).length;
                  const longTimeWrong = data.timeVsMarks.filter(q => q.time > 3 && !q.correct).length;
                  if (longTimeWrong > longTimeCorrect) {
                    return 'Spending too much time on questions you get wrong anyway - learn to move on!';
                  }
                  return 'Good time management - your time investment is paying off!';
                })()
              }
            </div>
          </div>
  
          {/* 6️⃣ SUBJECT TIME DISTRIBUTION PIE */}
          <div style={{ 
            background: COLORS.card, 
            padding: '18px', 
            borderRadius: '12px', 
            border: `1px solid ${COLORS.border}`
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
              6️⃣ Subject Time Distribution
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
              How you allocated time across subjects
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.subjectTimeData}
                  dataKey="time"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.subject}: ${entry.time}m`}
                  labelStyle={{ fontSize: '11px', fill: COLORS.text, fontWeight: '600' }}
                >
                  {data.subjectTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: COLORS.bg, 
                    border: `1px solid ${COLORS.secondary}`, 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ 
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {data.subjectTimeData.map((subject, idx) => (
                <div key={idx} style={{ 
                  padding: '8px', 
                  background: COLORS.bg, 
                  borderRadius: '6px', 
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '3px', 
                      background: PIE_COLORS[idx % PIE_COLORS.length] 
                    }} />
                    <span style={{ fontWeight: '600' }}>{subject.subject}</span>
                  </div>
                  <div>
                    <span style={{ color: COLORS.secondary }}>{subject.time} min</span>
                    <span style={{ opacity: 0.6, marginLeft: '8px' }}>({subject.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* 7️⃣ SECTION TIMELINE */}
          {data.sectionTimeline.length > 0 && (
            <div style={{ 
              background: COLORS.card, 
              padding: '18px', 
              borderRadius: '12px', 
              border: `1px solid ${COLORS.border}`
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
                7️⃣ Section Timeline
              </h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
                How you moved through different test sections
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timelineData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis 
                    dataKey="duration" 
                    stroke={COLORS.text} 
                    style={{ fontSize: '11px' }}
                    label={{ value: 'Minutes', position: 'bottom', fill: COLORS.text, fontSize: 11 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={COLORS.text} 
                    style={{ fontSize: '10px' }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: COLORS.bg, 
                      border: `1px solid ${COLORS.secondary}`, 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }} 
                  />
                  <Bar dataKey="duration" fill={COLORS.secondary} radius={[0, 4, 4, 0]}>
                    {timelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: COLORS.bg, 
                borderRadius: '8px', 
                fontSize: '11px'
              }}>
                {timelineData.length > 1 && timelineData[timelineData.length - 1].duration < timelineData[0].duration / 2 && (
                  <div style={{ color: COLORS.incorrect }}>
                    ⚠️ <strong>Rush detected!</strong> Last section was rushed - practice maintaining consistency
                  </div>
                )}
                {timelineData.every(s => Math.abs(s.duration - timelineData[0].duration) < 10) && (
                  <div style={{ color: COLORS.correct }}>
                    ✅ <strong>Great pacing!</strong> Maintained consistent time across sections
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* 8️⃣ VISIT COUNT ANALYSIS */}
          <div style={{ 
            background: COLORS.card, 
            padding: '18px', 
            borderRadius: '12px', 
            border: `1px solid ${COLORS.border}`,
            gridColumn: 'span 2'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
              8️⃣ Question Revisit Pattern
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
              How many times did you revisit questions?
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
              <div style={{ 
                padding: '16px', 
                background: COLORS.bg, 
                borderRadius: '10px',
                border: `2px solid ${COLORS.correct}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>1 Visit (Decisive)</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.correct }}>
                  {data.visitBuckets.single}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                  {Math.round((data.visitBuckets.single / data.overall.totalQuestions) * 100)}% of questions
                </div>
              </div>
  
              <div style={{ 
                padding: '16px', 
                background: COLORS.bg, 
                borderRadius: '10px',
                border: `2px solid ${COLORS.secondary}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>2-3 Visits (Normal)</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.secondary }}>
                  {data.visitBuckets.two_three}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                  {Math.round((data.visitBuckets.two_three / data.overall.totalQuestions) * 100)}% of questions
                </div>
              </div>
  
              <div style={{ 
                padding: '16px', 
                background: COLORS.bg, 
                borderRadius: '10px',
                border: `2px solid ${COLORS.incorrect}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>4+ Visits (Overthinking)</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.incorrect }}>
                  {data.visitBuckets.multiple}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                  {Math.round((data.visitBuckets.multiple / data.overall.totalQuestions) * 100)}% of questions
                </div>
              </div>
            </div>
  
            <div style={{ 
              padding: '12px', 
              background: COLORS.bg, 
              borderRadius: '8px', 
              fontSize: '11px',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: COLORS.secondary }}>💡 Insight:</strong> {
                data.visitBuckets.multiple > 15 
                  ? 'High overthinking detected! Set a rule: Max 2 revisits per question to save time.'
                  : data.visitBuckets.single > data.overall.totalQuestions * 0.6
                    ? 'Excellent decisiveness! You trust your first instinct.'
                    : 'Balanced approach - good use of review feature.'
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PsychologyTab = ({ data }) => {
    const COLORS = {
      primary: '#060818',
      secondary: '#F59E0B',
      correct: '#10B981',
      incorrect: '#EF4444',
      unattempted: '#6B7280',
      bg: '#1F2937',
      card: '#111827',
      text: '#F3F4F6',
      border: '#374151',
      purple: '#8B5CF6'
    };
  
    if (!data) return null;
  
    // Answer Change Analysis
    const answerChangeData = [];
    let wrongToCorrect = 0;
    let wrongToWrong = 0;
  
    data.responses.forEach(r => {
      if (r.answer_change_count > 0) {
        if (r.is_correct) wrongToCorrect++;
        else wrongToWrong++;
      }
    });
  
    answerChangeData.push(
      { type: 'Changed to ✅', count: wrongToCorrect, color: COLORS.correct },
      { type: 'Changed to ❌', count: wrongToWrong, color: COLORS.incorrect }
    );
  
    // Confidence Analysis
    const confidenceData = [];
    [1, 2, 3, 4, 5].forEach(level => {
      const responses = data.responses.filter(r => r.confidence_level === level && r.is_attempted);
      if (responses.length > 0) {
        const correct = responses.filter(r => r.is_correct).length;
        confidenceData.push({
          confidence: level,
          accuracy: Math.round((correct / responses.length) * 100),
          count: responses.length
        });
      }
    });
  
    // Attempt Sequence (Fatigue Analysis)
    const sequenceData = [];
    const windowSize = 10;
    
    const sortedResponses = [...data.responses]
      .filter(r => r.attempt_sequence_number)
      .sort((a, b) => a.attempt_sequence_number - b.attempt_sequence_number);
  
    for (let i = windowSize - 1; i < sortedResponses.length; i++) {
      const window = sortedResponses.slice(i - windowSize + 1, i + 1);
      const correctInWindow = window.filter(r => r.is_correct).length;
      sequenceData.push({
        sequence: i + 1,
        accuracy: Math.round((correctInWindow / windowSize) * 100)
      });
    }
  
    return (
      <div style={{ padding: '20px', maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
        
        {/* Psychology Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.secondary}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              📝 MARKED FOR REVIEW
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.secondary }}>
              {data.reviewData.markedAndAnswered + data.reviewData.markedOnly}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              {data.reviewData.correctMarked} correct, {data.reviewData.wrongMarked} wrong
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.correct}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              🔄 ANSWER CHANGES
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.correct }}>
              {data.responses.filter(r => r.answer_change_count > 0).length}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              Total changes made
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card, 
            padding: '14px', 
            borderRadius: '10px', 
            border: `2px solid ${COLORS.purple}` 
          }}>
            <div style={{ fontSize: '10px', color: COLORS.text, opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
              🎯 FIRST ATTEMPT
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.purple }}>
              {Math.round((data.responses.filter(r => r.total_visits === 1 && r.is_correct).length / data.visitBuckets.single) * 100) || 0}%
            </div>
            <div style={{ fontSize: '11px', color: COLORS.text, opacity: 0.6, marginTop: '4px' }}>
              First instinct accuracy
            </div>
          </div>
        </div>
  
        {/* Charts Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '16px' 
        }}>
  
          {/* 9️⃣ REVIEW ANALYSIS */}
          <div style={{ 
            background: COLORS.card, 
            padding: '18px', 
            borderRadius: '12px', 
            border: `1px solid ${COLORS.border}`
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
              9️⃣ Marked for Review Impact
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
              Did marking questions for review help or hurt?
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{
                name: 'Review',
                'Marked Only': data.reviewData.markedOnly,
                'Marked & Answered': data.reviewData.markedAndAnswered,
                'Not Marked': data.reviewData.notMarked
              }]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" stroke={COLORS.text} style={{ fontSize: '11px' }} />
                <YAxis stroke={COLORS.text} style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: COLORS.bg, 
                    border: `1px solid ${COLORS.secondary}`, 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="Marked Only" stackId="a" fill={COLORS.unattempted} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Marked & Answered" stackId="a" fill={COLORS.secondary} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Not Marked" stackId="a" fill={COLORS.correct} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px' }}>
                <strong>Marked & Got Right:</strong> <span style={{ color: COLORS.correct, float: 'right' }}>{data.reviewData.correctMarked}</span>
              </div>
              <div style={{ padding: '8px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px' }}>
                <strong>Marked & Got Wrong:</strong> <span style={{ color: COLORS.incorrect, float: 'right' }}>{data.reviewData.wrongMarked}</span>
              </div>
              <div style={{ padding: '8px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px' }}>
                <strong>Review Success Rate:</strong> 
                <span style={{ color: COLORS.secondary, float: 'right' }}>
                  {data.reviewData.markedAndAnswered > 0 
                    ? Math.round((data.reviewData.correctMarked / data.reviewData.markedAndAnswered) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              padding: '10px', 
              background: COLORS.bg, 
              borderRadius: '8px', 
              fontSize: '11px'
            }}>
              <strong style={{ color: COLORS.secondary }}>💡 Insight:</strong> {
                data.reviewData.markedOnly > 10
                  ? 'You marked many but left them unanswered - practice answering marked questions!'
                  : data.reviewData.correctMarked > data.reviewData.wrongMarked
                    ? 'Review strategy is working well - keep using it for difficult questions!'
                    : 'Review often leads to wrong answers - trust your first instinct more!'
              }
            </div>
          </div>
  
          {/* 🔟 ANSWER CHANGE IMPACT */}
          <div style={{ 
            background: COLORS.card, 
            padding: '18px', 
            borderRadius: '12px', 
            border: `1px solid ${COLORS.border}`
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
              🔟 Answer Change Impact
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
              Second guessing: Friend or foe?
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={answerChangeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="type" stroke={COLORS.text} style={{ fontSize: '10px' }} />
                <YAxis stroke={COLORS.text} style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: COLORS.bg, 
                    border: `1px solid ${COLORS.secondary}`, 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {answerChangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Total Changes:</strong> <span style={{ float: 'right', color: COLORS.secondary }}>{wrongToCorrect + wrongToWrong}</span>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Net Impact:</strong> 
                  <span style={{ 
                    float: 'right', 
                    color: wrongToCorrect > wrongToWrong ? COLORS.correct : COLORS.incorrect,
                    fontWeight: '700'
                  }}>
                    {wrongToCorrect > wrongToWrong ? '+' : ''}{(wrongToCorrect - wrongToWrong) * 4} marks
                  </span>
                </div>
              </div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              padding: '10px', 
              background: wrongToCorrect > wrongToWrong ? 
                `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, ${COLORS.bg} 100%)` : 
                `linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, ${COLORS.bg} 100%)`,
              borderRadius: '8px', 
              fontSize: '11px',
              border: `1px solid ${wrongToCorrect > wrongToWrong ? COLORS.correct : COLORS.incorrect}`
            }}>
              <strong style={{ color: COLORS.secondary }}>
                {wrongToCorrect > wrongToWrong ? '✅ Verdict:' : '⚠️ Warning:'}
              </strong> {
                wrongToCorrect > wrongToWrong
                  ? 'Your second thoughts improve answers - keep reconsidering!'
                  : 'Changing answers hurts you - trust your first instinct!'
              }
            </div>
          </div>
  
          {/* 1️⃣1️⃣ CONFIDENCE VS ACCURACY */}
          {confidenceData.length > 0 && (
            <div style={{ 
              background: COLORS.card, 
              padding: '18px', 
              borderRadius: '12px', 
              border: `1px solid ${COLORS.border}`,
              gridColumn: 'span 2'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
                1️⃣1️⃣ Confidence vs Accuracy
              </h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
                Are you overconfident or underconfident?
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis 
                    dataKey="confidence" 
                    name="Confidence Level" 
                    stroke={COLORS.text} 
                    style={{ fontSize: '11px' }}
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    label={{ value: 'Confidence Level (1-5)', position: 'bottom', fill: COLORS.text, fontSize: 11 }}
                  />
                  <YAxis 
                    dataKey="accuracy" 
                    name="Accuracy" 
                    stroke={COLORS.text} 
                    style={{ fontSize: '11px' }}
                    domain={[0, 100]}
                    label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', fill: COLORS.text, fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: COLORS.bg, 
                      border: `1px solid ${COLORS.secondary}`, 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }}
                    formatter={(value, name) => {
                      if (name === 'Accuracy') return `${value}%`;
                      return value;
                    }}
                  />
                  <Scatter data={confidenceData} fill={COLORS.secondary}>
                    {confidenceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.confidence > 3 && entry.accuracy < 60 ? COLORS.incorrect :
                          entry.confidence <= 2 && entry.accuracy > 80 ? COLORS.correct :
                          COLORS.secondary
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ 
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {confidenceData.map((conf, idx) => (
                  <div key={idx} style={{ 
                    padding: '8px', 
                    background: COLORS.bg, 
                    borderRadius: '6px', 
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Confidence {conf.confidence}/5
                    </div>
                    <div>
                      {conf.count} questions | <span style={{ color: COLORS.secondary }}>{conf.accuracy}%</span> correct
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: COLORS.bg, 
                borderRadius: '8px', 
                fontSize: '11px'
              }}>
                <strong style={{ color: COLORS.secondary }}>💡 Psychology:</strong> {
                  (() => {
                    const highConfLowAcc = confidenceData.find(c => c.confidence >= 4 && c.accuracy < 60);
                    const lowConfHighAcc = confidenceData.find(c => c.confidence <= 2 && c.accuracy > 80);
                    
                    if (highConfLowAcc) return 'Overconfidence detected! You feel sure but get it wrong - double check high-confidence answers.';
                    if (lowConfHighAcc) return 'You underestimate yourself! Your low-confidence answers are often correct - trust yourself more.';
                    return 'Well-calibrated confidence - you know what you know!';
                  })()
                }
              </div>
            </div>
          )}
  
          {/* 1️⃣3️⃣ FATIGUE PATTERN */}
          {sequenceData.length > 0 && (
            <div style={{ 
              background: COLORS.card, 
              padding: '18px', 
              borderRadius: '12px', 
              border: `1px solid ${COLORS.border}`,
              gridColumn: 'span 2'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.secondary, fontWeight: '700' }}>
                1️⃣3️⃣ Fatigue Pattern (Rolling Accuracy)
              </h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: COLORS.text, opacity: 0.6 }}>
                Did your performance drop as the test progressed?
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={sequenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis 
                    dataKey="sequence" 
                    stroke={COLORS.text} 
                    style={{ fontSize: '11px' }}
                    label={{ value: 'Question Number', position: 'bottom', fill: COLORS.text, fontSize: 11 }}
                  />
                  <YAxis 
                    stroke={COLORS.text} 
                    style={{ fontSize: '11px' }}
                    domain={[0, 100]}
                    label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', fill: COLORS.text, fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: COLORS.bg, 
                      border: `1px solid ${COLORS.secondary}`, 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={COLORS.secondary} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.secondary, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ 
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>
                  <div style={{ opacity: 0.7, marginBottom: '4px' }}>First 30%</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.correct }}>
                    {sequenceData[Math.floor(sequenceData.length * 0.3)]?.accuracy || 0}%
                  </div>
                </div>
                <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>
                  <div style={{ opacity: 0.7, marginBottom: '4px' }}>Middle 30%</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.secondary }}>
                    {sequenceData[Math.floor(sequenceData.length * 0.5)]?.accuracy || 0}%
                  </div>
                </div>
                <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>
                  <div style={{ opacity: 0.7, marginBottom: '4px' }}>Last 30%</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.incorrect }}>
                    {sequenceData[Math.floor(sequenceData.length * 0.9)]?.accuracy || 0}%
                  </div>
                </div>
              </div>
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: COLORS.bg, 
                borderRadius: '8px', 
                fontSize: '11px'
              }}>
                <strong style={{ color: COLORS.secondary }}>💡 Stamina Check:</strong> {
                  (() => {
                    const startAcc = sequenceData[Math.floor(sequenceData.length * 0.2)]?.accuracy || 0;
                    const endAcc = sequenceData[Math.floor(sequenceData.length * 0.9)]?.accuracy || 0;
                    const drop = startAcc - endAcc;
                    
                    if (drop > 20) return `Severe fatigue! Accuracy dropped ${drop}% - practice full-length tests to build stamina.`;
                    if (drop > 10) return `Moderate fatigue detected (${drop}% drop) - take short breaks during practice tests.`;
                    if (drop < 0) return `Strong finish! You actually improved towards the end - excellent mental stamina!`;
                    return `Consistent performance throughout - great test-taking endurance!`;
                  })()
                }
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SummaryTab = ({ data }) => {
    const COLORS = {
      primary: '#060818',
      secondary: '#F59E0B',
      correct: '#10B981',
      incorrect: '#EF4444',
      unattempted: '#6B7280',
      bg: '#1F2937',
      card: '#111827',
      text: '#F3F4F6',
      border: '#374151',
      purple: '#8B5CF6'
    };
  
    if (!data) return null;
  
    // Calculate improvement potential
    const weakChapters = data.chapterWise.filter(c => c.accuracy < 60);
    const potentialFromChapters = weakChapters.reduce((sum, c) => {
      const possibleImprovement = Math.floor((100 - c.accuracy) / 100 * c.attempted * 4);
      return sum + possibleImprovement;
    }, 0);
  
    const unattemptedMarks = data.overall.unattempted * 4;
    const negativeRecovery = data.overall.negativeMarks;
    
    const totalPotential = potentialFromChapters + Math.floor(unattemptedMarks * 0.5) + Math.floor(negativeRecovery * 0.7);
  
    // Identify top strengths and weaknesses
    const topStrengths = [];
    const topWeaknesses = [];
  
    // Subject strengths
    data.subjectWise.forEach(s => {
      if (s.accuracy >= 70) topStrengths.push(`${s.subject}: ${s.accuracy}% accuracy`);
      if (s.accuracy < 50) topWeaknesses.push(`${s.subject}: Only ${s.accuracy}% accuracy`);
    });
  
    // Chapter strengths
    if (data.chapterWise[0]?.accuracy >= 80) {
      topStrengths.push(`${data.chapterWise[0].chapter}: ${data.chapterWise[0].accuracy}% mastery`);
    }
    if (data.chapterWise[data.chapterWise.length - 1]?.accuracy < 50) {
      topWeaknesses.push(`${data.chapterWise[data.chapterWise.length - 1].chapter}: Needs urgent attention`);
    }
  
    // Difficulty handling
    const easyDiff = data.difficultyWise.find(d => d.difficulty === 'Easy');
    const hardDiff = data.difficultyWise.find(d => d.difficulty === 'Hard');
    
    if (easyDiff?.accuracy >= 85) topStrengths.push(`Strong basics: ${easyDiff.accuracy}% in easy questions`);
    if (easyDiff?.accuracy < 75) topWeaknesses.push(`Silly mistakes: Only ${easyDiff.accuracy}% in easy questions`);
    if (hardDiff?.attemptRate < 50) topWeaknesses.push(`Avoiding hard questions: ${hardDiff.attemptRate}% attempt rate`);
  
    // Time management
    const avgTimePerQ = (data.session?.total_time_seconds || 0) / data.overall.totalQuestions / 60;
    if (avgTimePerQ < 2.5) topStrengths.push('Excellent time management');
    if (avgTimePerQ > 3) topWeaknesses.push('Slow pacing - too much time per question');
  
    // Decision making
    if (data.visitBuckets.single > data.overall.totalQuestions * 0.6) {
      topStrengths.push('Decisive - trusts first instinct');
    }
    if (data.visitBuckets.multiple > 15) {
      topWeaknesses.push(`Overthinking on ${data.visitBuckets.multiple} questions`);
    }
  
    return (
      <div style={{ padding: '20px', maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
        
        {/* Header Card */}
        <div style={{ 
          background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.purple} 100%)`,
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '20px',
          color: COLORS.primary
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Award size={32} />
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              Test Performance Summary
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Complete analysis with actionable insights to improve your score by up to <strong>+{totalPotential} marks</strong>
          </p>
        </div>
  
        {/* Scorecard Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: COLORS.card,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.correct}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
              ✅ CORRECT
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: COLORS.correct }}>
              {data.overall.correct}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              +{data.overall.totalPositiveMarks} marks
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.incorrect}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
              ❌ INCORRECT
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: COLORS.incorrect }}>
              {data.overall.incorrect}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              -{data.overall.negativeMarks} marks
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.unattempted}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
              ⭕ SKIPPED
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: COLORS.unattempted }}>
              {data.overall.unattempted}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {Math.round((data.overall.unattempted / data.overall.totalQuestions) * 100)}% left
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.secondary}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
              🎯 ACCURACY
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: COLORS.secondary }}>
              {data.overall.accuracy}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {data.overall.correct}/{data.overall.correct + data.overall.incorrect}
            </div>
          </div>
  
          <div style={{ 
            background: COLORS.card,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.purple}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>
              💯 FINAL SCORE
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: COLORS.purple }}>
              {data.overall.marksObtained}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              / {data.overall.maxPossibleMarks}
            </div>
          </div>
        </div>
  
        {/* Strengths & Weaknesses */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: COLORS.card,
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.correct}`
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '15px'
            }}>
              <TrendingUp size={20} color={COLORS.correct} />
              <h3 style={{ margin: 0, fontSize: '16px', color: COLORS.correct, fontWeight: '700' }}>
                Your Strengths
              </h3>
            </div>
            <ul style={{ 
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              lineHeight: '2',
              color: COLORS.text
            }}>
              {topStrengths.slice(0, 6).map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
              {topStrengths.length === 0 && <li style={{ opacity: 0.6 }}>Keep working - strengths will emerge!</li>}
            </ul>
          </div>
  
          <div style={{ 
            background: COLORS.card,
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.incorrect}`
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '15px'
            }}>
              <TrendingDown size={20} color={COLORS.incorrect} />
              <h3 style={{ margin: 0, fontSize: '16px', color: COLORS.incorrect, fontWeight: '700' }}>
                Areas to Improve
              </h3>
            </div>
            <ul style={{ 
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              lineHeight: '2',
              color: COLORS.text
            }}>
              {topWeaknesses.slice(0, 6).map((weakness, idx) => (
                <li key={idx}>{weakness}</li>
              ))}
              {topWeaknesses.length === 0 && <li style={{ opacity: 0.6 }}>Excellent performance across all areas!</li>}
            </ul>
          </div>
        </div>
  
        {/* Personalized Strategy */}
        <div style={{ 
          background: COLORS.card,
          padding: '20px',
          borderRadius: '12px',
          border: `2px solid ${COLORS.secondary}`,
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px'
          }}>
            <Target size={22} color={COLORS.secondary} />
            <h3 style={{ margin: 0, fontSize: '18px', color: COLORS.secondary, fontWeight: '700' }}>
              Personalized Study Strategy
            </h3>
          </div>
  
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Study Focus */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.secondary
              }}>
                <Brain size={16} />
                📚 Study Focus (Priority)
              </div>
              <div style={{ 
                padding: '12px',
                background: COLORS.bg,
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                {weakChapters.length > 0 && (
                  <>
                    <div>• <strong>Top Priority Chapters:</strong> {weakChapters.slice(0, 3).map(c => c.chapter).join(', ')}</div>
                    <div>• Dedicate 2-3 hours daily to these chapters</div>
                  </>
                )}
                {data.difficultyWise.find(d => d.difficulty === 'Hard')?.attemptRate < 50 && (
                  <div>• Practice 20-30 Hard difficulty questions daily</div>
                )}
                {easyDiff?.accuracy < 80 && (
                  <div>• Review Easy questions to eliminate silly mistakes</div>
                )}
                <div>• Focus on conceptual understanding, not just formulas</div>
              </div>
            </div>
  
            {/* Time Strategy */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.secondary
              }}>
                <Zap size={16} />
                ⏱️ Time Management Strategy
              </div>
              <div style={{ 
                padding: '12px',
                background: COLORS.bg,
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                {avgTimePerQ > 3 && (
                  <div>• <strong>Speed up:</strong> Practice with timer - target 2 min/question</div>
                )}
                {data.visitBuckets.multiple > 10 && (
                  <div>• <strong>Reduce revisits:</strong> Max 2 visits per question rule</div>
                )}
                {data.subjectTimeData.length > 0 && (
                  <div>• Balance time: {data.subjectTimeData.map(s => `${s.subject} (${s.percentage}%)`).join(', ')}</div>
                )}
                <div>• Take 30-second breaks after every 40 questions in practice</div>
                <div>• Practice full-length tests weekly to build stamina</div>
              </div>
            </div>
  
            {/* Attempt Strategy */}
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.secondary
              }}>
                <Activity size={16} />
                🎯 Attempt Strategy
              </div>
              <div style={{ 
                padding: '12px',
                background: COLORS.bg,
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                {data.overall.unattempted > data.overall.totalQuestions * 0.15 && (
                  <div>• <strong>Increase attempts:</strong> Target 85-90% attempt rate</div>
                )}
                {hardDiff?.attemptRate < 50 && (
                  <div>• Attempt Hard questions first when you're fresh</div>
                )}
                {data.reviewData.correctMarked < data.reviewData.wrongMarked && (
                  <div>• Trust first instinct more - review only if genuinely uncertain</div>
                )}
                {data.responses.filter(r => r.answer_change_count > 0 && !r.is_correct).length > 5 && (
                  <div>• Avoid changing answers unless you find a clear mistake</div>
                )}
                <div>• Mark for review strategically - only when stuck between 2 options</div>
              </div>
            </div>
          </div>
        </div>

    {/* What-If Analysis */}
    <div style={{ 
        background: `linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, ${COLORS.card} 100%)`,
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${COLORS.purple}`,
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '15px'
        }}>
          <AlertTriangle size={20} color={COLORS.purple} />
          <h3 style={{ margin: 0, fontSize: '16px', color: COLORS.purple, fontWeight: '700' }}>
            🔮 What-If Analysis
          </h3>
        </div>
        <div style={{ fontSize: '13px', lineHeight: '2', color: COLORS.text }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '10px',
            marginBottom: '12px'
          }}>
            {weakChapters.length > 0 && (
              <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '8px' }}>
                ✨ If you master weak chapters: <strong style={{ color: COLORS.correct }}>+{potentialFromChapters} marks</strong>
              </div>
            )}
            {data.overall.unattempted > 10 && (
              <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '8px' }}>
                ✨ If you attempt all questions (50% accuracy): <strong style={{ color: COLORS.correct }}>+{Math.floor(unattemptedMarks * 0.5)} marks</strong>
              </div>
            )}
            {data.overall.negativeMarks > 10 && (
              <div style={{ padding: '10px', background: COLORS.bg, borderRadius: '8px' }}>
                ✨ If you avoid silly mistakes: <strong style={{ color: COLORS.correct }}>+{Math.floor(negativeRecovery * 0.7)} marks</strong>
              </div>
            )}
          </div>
          <div style={{ 
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: `2px solid ${COLORS.border}`,
            fontSize: '16px',
            fontWeight: '700'
          }}>
            <span style={{ color: COLORS.text }}>Potential Score Improvement: </span>
            <span style={{ color: COLORS.secondary }}>{data.overall.marksObtained}</span>
            <span style={{ color: COLORS.text }}> → </span>
            <span style={{ color: COLORS.purple }}>{data.overall.marksObtained + totalPotential}</span>
            <span style={{ color: COLORS.correct, marginLeft: '10px' }}>(+{totalPotential} marks possible!)</span>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div style={{ 
        background: COLORS.card,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: COLORS.secondary, fontWeight: '700' }}>
          📋 Action Plan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ 
            padding: '15px',
            background: COLORS.bg,
            borderRadius: '10px',
            border: `1px solid ${COLORS.correct}`
          }}>
            <div style={{ 
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.correct,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎯 This Week
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              • 2-3 hrs on weak chapters<br/>
              • 50 practice questions daily<br/>
              • 1 sectional test<br/>
              • Review all mistakes
            </div>
          </div>

          <div style={{ 
            padding: '15px',
            background: COLORS.bg,
            borderRadius: '10px',
            border: `1px solid ${COLORS.secondary}`
          }}>
            <div style={{ 
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.secondary,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📊 Next Test
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              • Start with hard questions<br/>
              • Max 3 revisits per question<br/>
              • Target {data.overall.accuracy + 5}%+ accuracy<br/>
              • Maintain consistent pace
            </div>
          </div>

          <div style={{ 
            padding: '15px',
            background: COLORS.bg,
            borderRadius: '10px',
            border: `1px solid ${COLORS.purple}`
          }}>
            <div style={{ 
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.purple,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎓 Long Term
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              • Master all weak chapters<br/>
              • Weekly full-length tests<br/>
              • Track improvement trends<br/>
              • Build test stamina
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestAnalysisDashboard = ({ sessionIdProp }) => {
    const [activeTab, setActiveTab] = useState('performance');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
  
    const SUPABASE_URL = 'https://oevxskgzcgyujuooduhu.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldnhza2d6Y2d5dWp1b29kdWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQzNTUsImV4cCI6MjA4MzQ2MDM1NX0.qQY9CwjUSDN8x9jrDEgXDTjpctqpdjnBJEUdqplJELI';
  
    const COLORS = {
      primary: '#060818',
      secondary: '#F59E0B',
      correct: '#10B981',
      incorrect: '#EF4444',
      unattempted: '#6B7280',
      bg: '#1F2937',
      card: '#111827',
      text: '#F3F4F6',
      border: '#374151',
      purple: '#8B5CF6',
      blue: '#3B82F6'
    };
  
    // Auto-fetch data when sessionIdProp is provided
    useEffect(() => {
      if (sessionIdProp) {
        fetchTestData(sessionIdProp);
      }
    }, [sessionIdProp]);
  
    const fetchTestData = async (sid) => {
      setLoading(true);
      setError('');
  
      try {
        // Fetch user responses
        const responsesRes = await fetch(
          `${SUPABASE_URL}/rest/v1/user_responses?session_id=eq.${sid}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (!responsesRes.ok) throw new Error('Failed to fetch responses');
        const responses = await responsesRes.json();
  
        if (!responses || responses.length === 0) {
          setError('No data found for this session ID');
          setLoading(false);
          return;
        }
  
        // Fetch questions details
        const questionIds = [...new Set(responses.map(r => r.question_id))];
        const questionsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/questions?id=in.(${questionIds.join(',')})&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (!questionsRes.ok) throw new Error('Failed to fetch questions');
        const questions = await questionsRes.json();
  
        // Fetch test session
        const sessionRes = await fetch(
          `${SUPABASE_URL}/rest/v1/test_sessions?id=eq.${sid}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (!sessionRes.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionRes.json();
        const session = sessionData[0];
  
        processData(responses, questions, session);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading data: ' + error.message);
      }
      setLoading(false);
    };
  
    const processData = (responses, questions, session) => {
      const questionMap = {};
      questions.forEach(q => {
        questionMap[q.id] = q;
      });
  
      // Overall Performance
      const correct = responses.filter(r => r.is_correct).length;
      const incorrect = responses.filter(r => r.is_answered && !r.is_correct).length;
      const unattempted = responses.filter(r => !r.is_attempted).length;
      
      let totalPositiveMarks = 0;
      let negativeMarks = 0;
      let maxPossibleMarks = 0;
      
      responses.forEach(r => {
        const q = questionMap[r.question_id];
        if (!q) return;
        
        maxPossibleMarks += q.positive_marks || 4;
        
        if (r.is_correct) {
          totalPositiveMarks += q.positive_marks || 4;
        } else if (r.is_answered && !r.is_correct) {
          negativeMarks += Math.abs(q.negative_marks || 1);
        }
      });
  
      const marksObtained = totalPositiveMarks - negativeMarks;
      const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;
  
      // Subject-wise Performance
      const subjectStats = {};
      responses.forEach(r => {
        const q = questionMap[r.question_id];
        if (!q || !q.subject) return;
        
        if (!subjectStats[q.subject]) {
          subjectStats[q.subject] = {
            subject: q.subject,
            correct: 0,
            incorrect: 0,
            total: 0,
            attempted: 0,
            timeSpent: 0,
            marks: 0,
            maxMarks: 0
          };
        }
        
        const stat = subjectStats[q.subject];
        stat.total++;
        stat.maxMarks += q.positive_marks || 4;
        stat.timeSpent += r.time_spent_seconds || 0;
        
        if (r.is_attempted) stat.attempted++;
        if (r.is_correct) {
          stat.correct++;
          stat.marks += q.positive_marks || 4;
        } else if (r.is_answered) {
          stat.incorrect++;
          stat.marks -= Math.abs(q.negative_marks || 1);
        }
      });
  
      const subjectWise = Object.values(subjectStats).map(s => ({
        ...s,
        accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0
      }));
  
      // Chapter-wise Accuracy
      const chapterStats = {};
      responses.forEach(r => {
        const q = questionMap[r.question_id];
        if (!q || !q.chapter) return;
        
        if (!chapterStats[q.chapter]) {
          chapterStats[q.chapter] = { 
            chapter: q.chapter, 
            correct: 0, 
            attempted: 0,
            total: 0,
            subject: q.subject
          };
        }
        
        chapterStats[q.chapter].total++;
        if (r.is_attempted) {
          chapterStats[q.chapter].attempted++;
          if (r.is_correct) chapterStats[q.chapter].correct++;
        }
      });
  
      const chapterWise = Object.values(chapterStats)
        .filter(c => c.attempted > 0)
        .map(c => ({
          ...c,
          accuracy: Math.round((c.correct / c.attempted) * 100)
        }))
        .sort((a, b) => b.accuracy - a.accuracy);
  
      // Difficulty-wise Performance
      const difficultyStats = {};
      ['Easy', 'Medium', 'Hard'].forEach(d => {
        difficultyStats[d] = { difficulty: d, correct: 0, attempted: 0, total: 0 };
      });
  
      responses.forEach(r => {
        const q = questionMap[r.question_id];
        if (!q || !q.difficulty) return;
        
        const difficulty = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase();
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { difficulty, correct: 0, attempted: 0, total: 0 };
        }
        
        difficultyStats[difficulty].total++;
        if (r.is_attempted) {
          difficultyStats[difficulty].attempted++;
          if (r.is_correct) difficultyStats[difficulty].correct++;
        }
      });
  
      const difficultyWise = Object.values(difficultyStats).map(d => ({
        difficulty: d.difficulty,
        accuracy: d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0,
        attemptRate: d.total > 0 ? Math.round((d.attempted / d.total) * 100) : 0
      }));
  
      // Time vs Marks
      const timeVsMarks = responses
        .filter(r => r.is_attempted && r.time_spent_seconds > 0)
        .map(r => {
          const q = questionMap[r.question_id];
          return {
            time: Math.round(r.time_spent_seconds / 60 * 10) / 10,
            correct: r.is_correct ? 1 : 0,
            marks: r.is_correct ? (q?.positive_marks || 4) : -(q?.negative_marks || 1)
          };
        });
  
      // Subject Time Distribution
      const subjectTimeData = subjectWise.map(s => ({
        subject: s.subject,
        time: Math.round(s.timeSpent / 60),
        percentage: 0
      }));
      
      const totalTime = subjectTimeData.reduce((sum, s) => sum + s.time, 0);
      subjectTimeData.forEach(s => {
        s.percentage = totalTime > 0 ? Math.round((s.time / totalTime) * 100) : 0;
      });
  
      // Section Timeline
      const sectionTimeline = [];
      const uniqueSections = {};
      
      responses.forEach(r => {
        if (r.section_id && !uniqueSections[r.section_id]) {
          uniqueSections[r.section_id] = {
            section: r.section_name || `Section ${Object.keys(uniqueSections).length + 1}`,
            entryTime: r.section_entry_timestamp,
            exitTime: r.section_exit_timestamp,
            duration: r.section_time_spent_seconds || 0
          };
        }
      });
      
      Object.values(uniqueSections).forEach(s => sectionTimeline.push(s));
  
      // Visit Count Analysis
      const visitStats = responses.map(r => ({
        visits: r.total_visits || 1,
        correct: r.is_correct ? 1 : 0
      }));
  
      const visitBuckets = {
        single: visitStats.filter(v => v.visits === 1).length,
        two_three: visitStats.filter(v => v.visits >= 2 && v.visits <= 3).length,
        multiple: visitStats.filter(v => v.visits > 3).length
      };
  
      // Review Analysis
      const reviewData = {
        markedOnly: responses.filter(r => r.is_marked_for_review && !r.is_answered).length,
        markedAndAnswered: responses.filter(r => r.is_marked_for_review && r.is_answered).length,
        notMarked: responses.filter(r => !r.is_marked_for_review && r.is_answered).length,
        correctMarked: responses.filter(r => r.is_marked_for_review && r.is_correct).length,
        wrongMarked: responses.filter(r => r.is_marked_for_review && r.is_answered && !r.is_correct).length
      };
  
      setData({
        overall: {
          totalQuestions: responses.length,
          correct,
          incorrect,
          unattempted,
          marksObtained,
          totalPositiveMarks,
          maxPossibleMarks,
          negativeMarks,
          accuracy
        },
        subjectWise,
        chapterWise,
        difficultyWise,
        timeVsMarks,
        subjectTimeData,
        sectionTimeline,
        visitStats,
        visitBuckets,
        reviewData,
        responses,
        questionMap,
        session
      });
    };

    // Render
  if (loading) {
    return (
      <div style={{ 
        background: COLORS.primary, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading your test analysis...</div>
          <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>Processing questions...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        background: COLORS.primary, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>No Analysis Data Available</div>
          <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
            {error || 'Please submit a test first to see analysis.'}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'performance', label: '📊 Performance' },
    { id: 'time', label: '⏱️ Time Analysis' },
    { id: 'psychology', label: '🧠 Psychology' },
    { id: 'summary', label: '📋 Summary' }
  ];

  return (
    <div style={{ 
      background: COLORS.primary, 
      minHeight: '100vh', 
      color: COLORS.text, 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        background: COLORS.card, 
        padding: '15px 20px', 
        borderBottom: `2px solid ${COLORS.secondary}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: COLORS.secondary, fontWeight: '700' }}>
            🎯 Test Analysis Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px' }}>
            <div>
              <span style={{ color: COLORS.text, opacity: 0.7 }}>Score: </span>
              <span style={{ color: COLORS.secondary, fontWeight: '700', fontSize: '18px' }}>
                {data.overall.marksObtained}
              </span>
              <span style={{ color: COLORS.unattempted }}> / {data.overall.maxPossibleMarks}</span>
            </div>
            <div>
              <span style={{ color: COLORS.text, opacity: 0.7 }}>Accuracy: </span>
              <span style={{ color: COLORS.correct, fontWeight: '700', fontSize: '18px' }}>
                {data.overall.accuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        background: COLORS.card, 
        padding: '12px 20px', 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto',
        borderBottom: `1px solid ${COLORS.border}`
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? COLORS.secondary : 'transparent',
              border: activeTab === tab.id ? 'none' : `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              color: activeTab === tab.id ? COLORS.primary : COLORS.text,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content - Render appropriate tab */}
      <div style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
        {activeTab === 'performance' && <PerformanceTab data={data} />}
        {activeTab === 'time' && <TimeAnalysisTab data={data} />}
        {activeTab === 'psychology' && <PsychologyTab data={data} />}
        {activeTab === 'summary' && <SummaryTab data={data} />}
      </div>
    </div>
  );
};

export default TestAnalysisDashboard;