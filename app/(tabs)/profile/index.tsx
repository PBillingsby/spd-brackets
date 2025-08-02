import { useGetTokenBalance } from '@/components/account/use-get-balance';
import { AppPage } from '@/components/app-page';
import { AppView } from '@/components/app-view';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { getUser, updateUserProfile } from '@/lib/db/users';
import { formatSolanaAddress } from '@/utils/solana';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
  const { selectedAccount } = useAuthorization();
  const { data: usdcBalance } = useGetTokenBalance({ address: selectedAccount?.publicKey! })

  // TODO - USDC Address: DJBQS9SCLe63SJnJJjTMupwAM2a1DgiA15tosFCcAK13
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [user, setUser] = useState<{ username: string; profile_image: string } | null>(null);
  const handleHelpPress = () => Linking.openURL('https://help.example.com');
  const handleTermsPress = () => Linking.openURL('https://example.com/terms');

  const FOOTER_HEIGHT = 56;

  useEffect(() => {
    const loadUser = async () => {
      if (!selectedAccount?.publicKey) return;
  
      try {
        const userData = await getUser(selectedAccount.publicKey);
        setUser(userData);
        setUsername(userData?.username ?? '');
        setProfileImage(userData?.profile_image ?? '');
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
  
    loadUser();
  }, [selectedAccount?.publicKey]);
  
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
                      ? { uri: user?.profile_image }
                      : require('../../../assets/images/profile/placeholder.png')
                  }
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  resizeMode="cover"
                />

                <AppView style={{ alignItems: 'center' }}>
                  <Text style={usernameTextStyle}>
                    {user?.username || ''}
                  </Text>
                  <Text style={addressTextStyle}>{formatSolanaAddress(selectedAccount?.publicKey  ?? '')}</Text>
                  <Text style={balanceTextStyle}>Balance: {parseInt(usdcBalance).toFixed(2)} USDC</Text>
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
                  <Text style={editProfileTextStyle}>
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
                <Text style={footerButtonTextStyle}>Support Bay</Text>
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
                <Text style={footerButtonTextStyle}>Terms of Service</Text>
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
                <Text style={modalTitleTextStyle}>
                  Edit Username
                </Text>

                {/* Username input */}
                <TextInput
                  placeholder="New username"
                  value={username}
                  onChangeText={setUsername}
                  style={[textInputStyle, { fontFamily: 'Semplicita' }]}
                />

                {/* Profile Picture upload */}
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={{
                    backgroundColor: '#F2F2F7',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={changePhotoTextStyle}>Change Profile Picture</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <Text style={modalButtonTextStyle}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        // TODO - Replace this with dynamic solana address
                        await updateUserProfile(selectedAccount?.publicKey ?? '', {
                          username,
                          profile_image: profileImage,
                        });

                        setShowEditModal(false);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <Text style={modalSaveButtonTextStyle}>Save</Text>
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

// Styles with Semplicita fonts
const usernameTextStyle = {
  fontFamily: 'Semplicita-Bold',
  fontSize: 18,
  color: 'white'
};

const addressTextStyle = {
  color: '#A0A0A0',
  fontSize: 14,
  fontFamily: 'Semplicita'
};

const balanceTextStyle = {
  color: '#A0A0A0',
  fontSize: 14,
  fontFamily: 'Semplicita'
};

const editProfileTextStyle = {
  color: 'white',
  fontSize: 16,
  textAlign: 'center' as const,
  fontFamily: 'Semplicita'
};

const footerButtonTextStyle = {
  color: '#A0A0A0',
  fontSize: 14,
  fontFamily: 'Semplicita'
};

const modalTitleTextStyle = {
  fontFamily: 'Semplicita-Bold',
  fontSize: 18,
  marginBottom: 12
};

const textInputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
};

const changePhotoTextStyle = {
  color: '#007AFF',
  fontFamily: 'Semplicita'
};

const modalButtonTextStyle = {
  color: '#007AFF',
  fontFamily: 'Semplicita'
};

const modalSaveButtonTextStyle = {
  color: '#007AFF',
  fontFamily: 'Semplicita-Bold'
};