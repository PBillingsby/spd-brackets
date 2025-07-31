import { useGetTokenBalance } from '@/components/account/use-get-balance';
import { AppPage } from '@/components/app-page';
import { AppView } from '@/components/app-view';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { updateUserProfile } from '@/lib/db/users';
import { formatSolanaAddress } from '@/utils/solana';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
  const { selectedAccount } = useAuthorization();
  const { data: usdcBalance } = useGetTokenBalance({ address: selectedAccount?.publicKey! })

  // TODO - USDC Address: DJBQS9SCLe63SJnJJjTMupwAM2a1DgiA15tosFCcAK13
  console.log("----", usdcBalance)
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const handleHelpPress = () => Linking.openURL('https://help.example.com');
  const handleTermsPress = () => Linking.openURL('https://example.com/terms');

  const FOOTER_HEIGHT = 56;

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setProfileImage(selectedUri);
    }
  };
  
  return (
    <TabPageLayout>
      <AppPage>
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: FOOTER_HEIGHT + insets.bottom + 24, // keep content above the fixed footer
            }}
          >
            <AppView style={{ alignItems: 'center', paddingVertical: 24, gap: 16 }}>
              {/* Profile row */}
              <AppView
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingVertical: 24,
                  gap: 16,
                }}
              >
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('../../../assets/images/profile/placeholder.png')
                  }
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  resizeMode="cover"
                />

                <AppView style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>
                    {username || 'Username'}
                  </Text>
                  <Text style={{ color: '#A0A0A0', fontSize: 14 }}>{formatSolanaAddress(selectedAccount?.publicKey  ?? '')}</Text>
                  <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Balance: {parseInt(usdcBalance).toFixed(2)} USDC</Text>
                </AppView>
              </AppView>

              {/* Divider */}
              <AppView style={{ width: '100%', alignItems: 'center' }}>
                <Image
                  source={require('../../../assets/images/shared/union.png')}
                  style={{
                    width: '100%',
                    aspectRatio: 12,
                    resizeMode: 'contain',
                  }}
                />
              </AppView>

              {/* Edit profile */}
              <AppView style={{ gap: 16, width: '100%', paddingHorizontal: 24 }}>
                <TouchableOpacity onPress={() => setShowEditModal(true)}>
                  <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </AppView>
            </AppView>
          </ScrollView>

          {/* Fixed footer */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingTop: 12,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                onPress={handleHelpPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#A0A0A0',
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  gap: 8,
                }}
              >
                <Image
                  source={require('../../../assets/images/profile/circle-question.png')}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Support Bay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTermsPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#A0A0A0',
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  gap: 8,
                }}
              >
                <Image
                  source={require('../../../assets/images/profile/book.png')}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Terms of Service</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Edit Profile Modal */}
          <Modal animationType="slide" transparent visible={showEditModal}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 24,
                  borderRadius: 12,
                  width: '80%',
                }}
              >
                <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 12 }}>
                  Edit Username
                </Text>

                {/* Username input */}
                <TextInput
                  placeholder="New username"
                  value={username}
                  onChangeText={setUsername}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                />

                {/* Profile Picture upload */}
                <TouchableOpacity
                  onPress={handlePickImage} // implement this handler
                  style={{
                    backgroundColor: '#F2F2F7',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#007AFF' }}>Change Profile Picture</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <Text style={{ color: '#007AFF' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        // TODO - Replace this with dynamic solana address
                        await updateUserProfile(selectedAccount?.publicKey, {
                          username,
                          profile_image: profileImage,
                        });

                        setShowEditModal(false);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <Text style={{ color: '#007AFF', fontWeight: '600' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </AppPage>
    </TabPageLayout>
  );
}
