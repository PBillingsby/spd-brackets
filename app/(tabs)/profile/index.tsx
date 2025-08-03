import { useMobileWallet } from '@/components/solana/use-mobile-wallet';
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
import { AppConfig } from '@/constants/app-config';

export default function Settings() {
  const { selectedAccount, deauthorizeSessions } = useAuthorization();
  const { data: usdcBalance } = useGetTokenBalance({ address: selectedAccount?.publicKey! });
  const { signIn } = useMobileWallet();
  const insets = useSafeAreaInsets();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [user, setUser] = useState(null);

  const handleHelpPress = () => Linking.openURL('https://help.example.com');
  const handleTermsPress = () => Linking.openURL('https://example.com/terms');
  const FOOTER_HEIGHT = 56;

  useEffect(() => {
    const loadUser = async () => {
      if (!selectedAccount?.publicKey) return;
      try {
        const userData = await getUser(selectedAccount.publicKey);
        setUser(userData);
        setEditedUsername(userData?.username ?? '');
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
      setUser(prev => ({ ...prev, profile_image: result.assets[0].uri }));
    }
  };

  return (
    <TabPageLayout>
      <AppPage>
        {!selectedAccount ? (
          <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => signIn({ uri: AppConfig.uri })}
              style={{
                backgroundColor: '#DAA520',
                marginTop: 12,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 8
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Semplicita' }}>Sign In</Text>
            </TouchableOpacity>
          </AppView>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + insets.bottom + 24 }}
            >
              <AppView style={{ alignItems: 'center', paddingVertical: 24, gap: 16 }}>
                <AppView style={{ alignItems: 'center', flexDirection: 'row', paddingVertical: 24, gap: 16 }}>
                  <Image
                    source={user?.profile_image ? { uri: user.profile_image } : require('../../../assets/images/profile/placeholder.png')}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                    resizeMode="cover"
                  />
                  <AppView style={{ alignItems: 'center' }}>
                    <Text style={usernameTextStyle}>{user?.username || ''}</Text>
                    <Text style={addressTextStyle}>{formatSolanaAddress(selectedAccount?.publicKey ?? '')}</Text>
                    <Text style={balanceTextStyle}>Balance: {parseInt(usdcBalance).toFixed(2)} USDC</Text>
                  </AppView>
                </AppView>

                <AppView style={{ width: '100%', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/images/shared/union.png')}
                    style={{ width: '100%', aspectRatio: 12, resizeMode: 'contain' }}
                  />
                </AppView>

                <AppView style={{ gap: 16, width: '100%', paddingHorizontal: 24 }}>
                  <TouchableOpacity onPress={() => setShowEditModal(true)}>
                    <Text style={editProfileTextStyle}>Edit Profile</Text>
                  </TouchableOpacity>
                </AppView>
              </AppView>
            </ScrollView>

            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={handleHelpPress} style={footerButtonStyle}>
                  <Image source={require('../../../assets/images/profile/circle-question.png')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  <Text style={footerButtonTextStyle}>Support Bay</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deauthorizeSessions()} style={footerButtonStyle}>
                  <Text style={footerButtonTextStyle}>Sign Out</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTermsPress} style={footerButtonStyle}>
                  <Image source={require('../../../assets/images/profile/book.png')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  <Text style={footerButtonTextStyle}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Modal animationType="slide" transparent visible={showEditModal}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#1C1C1E', padding: 24, borderRadius: 12, width: '80%' }}>
                  <Text style={modalTitleTextStyle}>Edit Username</Text>
                  <TextInput
                    placeholder="New username"
                    placeholderTextColor="#888"
                    value={editedUsername}
                    onChangeText={setEditedUsername}
                    style={[textInputStyle, { fontFamily: 'Semplicita' }]}
                  />
                  <TouchableOpacity onPress={handlePickImage} style={imagePickerStyle}>
                    <Text style={changePhotoTextStyle}>Change Profile Picture</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                    <TouchableOpacity onPress={() => setShowEditModal(false)}>
                      <Text style={modalButtonTextStyle}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await updateUserProfile(selectedAccount?.publicKey ?? '', {
                            username: editedUsername,
                            profile_image: user?.profile_image ?? '',
                          });
                          setUser(prev => prev ? { ...prev, username: editedUsername } : prev);
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
        )}
      </AppPage>
    </TabPageLayout>
  );
}

const usernameTextStyle = { fontFamily: 'Semplicita-Bold', fontSize: 18, color: 'white' };
const addressTextStyle = { color: '#A0A0A0', fontSize: 14, fontFamily: 'Semplicita' };
const balanceTextStyle = { color: '#A0A0A0', fontSize: 14, fontFamily: 'Semplicita' };
const editProfileTextStyle = { color: 'white', fontSize: 16, textAlign: 'center', fontFamily: 'Semplicita' };
const footerButtonTextStyle = { color: '#A0A0A0', fontSize: 14, fontFamily: 'Semplicita' };
const footerButtonStyle = { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#A0A0A0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, gap: 8 };
const modalTitleTextStyle = { fontFamily: 'Semplicita-Bold', fontSize: 18, marginBottom: 12, color: 'white' };
const textInputStyle = { borderWidth: 1, borderColor: '#3A3A3C', backgroundColor: '#2C2C2E', color: 'white', borderRadius: 8, padding: 12, marginBottom: 16 };
const changePhotoTextStyle = { color: '#FFD700', fontFamily: 'Semplicita' };
const modalButtonTextStyle = { color: '#A0A0A0', fontFamily: 'Semplicita' };
const modalSaveButtonTextStyle = { color: '#FFD700', fontFamily: 'Semplicita-Bold' };
const imagePickerStyle = { backgroundColor: '#2C2C2E', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' };