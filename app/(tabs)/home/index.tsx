import { AppPage } from '@/components/app-page'
import { AppView } from '@/components/app-view'
import { TabPageLayout } from '@/components/layouts/TabPageLayout'
import ClipSection from '@/components/video/video'
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function Bracket() {
  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppView style={{ alignItems: 'center', gap: 4, paddingBottom: 20 }}>
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
    fontWeight: 'bold',
  },
  section: {
    width: '100%',
    marginTop: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 16,
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
  },
  sectionSubtitle: {
    color: '#CB9A20'
  },
  sectionBox: {
    backgroundColor: '#444',
    padding: 20,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
})
