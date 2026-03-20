import React from 'react';
import { logger } from '../lib/logger.js';

// Define styles for PDF dynamically to avoid early initialization if possible
// but styles are usually safe. The main thing is the heavy ReactPDF library.

interface EstimateData {
  name: string;
  projectType: string;
  estimation: {
    summary: string;
    hours: { min: number; max: number };
    cost: { min: number; max: number; currency: string };
    milestones: { title: string; duration: string; description: string }[];
    techSuggestions: string[];
  };
}

export class PdfService {
  async generateScopeEstimate(data: EstimateData): Promise<Buffer> {
    try {
      const { default: ReactPDF, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      
      const styles = StyleSheet.create({
        page: {
          padding: 50,
          fontFamily: 'Helvetica',
          fontSize: 10,
          color: '#334155',
          backgroundColor: '#ffffff',
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          borderBottom: '2pt solid #4f46e5',
          paddingBottom: 15,
        },
        brandName: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b',
          letterSpacing: 1,
        },
        docType: {
          fontSize: 10,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 2,
        },
        titleSection: {
          marginBottom: 25,
        },
        title: {
          fontSize: 26,
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 11,
          color: '#64748b',
        },
        section: {
          marginBottom: 25,
        },
        sectionTitle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#4f46e5',
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          borderLeft: '3pt solid #4f46e5',
          paddingLeft: 10,
        },
        summaryText: {
          lineHeight: 1.6,
          color: '#475569',
        },
        statsContainer: {
          flexDirection: 'row',
          gap: 20,
          marginVertical: 15,
        },
        statCard: {
          flex: 1,
          padding: 15,
          backgroundColor: '#f8fafc',
          borderRadius: 8,
          border: '1pt solid #e2e8f0',
        },
        statLabel: {
          fontSize: 8,
          color: '#64748b',
          textTransform: 'uppercase',
          marginBottom: 4,
        },
        statValue: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1e293b',
        },
        milestoneItem: {
          marginBottom: 15,
          paddingLeft: 10,
          borderLeft: '1pt solid #e2e8f0',
        },
        milestoneHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 3,
        },
        milestoneTitle: {
          fontWeight: 'bold',
          fontSize: 11,
          color: '#1e293b',
        },
        milestoneDuration: {
          fontSize: 9,
          color: '#4f46e5',
          fontWeight: 'bold',
        },
        milestoneDesc: {
          fontSize: 9,
          lineHeight: 1.4,
          color: '#64748b',
        },
        techBadge: {
          fontSize: 9,
          color: '#4f46e5',
          backgroundColor: '#eff6ff',
          padding: '4 8',
          borderRadius: 4,
          marginRight: 5,
          marginBottom: 5,
        },
        footer: {
          position: 'absolute',
          bottom: 40,
          left: 50,
          right: 50,
          textAlign: 'center',
          fontSize: 8,
          color: '#94a3b8',
          borderTop: '1pt solid #f1f5f9',
          paddingTop: 15,
        },
      });

      const EstimateDocument = ({ data }: { data: EstimateData }) => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.brandName}>ABDHE.DEV</Text>
              <Text style={styles.docType}>Project Scope Estimate</Text>
            </View>
      
            <View style={styles.titleSection}>
              <Text style={styles.title}>{data.projectType}</Text>
              <Text style={styles.subtitle}>Prepared for {data.name} • {new Date().toLocaleDateString()}</Text>
            </View>
      
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <Text style={styles.summaryText}>{data.estimation.summary}</Text>
            </View>
      
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>High-Level Estimation</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Timeline Range</Text>
                  <Text style={styles.statValue}>{data.estimation.hours.min} - {data.estimation.hours.max} Hours</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Budget Indication</Text>
                  <Text style={styles.statValue}>
                    {data.estimation.cost.min.toLocaleString()} - {data.estimation.cost.max.toLocaleString()} {data.estimation.cost.currency}
                  </Text>
                </View>
              </View>
            </View>
      
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proposed Milestones</Text>
              {data.estimation.milestones.map((m, i) => (
                <View key={i} style={styles.milestoneItem}>
                  <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                    <Text style={styles.milestoneDuration}>{m.duration}</Text>
                  </View>
                  <Text style={styles.milestoneDesc}>{m.description}</Text>
                </View>
              ))}
            </View>
      
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technical Recommendations</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {data.estimation.techSuggestions.map((tech, i) => (
                  <Text key={i} style={styles.techBadge}>{tech}</Text>
                ))}
              </View>
            </View>
      
            <View style={[styles.section, { marginTop: 20, padding: 15, backgroundColor: '#f0f9ff', borderRadius: 8 }]}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0369a1', marginBottom: 5 }}>Next Steps & Discovery</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.5, color: '#0c4a6e' }}>
                This automated estimate serves as a baseline for our technical discovery. To proceed, we should schedule a 30-minute deep-dive call to refine these requirements and finalize the architectural approach.
              </Text>
            </View>
      
            <Text style={styles.footer}>
              {data.name.toUpperCase()} PORTFOLIO | Confidential Project Estimate | Generated by AI discovery engine.
              Final pricing is subject to technical discovery and signed master service agreement.
            </Text>
          </Page>
        </Document>
      );

      const buffer = await ReactPDF.renderToBuffer(<EstimateDocument data={data} />);
      return buffer;
    } catch (error) {
      logger.error({ error, data }, 'Failed to generate PDF');
      throw error;
    }
  }
}

export const pdfService = new PdfService();
