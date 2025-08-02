import { AppPage } from '@/components/app-page';
import { AppView } from '@/components/app-view';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import ClipSection from '@/components/video/video';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Bracket() {
  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppView style={{ alignItems: 'center', gap: 4 }}>
            {/* Featured Clips Section */}
            <AppView style={styles.section}>
              <AppView style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Clips</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </AppView>
              <Text style={styles.sectionSubtitle}>from this week</Text>
              <ClipSection link="https://www.youtube.com/watch?v=DpDYulDOTlk" />
            </AppView>


            {/* Recorded Races Section */}
            <AppView style={styles.section}>
              <AppView style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recorded Replays</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </AppView>
              <Text style={styles.sectionSubtitle}>by most recent</Text>
              <ClipSection link="https://www.youtube.com/watch?v=TUBkpBW5r80" />
            </AppView>
          </AppView>
        </ScrollView>
      </AppPage>
    </TabPageLayout>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonText: {
    color: '#938D4B',
    fontFamily: 'Semplicita-Bold',
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Semplicita'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  seeAllText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Semplicita'
  },
  sectionSubtitle: {
    color: '#CB9A20',
    fontFamily: 'Semplicita'
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Semplicita'
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Semplicita'
  },
})