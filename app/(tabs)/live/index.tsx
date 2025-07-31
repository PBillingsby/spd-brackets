import { AppPage } from '@/components/app-page'
import { AppView } from '@/components/app-view'
import { TabPageLayout } from '@/components/layouts/TabPageLayout'
import { ScrollView, Text } from 'react-native'

export default function Live() {
  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppView style={{ alignItems: 'center', gap: 4, paddingBottom: 20 }}>
            {/* Live Section */}
            <AppView style={{ width: '100%', marginTop: 32 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                Live
              </Text>
              <AppView style={{ 
                backgroundColor: '#F2F2F7', 
                padding: 20, 
                borderRadius: 12,
                minHeight: 150,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 16, color: '#8E8E93' }}>
                  Live streams will appear here
                </Text>
                <Text style={{ fontSize: 14, color: '#8E8E93', marginTop: 8 }}>
                  Active games • Real-time updates • Live betting
                </Text>
              </AppView>
            </AppView>

            {/* Interviews Section */}
            <AppView style={{ width: '100%', marginTop: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                Interviews
              </Text>
              <AppView style={{ 
                backgroundColor: '#F2F2F7', 
                padding: 20, 
                borderRadius: 12,
                minHeight: 150,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 16, color: '#8E8E93' }}>
                  Player interviews will appear here
                </Text>
                <Text style={{ fontSize: 14, color: '#8E8E93', marginTop: 8 }}>
                  Post-game • Pre-game • Coach interviews
                </Text>
              </AppView>
            </AppView>
          </AppView>
        </ScrollView>
      </AppPage>
    </TabPageLayout>
  )
}